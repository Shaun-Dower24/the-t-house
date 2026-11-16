"use client";

// Stroke Text: when the tag first scrolls into view, white outlines trace each letter, red paint fills
// it and the outline fades, then the real heading text takes over again. The heading renders as plain
// text on the server, without JavaScript and with reduced motion. The drawing layer is aria-hidden.

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { graphemes, loadGsap, visibleTextNodes, watchTextMotion } from "@/lib/text-motion";

type Gsap = typeof import("gsap").gsap;
type Glyph = { char: string; x: number; y: number };

const svgNamespace = "http://www.w3.org/2000/svg";
/** Longest letter outline in the tag font is about 4.6 em, so this dash covers every letter. */
const outlineEm = 4.7;
const drawSeconds = 0.95;
const letterGap = 0.055;

/** Positions each visible character in the heading's own (unrotated) coordinate space. */
function measureGlyphs(heading: HTMLElement, node: Text): Glyph[] {
  const savedTransform = heading.style.transform;
  heading.style.transform = "none";
  try {
    const box = heading.getBoundingClientRect();
    const originX = box.left + heading.clientLeft;
    const originY = box.top + heading.clientTop;
    const marker = document.createElement("span");
    marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    node.before(marker);
    const baseline = marker.getBoundingClientRect().top;
    marker.remove();

    const range = document.createRange();
    const glyphs: Glyph[] = [];
    let ascent: number | undefined;
    let index = 0;
    for (const char of graphemes(node.data)) {
      const start = index;
      index += char.length;
      if (!char.trim()) continue;
      range.setStart(node, start);
      range.setEnd(node, index);
      const rect = Array.from(range.getClientRects()).find((part) => part.width > 0) ?? range.getBoundingClientRect();
      ascent ??= baseline - rect.top;
      glyphs.push({ char, x: rect.left - originX, y: rect.top + ascent - originY });
    }
    return glyphs;
  } finally {
    heading.style.transform = savedTransform;
  }
}

function buildInk(heading: HTMLElement, node: Text) {
  const style = getComputedStyle(heading);
  const fontSize = Number.parseFloat(style.fontSize);
  const glyphs = measureGlyphs(heading, node);
  const dash = outlineEm * fontSize;
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("class", "stroke-tag-ink");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("width", String(heading.clientWidth));
  svg.setAttribute("height", String(heading.clientHeight));

  const layer = (name: string) => {
    const group = document.createElementNS(svgNamespace, "g");
    group.setAttribute("class", name);
    group.style.fontFamily = style.fontFamily;
    group.style.fontSize = `${fontSize}px`;
    group.style.fontWeight = style.fontWeight;
    group.style.fontStyle = style.fontStyle;
    svg.append(group);
    return group;
  };
  const fills = layer("stroke-tag-fill");
  const outlines = layer("stroke-tag-outline");
  outlines.style.strokeWidth = `${Math.max(1.1, fontSize * 0.016)}px`;

  const letters = glyphs.map(({ char, x, y }) => {
    const make = (group: SVGGElement) => {
      const text = document.createElementNS(svgNamespace, "text");
      text.setAttribute("x", x.toFixed(2));
      text.setAttribute("y", y.toFixed(2));
      text.textContent = char;
      group.append(text);
      return text;
    };
    const fill = make(fills);
    fill.style.opacity = "0";
    const outline = make(outlines);
    outline.style.strokeDasharray = `${dash}px ${dash}px`;
    outline.style.strokeDashoffset = `${dash}px`;
    return { fill, outline };
  });
  return { svg, letters };
}

function play(gsap: Gsap, letters: ReturnType<typeof buildInk>["letters"], onComplete: () => void) {
  const timeline = gsap.timeline({ onComplete });
  letters.forEach(({ fill, outline }, index) => {
    const at = index * letterGap;
    timeline
      .to(outline, { strokeDashoffset: 0, autoRound: false, duration: drawSeconds, ease: "power1.inOut" }, at)
      .to(fill, { opacity: 1, duration: 0.38, ease: "power2.out" }, at + drawSeconds * 0.58)
      .to(outline, { opacity: 0, duration: 0.32, ease: "power1.out" }, at + drawSeconds * 0.86);
  });
  return timeline;
}

/** Arms the heading below the fold and plays once when it scrolls into view. Returns a cleanup. */
function arm(heading: HTMLElement, onStart: () => void) {
  const node = visibleTextNodes(heading)[0];
  if (!node) return () => {};
  let disposed = false;
  let playing = false;
  let ink: ReturnType<typeof buildInk> | undefined;
  let timeline: ReturnType<typeof play> | undefined;
  let size = "";
  let visibility: IntersectionObserver | undefined;
  let resize: ResizeObserver | undefined;

  const settle = () => {
    visibility?.disconnect();
    resize?.disconnect();
    timeline?.kill();
    ink?.svg.remove();
    ink = undefined;
    delete heading.dataset.strokeTag;
  };
  const build = () => {
    ink?.svg.remove();
    ink = buildInk(heading, node);
    heading.append(ink.svg);
  };

  const style = getComputedStyle(heading);
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  void Promise.all([loadGsap(), document.fonts?.load(font, node.data)]).then(([gsap]) => {
    if (disposed) return;
    if (heading.getBoundingClientRect().top < window.innerHeight) {
      onStart();
      return;
    }
    build();
    heading.dataset.strokeTag = "armed";
    size = `${heading.clientWidth}x${heading.clientHeight}`;
    resize = new ResizeObserver(() => {
      const next = `${heading.clientWidth}x${heading.clientHeight}`;
      if (next === size) return;
      size = next;
      if (playing) timeline?.progress(1);
      else build();
    });
    resize.observe(heading);
    visibility = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || !ink) return;
      visibility?.disconnect();
      playing = true;
      onStart();
      heading.dataset.strokeTag = "playing";
      timeline = play(gsap, ink.letters, settle);
    }, { rootMargin: "0px 0px -20% 0px" });
    visibility.observe(heading);
  }).catch(settle);

  return () => {
    disposed = true;
    settle();
  };
}

type StrokeTagProps = Omit<ComponentPropsWithoutRef<"h2">, "children"> & { children: string };

export function StrokeTag({ children, className, ...props }: StrokeTagProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = ref.current;
    if (!heading) return;
    let started = false;
    let cleanup: (() => void) | undefined;
    const stopWatching = watchTextMotion(heading, (allowed) => {
      cleanup?.();
      cleanup = allowed && !started ? arm(heading, () => { started = true; }) : undefined;
    });
    return () => {
      stopWatching();
      cleanup?.();
    };
  }, [children]);

  return <h2 ref={ref} className={cn("stroke-tag", className)} {...props}>{children}</h2>;
}
