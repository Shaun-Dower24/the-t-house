"use client";

import type { PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { SlitTypeFaq, type FaqItem as SlitFaqItem } from "./slit-type-faq";
import styles from "./faq-liquid-accordion.module.css";

export interface FaqItem extends SlitFaqItem {
  id: string;
}

export interface FaqLiquidAccordionProps {
  items: readonly FaqItem[];
  title?: string;
  subtitle?: string;
  defaultOpenId?: string;
  className?: string;
  /** Use the surrounding FAQ section's heading. */
  embedded?: boolean;
  idPrefix?: string;
}

function moveHighlight({ currentTarget, clientX, clientY, pointerType }: PointerEvent<HTMLDivElement>) {
  if (pointerType !== "mouse") return;
  const { left, top } = currentTarget.getBoundingClientRect();
  currentTarget.style.setProperty("--liquid-x", `${clientX - left}px`);
  currentTarget.style.setProperty("--liquid-y", `${clientY - top}px`);
  currentTarget.dataset.pointer = "true";
}

function clearHighlight({ currentTarget }: PointerEvent<HTMLDivElement>) {
  delete currentTarget.dataset.pointer;
}

export function FaqLiquidAccordion({
  items, title = "Questions, answered", subtitle, defaultOpenId, className, embedded, idPrefix,
}: FaqLiquidAccordionProps) {
  return (
    <div
      className={cn(styles.root, className)}
      data-slot="faq-liquid-accordion"
      onPointerMove={moveHighlight}
      onPointerLeave={clearHighlight}
      onPointerCancel={clearHighlight}
    >
      <SlitTypeFaq
        items={items}
        headline={title}
        intro={subtitle}
        defaultOpen={defaultOpenId}
        embedded={embedded}
        idPrefix={idPrefix}
      />
    </div>
  );
}

export default FaqLiquidAccordion;
