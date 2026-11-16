// Shared helpers for the homepage text effects (Stroke Text, Split Text, Shuffle, Circular Text).
// Effects run only when the site's motion preference is "full" and the visitor has neither reduced
// motion nor forced colours. Splits are temporary: the original React-rendered text node is put back
// unchanged when an effect finishes, so the resting DOM is exactly what React rendered.

type Gsap = typeof import("gsap").gsap;

export const reducedTextMotionQuery = "(prefers-reduced-motion: reduce), (forced-colors: active)";

let gsapRequest: Promise<Gsap> | undefined;

/** Loads GSAP once, after hydration. A failed load can be retried. */
export function loadGsap() {
  gsapRequest ??= import("gsap").then(
    (module) => module.gsap,
    (error: unknown) => {
      gsapRequest = undefined;
      throw error;
    },
  );
  return gsapRequest;
}

function motionScope(element: Element) {
  return element.closest<HTMLElement>("[data-motion], .prototype");
}

export function textMotionAllowed(element: Element) {
  return !window.matchMedia(reducedTextMotionQuery).matches && motionScope(element)?.dataset.motion === "full";
}

/** Calls onChange with the current preference and again whenever it changes. Returns a cleanup. */
export function watchTextMotion(element: Element, onChange: (allowed: boolean) => void) {
  const scope = motionScope(element);
  const media = window.matchMedia(reducedTextMotionQuery);
  let current: boolean | undefined;
  const update = () => {
    const allowed = textMotionAllowed(element);
    if (allowed === current) return;
    current = allowed;
    onChange(allowed);
  };
  const observer = new MutationObserver(update);
  if (scope) observer.observe(scope, { attributes: true, attributeFilter: ["data-motion"] });
  media.addEventListener("change", update);
  update();
  return () => {
    observer.disconnect();
    media.removeEventListener("change", update);
  };
}

const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : undefined;

export function graphemes(text: string) {
  return segmenter ? Array.from(segmenter.segment(text), ({ segment }) => segment) : Array.from(text);
}

/** Direct child text nodes with visible characters. Nested elements, such as sr-only text, are left alone. */
export function visibleTextNodes(host: Element) {
  return Array.from(host.childNodes).filter(
    (node): node is Text => node.nodeType === Node.TEXT_NODE && /\S/u.test((node as Text).data),
  );
}

export type TextSplit = {
  chars: HTMLSpanElement[];
  revert: () => void;
};

/**
 * Temporarily splits the host's own text into word and letter spans. Screen readers read an sr-only copy
 * of the text while the letters are aria-hidden. With lockSize, the host keeps its size while split.
 */
export function splitText(host: HTMLElement, { lockSize = false } = {}): TextSplit | null {
  const nodes = visibleTextNodes(host);
  if (!nodes.length) return null;

  const saved = { width: host.style.width, height: host.style.height };
  if (lockSize) {
    const { width, height } = getComputedStyle(host);
    host.style.width = width;
    host.style.height = height;
  }

  const chars: HTMLSpanElement[] = [];
  const undo: (() => void)[] = [];
  for (const node of nodes) {
    const copy = document.createElement("span");
    copy.className = "sr-only";
    copy.textContent = node.data;
    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    for (const part of node.data.split(/(\s+)/u)) {
      if (!part) continue;
      if (!/\S/u.test(part)) {
        visual.append(part);
        continue;
      }
      const word = document.createElement("span");
      word.className = "split-word";
      for (const grapheme of graphemes(part)) {
        const char = document.createElement("span");
        char.className = "split-char";
        char.textContent = grapheme;
        word.append(char);
        chars.push(char);
      }
      visual.append(word);
    }
    node.replaceWith(copy, visual);
    undo.push(() => {
      visual.replaceWith(node);
      copy.remove();
    });
  }

  let reverted = false;
  return {
    chars,
    revert() {
      if (reverted) return;
      reverted = true;
      undo.forEach((step) => step());
      if (lockSize) {
        host.style.width = saved.width;
        host.style.height = saved.height;
      }
    },
  };
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomLike(char: string, avoid: string) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let next: string;
    if (/^\d$/u.test(char)) next = String(Math.floor(Math.random() * 10));
    else if (/^[a-z]$/iu.test(char)) {
      const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      next = char === char.toLowerCase() ? letter.toLowerCase() : letter;
    } else return null;
    if (next !== avoid && next.toLowerCase() !== char.toLowerCase()) return next;
  }
  return null;
}

export type RollOptions = {
  /** 1 rolls upward (new letters arrive from below). -1 rolls downward. */
  direction?: 1 | -1;
  /** Random letters shown before each letter lands. */
  steps?: number;
  /** Previous text in the same shape. Unchanged letters stay still; changed ones start on the old letter. */
  from?: string;
  duration?: number;
  stagger?: number;
};

/** Rolls each split letter through a short strip of random letters, slot-reel style. */
export function rollChars(gsap: Gsap, chars: HTMLSpanElement[], options: RollOptions = {}) {
  const { direction = 1, steps = 2, from, duration = 0.42, stagger = 0.035 } = options;
  const previous = from === undefined ? undefined : graphemes(from).filter((char) => /\S/u.test(char));
  const timeline = gsap.timeline();
  let order = 0;

  chars.forEach((cell, index) => {
    const letter = cell.textContent ?? "";
    const old = previous?.[index];
    if (previous && old === letter) return;
    const strip: string[] = [];
    if (old && /\S/u.test(old)) strip.push(old);
    while (strip.length < steps) {
      const next = randomLike(letter, strip.at(-1) ?? "");
      if (!next) break;
      strip.push(next);
    }
    if (!strip.length) return;

    const reel = document.createElement("span");
    reel.className = "roll-reel";
    reel.textContent = letter;
    strip.forEach((value, position) => {
      const ghost = document.createElement("span");
      ghost.className = "roll-ghost";
      ghost.textContent = value;
      ghost.style.top = `${-direction * (strip.length - position) * 100}%`;
      reel.append(ghost);
    });
    cell.classList.add("roll-cell");
    cell.replaceChildren(reel);
    timeline.fromTo(reel, { yPercent: direction * strip.length * 100 }, {
      yPercent: 0,
      duration,
      ease: "power3.out",
    }, order * stagger);
    order += 1;
  });

  return timeline;
}
