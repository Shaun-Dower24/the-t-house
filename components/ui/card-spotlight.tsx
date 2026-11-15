"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { CanvasRevealEffect, type DotColor } from "./canvas-reveal-effect";
import styles from "./card-spotlight.module.css";

interface CardSpotlightProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  radius?: number;
  color?: string;
  colors?: readonly DotColor[];
}

export function CardSpotlight({
  children,
  radius = 350,
  color = "#262626",
  colors,
  className,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: CardSpotlightProps) {
  const card = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const maskImage = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, black, transparent 80%)`;
  const [hovering, setHovering] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);
  const active = hovering && canAnimate;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const scope = card.current?.closest<HTMLElement>("[data-motion], .prototype");
    const sync = () => setCanAnimate(pointer.matches && !motion.matches && scope?.dataset.motion !== "reduced");
    const observer = new MutationObserver(sync);

    if (scope) observer.observe(scope, { attributes: true, attributeFilter: ["data-motion"] });
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    sync();

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
    };
  }, []);

  function updatePosition({ currentTarget, clientX, clientY }: PointerEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      {...props}
      ref={card}
      className={cn("rounded-md border border-neutral-800 bg-black p-10", styles.card, className)}
      data-spotlight-active={active ? "" : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          updatePosition(event);
          setHovering(true);
        }
        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        if (active) updatePosition(event);
        onPointerMove?.(event);
      }}
      onPointerLeave={(event) => {
        setHovering(false);
        onPointerLeave?.(event);
      }}
    >
      <div
        className={styles.fallback}
        data-spotlight-fallback
        aria-hidden="true"
        style={{ backgroundColor: color, maskImage: `radial-gradient(${radius}px circle at 50% 75%, black, transparent 80%)` }}
      />
      <motion.div className={styles.spotlight} data-spotlight-glow aria-hidden="true" style={{ backgroundColor: color, maskImage }}>
        {active && <CanvasRevealEffect containerClassName={styles.dots} colors={colors} />}
      </motion.div>
      {children}
    </div>
  );
}
