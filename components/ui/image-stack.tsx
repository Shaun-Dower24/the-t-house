"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./image-stack.module.css";

export interface ImageStackImage {
  src: string;
  alt: string;
  objectPosition?: string;
}

export interface ImgStackProps {
  images: readonly (string | ImageStackImage)[];
  layout?: "stack" | "collage";
  caption?: ReactNode;
  backdrop?: ReactNode;
  monochrome?: boolean;
  interactive?: boolean;
  className?: string;
}

const subscribe = () => () => {};
const dragConstraints = { left: 0, right: 0 };
const stackSizes = "(max-width: 26rem) 64vw, 16rem";
const collageSizes = "(min-width: 88rem) 38rem, (min-width: 53rem) 42vw, 78vw";
const foregroundSizes = "(min-width: 88rem) 18rem, (min-width: 53rem) 20vw, 41vw";
const minSwipeDistance = 50;

export default function ImgStack({
  images, layout = "stack", caption, backdrop, monochrome = false, interactive = true, className,
}: ImgStackProps) {
  const root = useRef<HTMLElement>(null);
  const captionId = useId();
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [advanceCount, setAdvanceCount] = useState(0);
  const count = images.length;
  const canBrowse = interactive && count > 1;
  const first = layout === "collage" && count > 1 ? 1 : 0;
  const front = count ? (first + advanceCount) % count : 0;
  const animate = enhanced && canBrowse && motionAllowed;

  useEffect(() => {
    if (!canBrowse) return;
    const scope = root.current?.closest<HTMLElement>("[data-motion], .prototype");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!preference.matches && (!scope || scope.dataset.motion === "full"));
    const observer = new MutationObserver(sync);
    if (scope) observer.observe(scope, { attributes: true, attributeFilter: ["data-motion"] });
    preference.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
    };
  }, [canBrowse]);

  if (count === 0) return null;

  const current = images[front];
  const imageDescription = typeof current === "string" ? "" : current.alt;
  const hasCaption = caption != null;

  return (
    <figure
      ref={root}
      className={cn(styles.figure, className)}
      data-slot="image-stack"
      data-layout={layout}
      data-stack-motion={animate ? "full" : "static"}
      data-monochrome={monochrome || undefined}
      aria-labelledby={hasCaption ? captionId : undefined}
    >
      <div className={styles.stage} data-slot="image-stack-stage" data-single={count === 1 || undefined}>
        {backdrop && <div className={styles.backdrop} aria-hidden="true">{backdrop}</div>}
        {images.map((source, index) => {
          const image: ImageStackImage = typeof source === "string" ? { src: source, alt: `Image ${index + 1}` } : source;
          const depth = (index - front + count) % count;
          const foreground = depth === 0;
          const draggable = foreground && animate;
          const pose = {
            zIndex: count - depth,
            "--image-stack-depth": Math.min(depth, 4),
            "--image-stack-tilt": depth === 0 ? "0deg" : `${-(2 + Math.min(depth, 4) * 3)}deg`,
          } as CSSProperties;

          return (
            <motion.div
              key={`${image.src}-${index}`}
              data-slot="image-stack-card"
              data-depth={depth}
              data-draggable={draggable || undefined}
              className={styles.card}
              style={pose}
              initial={false}
              drag={draggable ? "x" : false}
              dragConstraints={dragConstraints}
              dragElastic={0.28}
              dragMomentum={false}
              dragSnapToOrigin
              dragTransition={{ bounceStiffness: 570, bounceDamping: 34 }}
              whileHover={draggable ? { scale: 1.025 } : undefined}
              whileDrag={draggable ? { scale: 1.04 } : undefined}
              onDragEnd={(event, { offset }) => {
                if (root.current?.dataset.stackMotion !== "full" || event.type === "pointercancel" || Math.abs(offset.x) < minSwipeDistance) return;
                setAdvanceCount((previous) => (first + previous) % count === index ? previous + 1 : previous);
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                draggable={false}
                className={styles.image}
                style={{ objectPosition: image.objectPosition }}
                sizes={layout === "stack" ? stackSizes : foreground && count > 1 ? foregroundSizes : collageSizes}
                unoptimized={/^(?:https?:)?\/\//i.test(image.src)}
              />
            </motion.div>
          );
        })}
      </div>

      {(hasCaption || canBrowse) && (
        <figcaption className={styles.footer} data-browsable={canBrowse || undefined}>
          {hasCaption && <span id={captionId}>{caption}</span>}
          {canBrowse && enhanced && (
            <>
              <button type="button" className={styles.next} onClick={() => setAdvanceCount((previous) => previous + 1)}>
                Next image
              </button>
              <span className="sr-only" role="status">
                {advanceCount > 0 ? `Image ${front + 1} of ${count}${imageDescription ? `. ${imageDescription}` : ""}` : ""}
              </span>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
