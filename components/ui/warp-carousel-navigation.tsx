"use client";

import { useLayoutEffect, useRef, type ComponentPropsWithoutRef, type RefObject } from "react";
import { CW, FOCAL, poseAt, spin, STEP_FRAMES } from "./warp-carousel-motion";

export interface WarpNavigationProps extends ComponentPropsWithoutRef<"ul"> {
  navigation: {
    railRef: RefObject<HTMLUListElement | null>;
    enabled: boolean;
    position: number;
    motion: boolean;
  };
}

const turnDuration = 820;

function paintRail(rail: HTMLUListElement, slides: HTMLElement[], position: number) {
  const count = slides.length;
  const half = count / 2;
  rail.style.setProperty("--t-house-orbit-angle", `${position * 360 / count}deg`);

  slides.forEach((slide, index) => {
    const offset = index - position + half;
    const relative = ((offset % count) + count) % count - half;
    const [x, depth, yaw] = poseAt(relative);
    // Preserve the projected plane as the card turns away while keeping HTML labels readable.
    const back = (FOCAL + depth) * Math.cos(yaw) - x * Math.sin(yaw) < 0;
    const facing = back ? yaw - Math.sign(yaw) * Math.PI : yaw;

    slide.style.setProperty("--warp-x", String(x / CW));
    slide.style.setProperty("--warp-depth", String(-depth / CW));
    slide.style.setProperty("--warp-yaw", `${facing}rad`);
    slide.style.setProperty("--warp-preview-x", String((x / CW) * FOCAL / (FOCAL + depth)));
    slide.style.setProperty("--warp-layer", String(2000 - Math.round(depth)));
    const distanceFromRear = half - Math.abs(relative);
    slide.style.setProperty("--warp-opacity", String(Math.min(1, distanceFromRear / 0.4)));
    slide.toggleAttribute("data-rear", distanceFromRear <= 0.1);
  });
}

export function WarpNavigation({
  navigation: { railRef, enabled, position, motion },
  ...railProps
}: WarpNavigationProps) {
  const current = useRef(position);

  useLayoutEffect(() => {
    if (!railRef.current || !enabled) return;
    const rail = railRef.current;
    const slides = Array.from(rail.children) as HTMLElement[];
    if (!slides.length) return;
    rail.style.setProperty("--warp-focal", String(FOCAL / CW));
    const from = current.current;

    function paint(position: number) {
      current.current = position;
      paintRail(rail, slides, position);
    }

    if (!motion || from === position) {
      paint(position);
      return;
    }

    const start = performance.now();
    let frame = 0;
    rail.setAttribute("data-warp-moving", "");

    function animate(now: number) {
      const elapsed = Math.min(1, (now - start) / turnDuration);
      paint(from + (position - from) * spin(elapsed * STEP_FRAMES));
      if (elapsed < 1) frame = requestAnimationFrame(animate);
      else rail.removeAttribute("data-warp-moving");
    }

    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      rail.removeAttribute("data-warp-moving");
    };
  }, [enabled, motion, position, railRef]);

  return <ul {...railProps} ref={railRef} data-hero-orbit={enabled || undefined} />;
}
