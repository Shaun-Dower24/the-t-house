"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CardRouteTransitionProvider } from "./card-route-transition";
import { SiteHeader } from "./site-header";
import { TextShuffle } from "./text-shuffle";

const preferenceKey = "t-house-reduce-motion";
const systemPreference = "(prefers-reduced-motion: reduce)";
const preferenceChanged = "t-house-motion-change";
let sessionPreference = false;

function getSystemPreference() {
  return window.matchMedia(systemPreference).matches;
}

function motionIsReduced() {
  if (getSystemPreference()) return true;
  try {
    return window.localStorage.getItem(preferenceKey) === "true";
  } catch {
    return sessionPreference;
  }
}

function subscribeToMotion(onChange: () => void) {
  const system = window.matchMedia(systemPreference);
  system.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(preferenceChanged, onChange);
  return () => {
    system.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(preferenceChanged, onChange);
  };
}

function toggleMotion() {
  if (getSystemPreference()) return;
  sessionPreference = !motionIsReduced();
  try {
    window.localStorage.setItem(preferenceKey, String(sessionPreference));
  } catch {
    // Keep the choice for this page when storage is unavailable.
  }
  window.dispatchEvent(new Event(preferenceChanged));
}

const serverMotionPreference = () => false;
const initialMotionPreference = () => undefined;

export function HomeScenes({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reduced = useSyncExternalStore(subscribeToMotion, motionIsReduced, initialMotionPreference);
  const systemReduced = useSyncExternalStore(subscribeToMotion, getSystemPreference, serverMotionPreference);

  useEffect(() => {
    const page = root.current;
    if (!page || reduced !== false || pathname !== "/") return;
    let active = true;
    let cleanup: (() => void) | undefined;

    async function startMotion(scope: HTMLDivElement) {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (!active || motionIsReduced()) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia(scope);

        media.add("(min-width: 48rem)", () => {
          gsap.fromTo("#inside [data-slot='gallery-image']", { yPercent: -5 }, {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: "#inside", start: "top bottom", end: "bottom top", scrub: true },
          });

          gsap.fromTo("[data-feature-stage]", { "--wing-depth": "0deg" }, {
            "--wing-depth": "24deg",
            ease: "none",
            scrollTrigger: { trigger: "#watch", start: "top bottom", end: "top 30%", scrub: true },
          });
        });

        cleanup = () => media.revert();
      } catch (error) {
        console.warn("The homepage motion could not start.", error);
      }
    }

    void startMotion(page);
    return () => {
      active = false;
      cleanup?.();
    };
  }, [pathname, reduced]);

  return (
    <div ref={root} className="prototype" data-motion={reduced === undefined ? undefined : reduced ? "reduced" : "full"}>
      <CardRouteTransitionProvider>
        <SiteHeader reduceMotion={reduced === true} toggleMotion={toggleMotion} systemReduced={systemReduced} />
        <main id="main-content" tabIndex={-1}>{children}</main>
        {footer}
      </CardRouteTransitionProvider>
      <TextShuffle />
    </div>
  );
}
