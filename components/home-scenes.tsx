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
          { wide: "(min-width: 48rem)", narrow: "(max-width: 47.999rem)" },
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
