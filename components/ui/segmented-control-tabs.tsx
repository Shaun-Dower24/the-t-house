"use client";

import { Tabs } from "@base-ui/react/tabs";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./segmented-control-tabs.module.css";

export interface SegmentedControlItem {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export interface SegmentedControlTabsProps {
  label: string;
  items: readonly SegmentedControlItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Show the same panels side by side when there is room. */
  expanded?: boolean;
  className?: string;
}

const expandedPanel: HTMLAttributes<HTMLDivElement> = {
  hidden: false,
  inert: false,
  role: "presentation",
  "aria-labelledby": undefined,
  tabIndex: undefined,
};

export function SegmentedControlTabs({
  label, items, defaultValue, value, onValueChange, expanded = false, className,
}: SegmentedControlTabsProps) {
  if (!items.length) return null;

  return (
    <Tabs.Root
      data-slot="segmented-control-tabs"
      data-expanded={expanded || undefined}
      className={cn(styles.root, className)}
      defaultValue={defaultValue ?? items[0].value}
      value={value}
      onValueChange={next => {
        if (typeof next === "string") onValueChange?.(next);
      }}
    >
      <Tabs.List aria-label={label} className={styles.list} hidden={expanded} activateOnFocus>
        {items.map(({ value, label, icon }) => (
          <Tabs.Tab className={styles.tab} data-slot="segmented-tab" data-value={value} key={value} value={value}>
            {icon && <span aria-hidden="true" className={styles.icon}>{icon}</span>}
            <span>{label}</span>
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <div className={styles.panels}>
        {items.map(({ value, content }) => (
          <Tabs.Panel
            key={value}
            value={value}
            keepMounted
            className={styles.panel}
            {...(expanded ? expandedPanel : {})}
          >
            {content}
          </Tabs.Panel>
        ))}
      </div>
    </Tabs.Root>
  );
}

export default SegmentedControlTabs;
