"use client";

// Circular Text: a decorative ring of text around the play button that turns slowly, pauses off screen
// and speeds up while its link is hovered or focused. It stays still with reduced motion or without
// JavaScript. The ring is aria-hidden; the link keeps its own accessible name.

import { useEffect, useId, useRef } from "react";
import { loadGsap, watchTextMotion } from "@/lib/text-motion";

const radius = 64;
const circumference = 2 * Math.PI * radius;
const ringPath = `M100 ${100 - radius}a${radius} ${radius} 0 1 1 0 ${2 * radius}a${radius} ${radius} 0 1 1 0 ${-2 * radius}`;

export function CircularText({ text, repeat = 1 }: { text: string; repeat?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const id = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-ring`;

  useEffect(() => {
    const ring = ref.current;
    if (!ring) return;
    let stopSpin: (() => void) | undefined;

    const stopWatching = watchTextMotion(ring, (allowed) => {
      stopSpin?.();
      stopSpin = undefined;
      if (!allowed) return;
      let cancelled = false;
      let release: (() => void) | undefined;
      stopSpin = () => {
        cancelled = true;
        release?.();
      };

      void loadGsap().then((gsap) => {
        if (cancelled) return;
        const spin = gsap.to(ring, { rotation: "+=360", duration: 22, ease: "none", repeat: -1 });
        const visibility = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) spin.resume();
          else spin.pause();
        });
        visibility.observe(ring);

        const link = ring.closest("a");
        const speed = (timeScale: number, duration: number) => {
          gsap.to(spin, { timeScale, duration, ease: "power2.out", overwrite: true });
        };
        const pointerEnter = (event: PointerEvent) => { if (event.pointerType !== "touch") speed(3.2, 0.5); };
        const focus = () => { if (link?.matches(":focus-visible")) speed(3.2, 0.5); };
        const relax = () => speed(1, 0.9);
        link?.addEventListener("pointerenter", pointerEnter);
        link?.addEventListener("pointerleave", relax);
        link?.addEventListener("focus", focus);
        link?.addEventListener("blur", relax);

        release = () => {
          visibility.disconnect();
          link?.removeEventListener("pointerenter", pointerEnter);
          link?.removeEventListener("pointerleave", relax);
          link?.removeEventListener("focus", focus);
          link?.removeEventListener("blur", relax);
          gsap.killTweensOf(spin);
          spin.kill();
          gsap.set(ring, { clearProps: "transform" });
        };
      }).catch(() => {});
    });

    return () => {
      stopWatching();
      stopSpin?.();
    };
  }, []);

  return (
    <svg ref={ref} className="circular-text" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <path id={id} d={ringPath} />
      </defs>
      <text>
        <textPath href={`#${id}`} textLength={circumference} lengthAdjust="spacing">
          {text.toUpperCase().repeat(repeat)}
        </textPath>
      </text>
    </svg>
  );
}
