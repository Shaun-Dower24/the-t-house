"use client";

import Image from "next/image";
import { useId, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import styles from "./hover-expand-gallery.module.css";

export type HoverExpandItem = {
  title: string;
  meta?: string;
  src?: string;
  alt?: string;
  accent?: string;
  objectPosition?: string;
};

export type HoverExpandGalleryProps = {
  items?: readonly HoverExpandItem[];
  /** Height when the available width can accommodate the rails. */
  height?: string;
  railWidth?: number;
  maxOpenWidth?: number;
  /** Maximum image height when the gallery uses stacked rows. */
  mobileImageHeight?: number;
  defaultIndex?: number;
  duration?: number;
  onChange?: (index: number, item: HoverExpandItem) => void;
  className?: string;
  variant?: "image-panels";
};

const defaultItems: readonly HoverExpandItem[] = [
  {
    title: "Entrance study",
    src: "/images/threshold-detail.webp",
    alt: "An imagined entrance framed by repeated illuminated roof outlines",
  },
  {
    title: "House installation",
    src: "/images/house-installation.webp",
    alt: "An illuminated house outline standing on a dark floor",
    objectPosition: "72% center",
  },
];

function getRailPanel(summary: HTMLElement) {
  if (getComputedStyle(summary).getPropertyValue("--gallery-rail-mode").trim() !== "1") return null;
  return summary.parentElement as HTMLDetailsElement;
}

function openRail(summary: HTMLElement) {
  const panel = getRailPanel(summary);
  if (panel) panel.open = true;
}

export default function HoverExpandGallery({
  items = defaultItems,
  height = "100svh",
  railWidth = 64,
  maxOpenWidth = 520,
  mobileImageHeight = 420,
  defaultIndex = 0,
  duration = 620,
  onChange,
  className,
  variant,
}: HoverExpandGalleryProps) {
  const group = useId();
  const initial = Math.min(Math.max(0, Math.trunc(defaultIndex) || 0), items.length - 1);
  const active = useRef(initial);

  if (!items.length) return null;

  const rail = Math.max(44, railWidth);
  const dimensions = {
    "--gallery-height": height,
    "--gallery-rail-width": `${rail}px`,
    "--gallery-open-width": `${Math.max(rail, maxOpenWidth)}px`,
    "--gallery-closed-space": `${(items.length - 1) * (rail + 8)}px`,
    "--gallery-mobile-height": `${Math.max(1, mobileImageHeight)}px`,
    "--gallery-time": `${Math.max(0, duration)}ms`,
  } as CSSProperties;

  return (
    <div
      data-slot="hover-expand-gallery"
      className={cn(styles.gallery, variant === "image-panels" && styles.imagePanels, className)}
      style={dimensions}
    >
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className={styles.item}>
            <details
              name={group}
              open={index === initial}
              className={styles.panel}
              onToggle={(event) => {
                const panel = event.currentTarget;
                if (!panel.open) {
                  if (active.current === index) active.current = -1;
                  return;
                }
                // Honor the group in browsers that do not implement grouped details.
                panel.closest("ul")?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((other) => {
                  if (other !== panel) other.open = false;
                });
                if (active.current !== index) {
                  active.current = index;
                  onChange?.(index, item);
                }
              }}
            >
              <summary
                className={styles.trigger}
                aria-label={item.title}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") openRail(event.currentTarget);
                }}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) openRail(event.currentTarget);
                }}
                onClick={(event) => {
                  if (getRailPanel(event.currentTarget)?.open) event.preventDefault();
                }}
              >
                <span className={styles.title}>{item.title}</span>
                {item.meta && <span className={styles.meta}>{item.meta}</span>}
              </summary>
              <div className={styles.media} data-slot="gallery-media" style={{ background: item.accent }}>
                {item.src && (
                  <div className={styles.image} data-slot="gallery-image">
                    <Image
                      src={item.src}
                      alt={item.alt ?? item.title}
                      fill
                      sizes="(max-width: 48rem) 90vw, (max-width: 90rem) 48vw, 40rem"
                      loading={index === initial ? "eager" : "lazy"}
                      unoptimized={/^(?:https?:)?\/\//i.test(item.src)}
                      style={{ objectPosition: item.objectPosition }}
                      draggable={false}
                    />
                  </div>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
