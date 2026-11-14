"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HomeScenes({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = root.current;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let cleanup: (() => void) | undefined;
    let revision = 0;

    async function syncMotion() {
      const currentRevision = ++revision;
      cleanup?.();
      cleanup = undefined;

      if (!main || !motionPreference.matches) return;

      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (currentRevision !== revision) return;

        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia(main);

        media.add(
          {
            wide: "(min-width: 48rem)",
            narrow: "(max-width: 47.999rem)",
            pointer: "(min-width: 48rem) and (hover: hover) and (pointer: fine)",
          },
          ({ conditions }) => {
            const wide = conditions?.wide;

            gsap.to("[data-arrival-art]", {
              scale: wide ? 1.16 : 1.08,
              yPercent: wide ? 9 : 4,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-arrival]",
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });

            gsap.fromTo("[data-inside-art]", { yPercent: wide ? -7 : -3 }, {
              yPercent: wide ? 7 : 3,
              ease: "none",
              scrollTrigger: {
                trigger: "#inside",
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });

            const field = main.querySelector<HTMLElement>("[data-tile-field]");
            const stage = field?.closest<HTMLElement>(".tile-stage");
            if (!conditions?.pointer || !field || !stage) return;

            const properties = ["--tilt-x", "--tilt-y", "--pointer-x", "--pointer-y"];

            function tilt(event: PointerEvent) {
              if (!field || !stage || event.pointerType === "touch") return;
              const bounds = stage.getBoundingClientRect();
              const x = (event.clientX - bounds.left) / bounds.width;
              const y = (event.clientY - bounds.top) / bounds.height;
              field.style.setProperty("--tilt-x", `${(0.5 - y) * 8}deg`);
              field.style.setProperty("--tilt-y", `${(x - 0.5) * 11}deg`);
              field.style.setProperty("--pointer-x", `${x * 100}%`);
              field.style.setProperty("--pointer-y", `${y * 100}%`);
            }

            function reset() {
              for (const property of properties) field?.style.removeProperty(property);
            }

            stage.addEventListener("pointermove", tilt, { passive: true });
            stage.addEventListener("pointerleave", reset);

            return () => {
              stage.removeEventListener("pointermove", tilt);
              stage.removeEventListener("pointerleave", reset);
              reset();
            };
          },
        );

        cleanup = () => media.revert();
      } catch (error) {
        console.warn("The homepage animation could not start.", error);
      }
    }

    void syncMotion();
    motionPreference.addEventListener("change", syncMotion);

    return () => {
      revision++;
      cleanup?.();
      motionPreference.removeEventListener("change", syncMotion);
    };
  }, []);

  return <main id="main-content" ref={root} tabIndex={-1}>{children}</main>;
}
