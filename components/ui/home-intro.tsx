"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { HouseElevation } from "../house-elevation";
import styles from "./home-intro.module.css";

const subscribe = (notify: () => void) => {
  window.addEventListener("t-house:intro-done", notify);
  return () => window.removeEventListener("t-house:intro-done", notify);
};
const isActive = () => ["pending", "running", "ready", "opening"].includes(document.documentElement.dataset.intro ?? "");
const serverSnapshot = () => false;

function splitLines(overlay: HTMLElement) {
  const segments: { path: SVGPathElement; order: number }[] = [];
  overlay.querySelectorAll<SVGPathElement>(".house-elevation path").forEach(source => {
    const tokens = source.getAttribute("d")!.match(/[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g)!;
    let x = 0, y = 0, startX = 0, startY = 0, command = "", index = 0;
    while (index < tokens.length) {
      if (/^[a-zA-Z]$/.test(tokens[index])) command = tokens[index++];
      const relative = command === command.toLowerCase();
      const kind = command.toUpperCase();
      let nextX = x, nextY = y;
      if (kind === "Z") { nextX = startX; nextY = startY; command = ""; }
      else if (kind === "H") nextX = Number(tokens[index++]) + (relative ? x : 0);
      else if (kind === "V") nextY = Number(tokens[index++]) + (relative ? y : 0);
      else if (kind === "M" || kind === "L") {
        nextX = Number(tokens[index++]) + (relative ? x : 0);
        nextY = Number(tokens[index++]) + (relative ? y : 0);
      } else throw new Error("Unsupported elevation line command");
      if (kind === "M") { startX = nextX; startY = nextY; command = relative ? "l" : "L"; }
      else if (x !== nextX || y !== nextY) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M${x} ${y}L${nextX} ${nextY}`);
        path.setAttribute("pathLength", "1");
        const door = Math.min(x, nextX) >= 345 && Math.max(x, nextX) <= 485 && Math.min(y, nextY) >= 300;
        const ground = Math.min(y, nextY) >= 430;
        const detail = source.closest(".elevation-detail");
        const guide = source.closest(".elevation-guides");
        const wall = x === nextX && Math.abs(y - nextY) > 70;
        const order = door ? 4 : ground || guide ? 0 : detail ? 3 : wall ? 1 : 2;
        path.dataset.segmentOrder = String(order);
        if (Math.min(x, nextX) >= 387 && Math.max(x, nextX) <= 441 && Math.min(y, nextY) >= 381 && Math.max(y, nextY) <= 426) path.dataset.doorPanelLine = "true";
        source.before(path);
        segments.push({ path, order });
      }
      x = nextX; y = nextY;
    }
    source.remove();
  });
  return segments.sort((a, b) => a.order - b.order).map(({ path }, index) => {
    path.dataset.introSegment = String(index);
    return path;
  });
}

export function HomeIntro() {
  const active = useSyncExternalStore(subscribe, isActive, serverSnapshot);
  const root = useRef<HTMLDivElement>(null);
  const enter = useRef<(event?: Event, immediate?: boolean) => void>(() => {});
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const overlay = root.current;
    if (!active || !overlay) return;
    const html = document.documentElement;
    const frame = document.querySelector<HTMLElement>("[data-arrival-media]");
    const button = overlay.querySelector<HTMLButtonElement>("button")!;
    const figure = overlay.querySelector<HTMLElement>("[data-gate-figure]")!;
    const shade = overlay.querySelector<HTMLElement>("[data-gate-shade]")!;
    const door = overlay.querySelector<HTMLElement>("[data-gate-door]")!;
    const panel = overlay.querySelector<HTMLElement>("[data-gate-panel]")!;
    const reveal = overlay.querySelector<SVGRectElement>("[data-spray-reveal]")!;
    const brush = overlay.querySelector<SVGRectElement>("[data-spray-brush]")!;
    const previousFocus = document.activeElement;
    const outside = [...document.body.children].filter((node): node is HTMLElement => node instanceof HTMLElement && node !== overlay).map(node => ({ node, inert: node.inert }));
    outside.forEach(({ node }) => { node.inert = true; });
    let disposed = false;
    let phase = "drawing";
    let ignoredEvent: Event | undefined;
    let gsap: (typeof import("gsap"))["gsap"] | undefined;
    let draw: { kill: () => void } | undefined;
    let opening: { kill: () => void } | undefined;
    const segments = splitLines(overlay);
    const finish = () => {
      html.dataset.intro = "done";
      window.dispatchEvent(new Event("t-house:intro-done"));
    };
    const stop = () => {
      disposed = true;
      draw?.kill(); opening?.kill();
      frame?.style.removeProperty("clip-path");
      outside.forEach(({ node, inert }) => { node.inert = inert; });
      const target = previousFocus instanceof HTMLElement && previousFocus.isConnected ? previousFocus : document.body;
      const tabIndex = target.getAttribute("tabindex");
      if (target === document.body) target.tabIndex = -1;
      target.focus({ preventScroll: true });
      if (target === document.body && tabIndex === null) target.removeAttribute("tabindex");
    };
    const ready = () => {
      if (disposed || phase === "opening") return;
      draw?.kill();
      segments.forEach(path => { path.style.strokeDashoffset = "0"; });
      reveal.setAttribute("width", "800");
      brush.setAttribute("x", "800");
      phase = "ready";
      html.dataset.intro = "ready";
      overlay.dataset.phase = "ready";
      button.tabIndex = 0;
      button.focus({ preventScroll: true });
    };
    const forward = (event: Event) => {
      if (phase !== "drawing") return;
      ignoredEvent = (event as CustomEvent<Event>).detail;
      ready();
    };
    const hole = (left: number, top: number, right: number, bottom: number) => `polygon(evenodd, 0px 0px, ${innerWidth}px 0px, ${innerWidth}px ${innerHeight}px, 0px ${innerHeight}px, 0px 0px, ${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px)`;
    enter.current = (event, immediate = false) => {
      if (phase !== "ready" || event === ignoredEvent) return;
      phase = "opening";
      html.dataset.intro = "opening";
      overlay.dataset.phase = "opening";
      button.style.opacity = "0";
      button.style.visibility = "hidden";
      window.dispatchEvent(new Event("t-house:intro-aperture"));
      if (immediate || !gsap || !frame) { finish(); return; }
      const bounds = frame.getBoundingClientRect();
      const doorway = door.getBoundingClientRect();
      const box = figure.getBoundingClientRect();
      const centerX = doorway.left + doorway.width / 2;
      const centerY = doorway.top + doorway.height / 2;
      const revealDoor = () => {
        const rect = door.getBoundingClientRect();
        frame.style.clipPath = `inset(${Math.max(0, rect.top - bounds.top)}px ${Math.max(0, bounds.right - rect.right)}px ${Math.max(0, bounds.bottom - rect.bottom)}px ${Math.max(0, rect.left - bounds.left)}px)`;
        shade.style.clipPath = hole(Math.max(0, rect.left), Math.max(0, rect.top), Math.min(innerWidth, rect.right), Math.min(innerHeight, rect.bottom));
      };
      revealDoor();
      gsap.set(figure, { transformOrigin: `${centerX - box.left}px ${centerY - box.top}px` });
      opening = gsap.timeline({ onComplete: finish })
        .to(panel, { rotateY: -108, duration: 0.6, ease: "power2.inOut" })
        .to(figure, { scale: Math.max(innerWidth / doorway.width, innerHeight / doorway.height) * 1.15, x: innerWidth / 2 - centerX, y: innerHeight / 2 - centerY, duration: 1, ease: "power2.inOut", onUpdate: revealDoor }, 0.6)
        .to(figure, { opacity: 0, duration: 0.2 }, 1.4);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event === ignoredEvent) return;
      if (event.key === "Escape" && phase === "ready") { event.preventDefault(); enter.current(event, true); }
      if (event.key === "Tab") { event.preventDefault(); (phase === "ready" ? button : overlay).focus({ preventScroll: true }); }
    };
    const focus = (event: FocusEvent) => {
      if (disposed) return;
      if (!overlay.contains(event.target as Node)) (phase === "ready" ? button : overlay).focus({ preventScroll: true });
    };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const preferences = document.querySelector(".prototype");
    const changed = () => { if (motion.matches || preferences?.getAttribute("data-motion") === "reduced") finish(); };
    const preference = new MutationObserver(changed);
    if (preferences) preference.observe(preferences, { attributes: true, attributeFilter: ["data-motion"] });
    motion.addEventListener("change", changed);
    window.addEventListener("t-house:intro-done", stop);
    window.addEventListener("t-house:intro-forward", forward);
    document.addEventListener("keydown", keydown);
    document.addEventListener("focusin", focus);
    html.dataset.intro = "running";
    overlay.dataset.phase = "drawing";
    overlay.focus({ preventScroll: true });
    changed();
    if (html.dataset.introFastForward === "true") ready();

    void import("gsap").then(module => {
      if (disposed) return;
      gsap = module.gsap;
      if (phase !== "drawing") return;
      const timeline = gsap.timeline({ onComplete: ready });
      draw = timeline;
      const step = 3.5 / segments.length;
      segments.forEach((path, index) => timeline.to(path, { strokeDashoffset: 0, autoRound: false, duration: step * 1.3, ease: "none" }, 0.1 + index * step));
      timeline.set(overlay, { attr: { "data-phase": "spraying" } }, 3.65)
        .to(reveal, { attr: { width: 800 }, duration: 1.2, ease: "none" }, 3.65)
        .to(brush, { attr: { x: 800 }, duration: 1.2, ease: "none" }, 3.65)
        .to(button, { opacity: 1, visibility: "visible", duration: 0.3 }, 4.85);
    }).catch(ready);
    return () => {
      stop(); preference.disconnect(); motion.removeEventListener("change", changed);
      window.removeEventListener("t-house:intro-done", stop);
      window.removeEventListener("t-house:intro-forward", forward);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("focusin", focus);
      enter.current = () => {};
    };
  }, [active]);

  if (!active) return null;
  return createPortal(<div ref={root} className={styles.overlay} role="dialog" aria-modal="true" aria-label="Welcome to The T-House" tabIndex={-1} data-home-intro>
    <div className={styles.shade} data-gate-shade />
    <div className={styles.figure} data-gate-figure>
      <div className={styles.drawing} aria-hidden="true">
        <HouseElevation />
        <div className={styles.door} data-gate-door><div className={styles.panel} data-gate-panel /></div>
      </div>
      <svg className={styles.title} viewBox="0 0 800 180" role="img" aria-label="The T-House">
        <defs>
          <filter id={`${id}-brush`}><feGaussianBlur stdDeviation="9" /></filter>
          <filter id={`${id}-spray`} x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="paint" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 3 0 0 0 -0.6" result="grain" />
            <feComposite in="paint" in2="grain" operator="in" />
          </filter>
          <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="180">
            <rect data-spray-reveal x="0" y="0" width="0" height="180" fill="white" />
            <rect data-spray-brush x="-100" y="0" width="100" height="180" rx="50" fill="white" filter={`url(#${id}-brush)`} />
          </mask>
        </defs>
        <g mask={`url(#${id}-mask)`} fill="currentColor">
          <text x="400" y="122" textAnchor="middle" filter={`url(#${id}-spray)`}>The T-House</text>
          {Array.from({ length: 28 }, (_, i) => <circle key={i} cx={150 + (i * 137) % 500} cy={30 + (i * 43) % 125} r={0.6 + (i % 4) * 0.45} opacity={0.15 + (i % 3) * 0.1} />)}
        </g>
      </svg>
      <button type="button" className={styles.button} tabIndex={-1} onClick={event => enter.current(event.nativeEvent)}>Enter the house</button>
    </div>
  </div>, document.body);
}
