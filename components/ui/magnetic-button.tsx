// Magnetic Button from Hirael <https://hirael.com/components/animation/magnetic-button>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type HTMLMotionProps, motion, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const MotionSlot = motion.create(Slot);
const SPRING = { stiffness: 200, damping: 15, mass: 0.1 };

type PointerHandlers = Pick<React.HTMLAttributes<HTMLElement>, "onPointerMove" | "onPointerLeave" | "onPointerCancel">;

interface MagneticButtonProps extends Omit<HTMLMotionProps<"button">, keyof PointerHandlers>, PointerHandlers {
  /** Pull strength as a fraction of the cursor's distance from center. */
  strength?: number;
  /** Render the child element instead of a button (e.g. a link). */
  asChild?: boolean;
}

function MagneticButton({
  className,
  strength = 0.4,
  asChild = false,
  type = "button",
  style,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  ...props
}: MagneticButtonProps) {
  const reduced = useReducedMotion();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const host = React.useRef<HTMLElement>(null);
  const systemPreference = React.useRef<MediaQueryList>(null);

  const setHost = React.useCallback((element: HTMLElement | null) => {
    host.current = element;
  }, []);

  const stop = React.useCallback(() => {
    x.jump(0);
    y.jump(0);
  }, [x, y]);

  React.useEffect(() => {
    const scope = host.current?.closest<HTMLElement>("[data-motion], .prototype");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    systemPreference.current = media;
    const syncMotion = () => {
      if (media.matches || scope?.dataset.motion === "reduced") stop();
    };
    const observer = new MutationObserver(syncMotion);
    if (scope) observer.observe(scope, { attributes: true, attributeFilter: ["data-motion"] });
    media.addEventListener("change", syncMotion);
    syncMotion();

    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncMotion);
      systemPreference.current = null;
    };
  }, [asChild, stop]);

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const { currentTarget, pointerType, clientX, clientY } = event;
    const systemReduced = systemPreference.current?.matches ?? reduced;
    if (pointerType === "mouse" && !systemReduced && !currentTarget.closest('[data-motion="reduced"]')) {
      const rect = currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 - x.get();
      const centerY = rect.top + rect.height / 2 - y.get();
      x.set((clientX - centerX) * strength);
      y.set((clientY - centerY) * strength);
    }
    onPointerMove?.(event);
  }

  const Comp = asChild ? MotionSlot : motion.button;

  return (
    <Comp
      {...props}
      ref={setHost}
      type={asChild ? undefined : type}
      data-slot="magnetic-button"
      onPointerMove={handlePointerMove}
      onPointerLeave={(event) => {
        x.set(0);
        y.set(0);
        onPointerLeave?.(event);
      }}
      onPointerCancel={(event) => {
        stop();
        onPointerCancel?.(event);
      }}
      style={{ ...style, x, y }}
      className={cn(
        !asChild &&
          "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    />
  );
}

export { MagneticButton };
export default MagneticButton;
