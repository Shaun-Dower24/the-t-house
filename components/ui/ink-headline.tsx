"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { buildInkMask, type InkMask } from "./ink-headline-mask";
import { getSurface } from "./ink-headline-surface";
import {
  DEFAULT_STAGGER, HANDOFF, MAX_UNITS, clamp01, colorToRgb, createTween,
  damp, handoffAt, resolveEase, scrollProgress, splitWords, totalTime, unitProgress,
  type By, type Trigger,
} from "./ink-headline-utils";
import styles from "./ink-headline.module.css";

export * from "./ink-headline-utils";

export interface InkHeadlineProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  trigger?: Trigger;
  progress?: number;
  by?: By;
  duration?: number;
  stagger?: number;
  ease?: string;
  bleed?: number;
  feather?: number;
  noiseScale?: number;
  inkColor?: string;
  once?: boolean;
  dprCap?: number;
  className?: string;
}

type InkSettings = Required<Omit<InkHeadlineProps, "as" | "children" | "className" | "progress" | "inkColor">> & {
  inkColor?: string;
};

let nextId = 1;

function readInkColor(cssColor: string, context: CanvasRenderingContext2D) {
  const direct = colorToRgb(cssColor);
  if (direct) return direct;
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = "transparent";
  context.fillStyle = cssColor;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return alpha ? [red / 255, green / 255, blue / 255] as [number, number, number] : null;
}

function runInk(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  settings: InkSettings,
  getProgress: () => number,
  onStart: () => void,
) {
  const { by, duration, stagger, ease, bleed, feather, noiseScale, inkColor, once, dprCap, trigger } = settings;
  const words = [...root.querySelectorAll<HTMLElement>("[data-ink-word]")];
  const timing = resolveEase(ease);
  const mask = document.createElement("canvas");
  const units = new Float32Array(MAX_UNITS);
  const id = nextId++;
  let surface: ReturnType<typeof getSurface> = null;
  let context: CanvasRenderingContext2D | null = null;
  let ink: ReturnType<typeof readInkColor> = null;
  let geometry: InkMask | null = null;
  let tween: ReturnType<typeof createTween> | null = null;
  let current = 0;
  let visible = false;
  let loading = false;
  let stopped = false;
  let resizeFrame = 0;
  let scrollFrame = 0;
  let lastScrollFrame = 0;

  function showText(state: "plain" | "settled") {
    root.dataset.inkState = state;
    words.forEach((word) => word.style.removeProperty("opacity"));
  }

  function applyHandoff(wordUnits: number[]) {
    words.forEach((word, index) => {
      word.style.opacity = String(handoffAt(units[wordUnits[index] ?? 0]));
    });
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    tween?.cancel();
    tween = null;
    cancelAnimationFrame(resizeFrame);
    cancelAnimationFrame(scrollFrame);
    surface?.forget(id);
    geometry = null;
    mask.width = 1;
    mask.height = 1;
    canvas.width = 1;
    canvas.height = 1;
    intersection?.disconnect();
    resize?.disconnect();
    document.fonts?.removeEventListener("loadingdone", onResize);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", scheduleScroll);
  }

  function fallback() {
    stop();
    showText("plain");
  }

  function paint(progress: number) {
    current = clamp01(progress);
    if (stopped || !geometry || !context || !ink || !surface) return;

    const { width, height, dpr, em, spans, tiles, unitCount } = geometry;
    units.fill(0);
    let drawing = false;
    let dry = true;
    for (let unit = 0; unit < unitCount; unit++) {
      const linear = unitProgress(current, unit, unitCount, duration, stagger);
      const wet = timing(linear);
      units[unit] = wet;
      drawing ||= wet > 0 && wet < HANDOFF;
      dry &&= wet >= HANDOFF;
    }

    if (dry) {
      showText("settled");
      if (trigger === "inView" && once) {
        onStart();
        stop();
      }
      return;
    }

    if (!drawing) {
      if (trigger === "inView" && once && current === 0) showText("plain");
      else {
        root.dataset.inkState = "waiting";
        applyHandoff(geometry.units);
      }
      return;
    }

    if (!surface.draw(id, context, width, height, {
      units, spans, tiles, feather, bleed: clamp01(bleed), noiseScale, em: em * dpr,
      lod: Math.max(0, Math.log2(Math.max(1, em * dpr * 0.12))), ink,
    })) {
      fallback();
      return;
    }

    root.dataset.inkState = "drawing";
    applyHandoff(geometry.units);
    onStart();
  }

  function rebuild() {
    if (stopped || !surface) return;
    geometry = buildInkMask(root, canvas, mask, words, by, dprCap);
    if (!geometry || !surface.upload(id, mask)) {
      fallback();
      return;
    }
    paint(current);
  }

  function animateTo(target: number) {
    if (stopped || !geometry) return;
    tween?.cancel();
    const total = totalTime(duration, stagger, geometry.unitCount);
    tween = createTween({
      from: current,
      to: target,
      duration: total * Math.abs(target - current) * (target < current ? 0.6 : 1),
      ease: (progress) => progress,
      onUpdate: paint,
      onDone: () => { tween = null; },
    });
  }

  function followScroll(now: number) {
    scrollFrame = 0;
    if (stopped) return;
    const { top, height } = root.getBoundingClientRect();
    const target = scrollProgress(top, height, window.innerHeight);
    const delta = lastScrollFrame ? Math.min(0.05, (now - lastScrollFrame) / 1000) : 1 / 60;
    lastScrollFrame = now;
    const next = damp(current, target, 12, delta);
    paint(Math.abs(next - target) < 0.0005 ? target : next);
    if (!stopped && current !== target) scrollFrame = requestAnimationFrame(followScroll);
    else lastScrollFrame = 0;
  }

  function scheduleScroll() {
    if (geometry && !stopped && !scrollFrame) scrollFrame = requestAnimationFrame(followScroll);
  }

  async function prepare() {
    if (loading || stopped || words.length === 0) return;
    loading = true;
    const computed = getComputedStyle(root);
    const font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    try {
      await document.fonts?.load(font, root.textContent ?? "");
      if (stopped) return;
      surface = getSurface();
      context = canvas.getContext("2d");
      if (!surface || !context) return fallback();
      ink = (inkColor && readInkColor(inkColor, context)) || readInkColor(computed.color, context);
      if (!ink) return fallback();
      surface.register(id, fallback);
      rebuild();
      if (trigger === "manual") paint(getProgress());
      else if (trigger === "scroll") scheduleScroll();
      else if (visible) animateTo(1);
    } catch {
      fallback();
    }
  }

  const intersection = trigger === "inView" && typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      if (visible) {
        void prepare();
        if (geometry && !once) animateTo(1);
        if (once) intersection?.disconnect();
      } else if (!once) animateTo(0);
    }, { threshold: 0.35 })
    : null;

  function onResize() {
    if (!geometry || stopped) return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      rebuild();
      if (trigger === "scroll") scheduleScroll();
    });
  }

  const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
  resize?.observe(root);
  document.fonts?.addEventListener("loadingdone", onResize);
  window.addEventListener("resize", onResize);
  if (trigger === "scroll") window.addEventListener("scroll", scheduleScroll, { passive: true });
  if (intersection) intersection.observe(root);
  else {
    visible = true;
    void prepare();
  }

  return {
    setProgress: paint,
    dispose: fallback,
  };
}

export default function InkHeadline({
  children, as: Heading = "h2", trigger = "inView", progress = 0, by = "word", duration = 1800,
  stagger, ease = "linear", bleed = 0.6, feather = 0.12, noiseScale = 2.2, inkColor,
  once = true, dprCap = 2, className,
}: InkHeadlineProps) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<ReturnType<typeof runInk> | null>(null);
  const played = useRef<string | null>(null);
  const manualProgress = useRef(progress);
  const words = useMemo(() => splitWords(children), [children]);
  const gap = stagger ?? DEFAULT_STAGGER[by];

  useEffect(() => {
    manualProgress.current = progress;
    if (trigger === "manual") controller.current?.setProgress(progress);
  }, [progress, trigger]);

  useEffect(() => {
    const heading = root.current;
    const layer = canvas.current;
    if (!heading || !layer) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const scope = heading.closest<HTMLElement>("[data-motion], .prototype");
    const sync = () => {
      if (media.matches || (scope && scope.dataset.motion !== "full")) {
        controller.current?.dispose();
        controller.current = null;
      } else if (!controller.current && !(once && trigger === "inView" && played.current === children)) {
        controller.current = runInk(heading, layer, {
          trigger, by, duration, stagger: gap, ease, bleed, feather, noiseScale, inkColor, once, dprCap,
        }, () => manualProgress.current, () => { played.current = children; });
      }
    };
    const preference = new MutationObserver(sync);
    if (scope) preference.observe(scope, { attributes: true, attributeFilter: ["data-motion"] });
    media.addEventListener("change", sync);
    sync();

    return () => {
      media.removeEventListener("change", sync);
      preference.disconnect();
      controller.current?.dispose();
      controller.current = null;
    };
  }, [Heading, className, trigger, by, duration, gap, ease, bleed, feather, noiseScale, inkColor, once, dprCap, children]);

  return (
    <Heading
      ref={(element: HTMLElement | null) => { root.current = element; }}
      className={cn(styles.heading, className)}
      data-ink-headline=""
      data-trigger={trigger}
    >
      {words.map(({ word, space, br }, index) => (
        <Fragment key={index}>
          <span data-ink-word="">{word}</span>
          {space || br ? " " : null}
          {br ? <br /> : null}
        </Fragment>
      ))}
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
    </Heading>
  );
}
