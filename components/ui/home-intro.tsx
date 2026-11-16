"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { HouseElevation } from "../house-elevation";
import styles from "./home-intro.module.css";

const subscribe = (notify: () => void) => {
  window.addEventListener("t-house:intro-done", notify);
  return () => window.removeEventListener("t-house:intro-done", notify);
};
const isActive = () => ["pending", "running", "opening"].includes(document.documentElement.dataset.intro ?? "");
const serverSnapshot = () => false;

export function HomeIntro() {
  const active = useSyncExternalStore(subscribe, isActive, serverSnapshot);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = root.current;
    if (!active || !overlay) return;
    const html = document.documentElement;
    const frame = document.querySelector<HTMLElement>("[data-arrival-media]");
    const door = overlay.querySelector<SVGRectElement>("rect");
    if (!frame || !door) return;
    let disposed = false;
    let draw: { kill: () => void } | undefined;
    let aperture: { kill: () => void } | undefined;
    let wait: ReturnType<typeof setTimeout> | undefined;
    const started = Number(html.dataset.introStarted);
    const elapsed = () => (performance.now() - started) / 1000;
    html.style.setProperty("--intro-failsafe-delay", `${Math.max(0, 4.5 - elapsed())}s`);
    const finish = () => {
      html.dataset.intro = "done";
      window.dispatchEvent(new Event("t-house:intro-done"));
    };
    const stop = () => {
      disposed = true;
      clearTimeout(wait);
      draw?.kill(); aperture?.kill();
      frame.style.removeProperty("clip-path");
    };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const preferences = document.querySelector(".prototype");
    const changed = () => {
      if (motion.matches || preferences?.getAttribute("data-motion") === "reduced") finish();
    };
    const preference = new MutationObserver(changed);
    if (preferences) preference.observe(preferences, { attributes: true, attributeFilter: ["data-motion"] });
    motion.addEventListener("change", changed);
    window.addEventListener("t-house:intro-done", stop);
    html.dataset.intro = "running";
    changed();

    const poster = new Image();
    poster.src = "/images/arrival-poster.jpg";
    const decoded = poster.decode().catch(() => {});

    async function animate() {
      try {
        const { gsap } = await import("gsap");
        if (disposed) return;
        const outlines = overlay!.querySelectorAll(".elevation-outline path");
        const details = overlay!.querySelectorAll(".elevation-detail path");
        [...outlines, ...details].forEach(path => path.setAttribute("pathLength", "1"));
        const light = overlay!.querySelector(`.${styles.door}`);
        const figure = overlay!.querySelector(`.${styles.figure}`);
        draw = gsap.timeline()
          .to(outlines, { strokeDashoffset: 0, autoRound: false, duration: 0.96, stagger: 0.08, ease: "power2.out" }, 0.2)
          .to(details, { strokeDashoffset: 0, autoRound: false, duration: 0.6, stagger: 0.03, ease: "power2.out" }, 0.8)
          .set(light, { opacity: 1 }, 1.3).set(light, { opacity: 0 }, 1.42)
          .set(light, { opacity: 1 }, 1.54).set(light, { opacity: 0 }, 1.66)
          .set(light, { opacity: 1 }, 1.78)
          .to(overlay!.querySelector(`.${styles.title}`), { opacity: 1, duration: 0.5 }, 1.3)
          .play(elapsed());
        await Promise.all([decoded, new Promise<void>(resolve => {
          wait = setTimeout(resolve, Math.max(0, 1900 - elapsed() * 1000));
        })]);
        if (disposed) return;
        if (!document.querySelector("[data-arrival-enhanced]")) { finish(); return; }
        const bounds = frame!.getBoundingClientRect();
        const opening = door!.getBoundingClientRect();
        frame!.style.clipPath = `inset(${opening.top - bounds.top}px ${bounds.right - opening.right}px ${bounds.bottom - opening.bottom}px ${opening.left - bounds.left}px)`;
        html.dataset.intro = "opening";
        window.dispatchEvent(new Event("t-house:intro-aperture"));
        const duration = Math.max(0, Math.min(1.2, 3.1 - elapsed()));
        aperture = gsap.timeline({ onComplete: finish })
          .to(frame!, { clipPath: "inset(0px 0px 0px 0px)", duration, ease: "power2.inOut" }, 0)
          .to(figure, { scale: 1.08, opacity: 0, duration, ease: "power2.inOut" }, 0);
      } catch { finish(); }
    }
    void animate();
    return () => {
      stop(); preference.disconnect(); motion.removeEventListener("change", changed);
      window.removeEventListener("t-house:intro-done", stop);
    };
  }, [active]);

  if (!active) return null;
  return <div ref={root} className={styles.overlay} aria-hidden="true" data-home-intro>
    <div className={styles.figure}>
      <div className={styles.drawing}>
        <HouseElevation />
        <svg className={styles.door} viewBox="0 0 1000 540"><rect x="387" y="381" width="54" height="45" /></svg>
      </div>
      <p className={styles.title}>The T-House</p>
    </div>
  </div>;
}
