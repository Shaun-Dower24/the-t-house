"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HeroSignal } from "./vhs-hero-scene";
import styles from "./vhs-hero-section.module.css";

const VhsHeroScene = dynamic(() => import("./vhs-hero-scene"), { ssr: false });
const visibleThreshold = 0.1;

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface VhsHeroSectionProps {
  children?: ReactNode;
  className?: string;
  signal?: HeroSignal;
}

export function VhsHeroSection({ children, className, signal = "vhs" }: VhsHeroSectionProps) {
  const hero = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = hero.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const motionScope = element.closest<HTMLElement>("[data-motion], .prototype");
    const motion = window.matchMedia("(min-width: 36rem) and (prefers-reduced-motion: no-preference)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    let visible = false;

    const sync = () => {
      const siteAllowsMotion = !motionScope || motionScope.dataset.motion === "full";
      setPlaying(visible && !document.hidden && motion.matches && siteAllowsMotion && !forcedColors.matches);
    };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= visibleThreshold;
      sync();
    }, { threshold: visibleThreshold });
    const preference = new MutationObserver(sync);

    intersection.observe(element);
    if (motionScope) preference.observe(motionScope, { attributes: true, attributeFilter: ["data-motion"] });
    motion.addEventListener("change", sync);
    forcedColors.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      intersection.disconnect();
      preference.disconnect();
      motion.removeEventListener("change", sync);
      forcedColors.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - left) / width) * 2 - 1;
    pointer.current.y = 1 - ((event.clientY - top) / height) * 2;
  }

  function centerPointer() {
    pointer.current.x = 0;
    pointer.current.y = 0;
  }

  return (
    <div
      ref={hero}
      data-slot="vhs-hero-section"
      className={cn(styles.hero, className)}
      onPointerMove={playing ? trackPointer : undefined}
      onPointerLeave={playing ? centerPointer : undefined}
    >
      <div className={styles.backdrop} data-slot="vhs-backdrop" data-signal={signal} aria-hidden="true">
        <SceneBoundary>{playing && <VhsHeroScene pointer={pointer} signal={signal} />}</SceneBoundary>
      </div>
      {children}
    </div>
  );
}

export default VhsHeroSection;
