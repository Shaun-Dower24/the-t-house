"use client";

import { animate, type AnimationOptions } from "motion";
import { Fragment, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./vertical-cut-reveal.module.css";

export interface VerticalCutRevealRef {
  startAnimation: () => void;
  reset: () => void;
}

export interface VerticalCutRevealProps {
  children: ReactNode;
  reverse?: boolean;
  transition?: AnimationOptions;
  splitBy?: string;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  containerClassName?: string;
  wordLevelClassName?: string;
  elementLevelClassName?: string;
  onClick?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
  /** Wait for the text to enter the viewport before starting automatically. */
  inView?: boolean;
}

const defaultTransition: AnimationOptions = { damping: 22, stiffness: 190, type: "spring" };
const motionPreference = "(prefers-reduced-motion: reduce), (forced-colors: active)";
const subscribe = () => () => {};
const unitSelector = "[data-cut-unit]";

function splitIntoChars(text: string) {
  if ("Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
}

type CutPart = string | { units: string[] };

function splitText(text: string, splitBy: string): CutPart[] {
  if (splitBy === "words" || splitBy === "characters") {
    return text.split(/(\s+)/u).filter(Boolean).map((piece) => {
      if (!/\S/u.test(piece)) return piece;
      return { units: splitBy === "characters" ? splitIntoChars(piece) : [piece] };
    });
  }
  const delimiter = splitBy === "lines" ? "\n" : splitBy;
  const value = splitBy === "lines" ? text.replace(/\r\n?/g, "\n") : text;
  const pieces = delimiter ? value.split(delimiter) : splitIntoChars(value);
  return pieces.flatMap((piece, index) => {
    const part: CutPart[] = piece ? [{ units: [piece] }] : [];
    if (index < pieces.length - 1) part.push(delimiter);
    return part;
  });
}

function getStaggerOrder(count: number, from: NonNullable<VerticalCutRevealProps["staggerFrom"]>) {
  const order = Array.from({ length: count }, (_, index) => index);
  if (from === "random") {
    for (let index = count - 1; index > 0; index--) {
      const pick = Math.floor(Math.random() * (index + 1));
      [order[index], order[pick]] = [order[pick], order[index]];
    }
    return order;
  }
  const origin = from === "first" ? 0 : from === "last" ? count - 1 : from === "center" ? Math.floor(count / 2) : from;
  return order.map((index) => Math.abs(index - origin));
}

function motionScope(element: HTMLElement) {
  return element.closest<HTMLElement>("[data-motion], .prototype");
}

function canAnimate(element: HTMLElement) {
  const scope = motionScope(element);
  return !window.matchMedia(motionPreference).matches && (!scope || scope.dataset.motion === "full");
}

export const VerticalCutReveal = forwardRef<VerticalCutRevealRef, VerticalCutRevealProps>(function VerticalCutReveal({
  children, reverse = false, transition = defaultTransition, splitBy = "words", staggerDuration = 0.2,
  staggerFrom = "first", containerClassName, wordLevelClassName, elementLevelClassName, onClick,
  onStart, onComplete, autoStart = true, inView = false,
}, ref) {
  const root = useRef<HTMLSpanElement>(null);
  const controls = useRef<ReturnType<typeof animate> | null>(null);
  const run = useRef(0);
  const options = useRef({ reverse, transition, staggerDuration, staggerFrom, onStart, onComplete });
  const client = useSyncExternalStore(subscribe, () => true, () => false);
  const text = typeof children === "string" || typeof children === "number" ? String(children) : null;
  const parts = useMemo(() => client && text != null ? splitText(text, splitBy) : [], [client, text, splitBy]);

  useEffect(() => {
    options.current = { reverse, transition, staggerDuration, staggerFrom, onStart, onComplete };
  }, [reverse, transition, staggerDuration, staggerFrom, onStart, onComplete]);

  const stop = useCallback(() => {
    run.current++;
    controls.current?.stop();
    controls.current = null;
  }, []);

  const settle = useCallback(() => {
    stop();
    const element = root.current;
    if (!element) return;
    element.querySelectorAll<HTMLElement>(unitSelector).forEach((unit) => unit.style.removeProperty("transform"));
    element.dataset.cutState = "settled";
  }, [stop]);

  const reset = useCallback(() => {
    settle();
    const element = root.current;
    if (!element || !canAnimate(element)) return;
    const offset = options.current.reverse ? "-130%" : "130%";
    element.querySelectorAll<HTMLElement>(unitSelector).forEach((unit) => { unit.style.transform = `translateY(${offset})`; });
    element.dataset.cutState = "reset";
  }, [settle]);

  const startAnimation = useCallback(() => {
    const element = root.current;
    if (!element) return;
    settle();
    const id = run.current;
    const { reverse, transition, staggerDuration, staggerFrom, onStart, onComplete } = options.current;
    onStart?.();
    if (run.current !== id) return;

    const units = Array.from(element.querySelectorAll<HTMLElement>(unitSelector));
    if (!units.length || !canAnimate(element)) {
      onComplete?.();
      return;
    }

    const offset = reverse ? "-130%" : "130%";
    const order = getStaggerOrder(units.length, staggerFrom);
    units.forEach((unit) => { unit.style.transform = `translateY(${offset})`; });
    element.dataset.cutState = "running";
    try {
      const animation = animate(units, { y: [offset, "0%"] }, {
        ...transition,
        delay: (index, total) => {
          const delay = typeof transition.delay === "function" ? transition.delay(index, total) : transition.delay ?? 0;
          return delay + order[index] * Math.max(0, staggerDuration);
        },
      });
      controls.current = animation;
      void animation.then(() => {
        if (run.current !== id) return;
        controls.current = null;
        settle();
        onComplete?.();
      });
    } catch {
      settle();
      onComplete?.();
    }
  }, [settle]);

  useImperativeHandle(ref, () => ({ startAnimation, reset }), [startAnimation, reset]);

  useEffect(() => {
    const element = root.current;
    if (!element || !client || text == null) return;
    const media = window.matchMedia(motionPreference);
    const scope = motionScope(element);
    let canStart = !inView;
    let started = false;
    let frame = 0;

    function sync() {
      if (media.matches || scope?.dataset.motion === "reduced") settle();
      if (!autoStart || !canStart || started || (scope && !scope.dataset.motion)) return;
      started = true;
      frame = requestAnimationFrame(startAnimation);
    }

    const observer = autoStart && inView && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        canStart = true;
        observer?.disconnect();
        sync();
      })
      : null;
    observer?.observe(element);
    const preference = new MutationObserver(sync);
    if (scope) preference.observe(scope, { attributes: true, attributeFilter: ["data-motion"] });
    media.addEventListener("change", sync);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      preference.disconnect();
      media.removeEventListener("change", sync);
      settle();
    };
  }, [client, text, splitBy, autoStart, inView, settle, startAnimation]);

  return (
    <span
      ref={root}
      className={cn(styles.reveal, containerClassName)}
      data-slot="vertical-cut-reveal"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onClick();
      } : undefined}
    >
      {client && text != null ? (
        <>
          <span className="sr-only select-none">{text}</span>
          <span aria-hidden="true">
            {parts.map((part, index) => typeof part === "string" ? (
              <Fragment key={index}>{part}</Fragment>
            ) : (
              <span key={index} className={cn(styles.mask, wordLevelClassName)}>
                {part.units.map((unit, unitIndex) => (
                  <span key={unitIndex} className={cn(styles.part, elementLevelClassName)}>
                    <span data-cut-unit="" className={styles.unit}>{unit}</span>
                  </span>
                ))}
              </span>
            ))}
          </span>
        </>
      ) : children}
    </span>
  );
});

export default VerticalCutReveal;
