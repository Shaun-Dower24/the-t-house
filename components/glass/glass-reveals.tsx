"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./glass.module.css";

export function GlassReveals({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || !("IntersectionObserver" in window)) return;
    const system = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!system.matches && !root.current?.closest('[data-motion="reduced"]')) {
          entry.target.setAttribute("data-glass-revealed", "true");
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    root.current.querySelectorAll("[data-glass-section]").forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className={styles.reveals}>{children}</div>;
}
