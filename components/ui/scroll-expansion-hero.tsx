"use client";

import { useEffect, useRef, useState } from "react";
import { HeroCarousel } from "../hero-carousel";
import { HouseElevation } from "../house-elevation";
import styles from "./scroll-expansion-hero.module.css";

export function ScrollExpansionHero() {
  const root = useRef<HTMLElement>(null);
  const settle = useRef<() => void>(() => {});
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(false);
  const [playable, setPlayable] = useState(false);

  useEffect(() => {
    const scene = root.current;
    const stage = scene?.querySelector<HTMLElement>("[data-arrival-stage]");
    const frame = scene?.querySelector<HTMLElement>("[data-arrival-media]");
    const video = frame?.querySelector("video");
    const art = frame?.parentElement;
    const preferences = scene?.closest<HTMLElement>("[data-motion], .prototype");
    if (!scene || !stage || !frame || !video || !art || !preferences) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    let disposed = false;
    let visible = false;
    let failed = false;
    let teardown: (() => void) | undefined;
    let generation = 0;

    function eligible() {
      return preferences?.dataset.motion === "full" && !query.matches;
    }

    function playback() {
      if (!video || !scene) return;
      const watchActive = scene.querySelector('[data-carousel-slide][data-active="true"] [data-destination="watch"]');
      const canPlay = eligible() && visible && !!watchActive && !document.hidden && !failed;
      setPlayable(eligible() && !failed);
      if (!eligible() && video.hasAttribute("src")) {
        video.pause(); video.removeAttribute("src"); video.load();
      }
      if (!canPlay || userPaused.current) {
        video.pause();
        return;
      }
      if (!video.hasAttribute("src")) video.src = "/videos/arrival.mp4";
      video.muted = true;
      void video.play().catch((error: unknown) => {
        if (!disposed && !(error instanceof DOMException && error.name === "AbortError")) {
          userPaused.current = true; setPaused(true);
        }
      });
    }

    const onError = () => {
      failed = true; video.pause(); video.removeAttribute("src"); video.load(); setPlayable(false);
    };
    video.addEventListener("error", onError);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      playback();
    });
    visibility.observe(stage);
    document.addEventListener("visibilitychange", playback);
    scene.addEventListener("arrival-playback", playback);
    const selection = new MutationObserver(playback);
    selection.observe(scene, { subtree: true, attributes: true, attributeFilter: ["data-active"] });

    async function configure() {
      const version = ++generation;
      teardown?.();
      teardown = undefined;
      playback();
      if (!eligible()) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (disposed || generation !== version || !eligible()) return;
      gsap.registerPlugin(ScrollTrigger);
      if (!scene || !stage || !frame || !art) return;
      let chosen = false;
      let landing = { left: 0, top: 0, width: 0, height: 0 };
      let progress = 0;
      scene.dataset.arrivalEnhanced = "true";

      function draw(value: number) {
        if (!scene || !stage || !frame || !art) return;
        progress = chosen ? 1 : value;
        const morphing = progress < 0.999;
        scene.toggleAttribute("data-arrival-morph", morphing);
        stage.style.setProperty("--arrival-reveal", String(Math.min(1, progress * 1.7)));
        if (!morphing) {
          if (frame.parentElement !== art) { art.append(frame); playback(); }
          frame.removeAttribute("style");
          return;
        }
        if (frame.parentElement !== stage) { stage.append(frame); playback(); }
        const mix = (from: number, to: number) => from + (to - from) * progress;
        Object.assign(frame.style, {
          position: "absolute", zIndex: "5", left: `${mix(0, landing.left)}px`,
          top: `${mix(0, landing.top)}px`, width: `${mix(stage.clientWidth, landing.width)}px`,
          height: `${mix(stage.clientHeight, landing.height)}px`,
        });
      }

      function measure() {
        if (!stage || !art || !scene) return;
        scene.setAttribute("data-arrival-morph", "");
        const box = art.getBoundingClientRect();
        const bounds = stage.getBoundingClientRect();
        landing = { left: box.left - bounds.left, top: box.top - bounds.top, width: box.width, height: box.height };
        draw(progress);
      }

      measure();
      const trigger = ScrollTrigger.create({
        trigger: scene, start: "top top", end: () => `+=${scene.offsetHeight - stage.offsetHeight}`,
        scrub: true, onUpdate: (self) => draw(self.progress), onRefresh: measure,
      });
      draw(trigger.progress);
      const resize = new ResizeObserver(() => { measure(); trigger.refresh(); });
      resize.observe(stage);
      settle.current = () => { chosen = true; draw(1); };
      // History restores the browsed selection rather than replaying its entrance.
      if (scene.querySelector('[data-carousel-slide][data-active="true"] [data-destination]:not([data-destination="watch"])')) settle.current();
      teardown = () => {
        resize.disconnect(); trigger.kill(); settle.current = () => {};
        art.append(frame); frame.removeAttribute("style");
        delete scene.dataset.arrivalEnhanced; scene.removeAttribute("data-arrival-morph");
        stage.style.removeProperty("--arrival-reveal");
      };
    }

    const mode = new MutationObserver(() => { void configure(); });
    mode.observe(preferences, { attributes: true, attributeFilter: ["data-motion"] });
    query.addEventListener("change", configure);
    void configure();
    return () => {
      disposed = true; generation++; teardown?.(); video.pause();
      visibility.disconnect(); selection.disconnect(); mode.disconnect();
      query.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", playback);
      scene.removeEventListener("arrival-playback", playback);
      video.removeEventListener("error", onError);
    };
  }, []);

  function explore() {
    settle.current();
    const scene = root.current;
    const stage = scene?.querySelector<HTMLElement>("[data-arrival-stage]");
    if (scene?.dataset.arrivalEnhanced && stage) window.scrollTo({ top: scene.offsetTop + scene.offsetHeight - stage.offsetHeight, behavior: "instant" });
    scene?.querySelector<HTMLElement>('[data-active="true"] a')?.focus({ preventScroll: true });
  }

  return <section id="arrival" ref={root} className={styles.scene} aria-labelledby="arrival-heading">
    <div className={styles.stage} data-arrival-stage>
      <h1 id="arrival-heading" className="sr-only">The T-House Studio</h1>
      <div className={`hero-environment ${styles.house}`} aria-hidden="true"><div className="arrival-art"><HouseElevation /></div></div>
      <div className={styles.actions}>
        <a href="#arrival-carousel" onClick={(event) => { event.preventDefault(); explore(); }}>Explore carousel ↓</a>
        {playable && <button type="button" onClick={() => {
          userPaused.current = !userPaused.current;
          setPaused(userPaused.current);
          root.current?.dispatchEvent(new Event("arrival-playback"));
        }}>{paused ? "Play video" : "Pause video"}</button>}
      </div>
      <div id="arrival-carousel" className={styles.carousel}
        onFocusCapture={() => settle.current()}
        onPointerDownCapture={() => settle.current()}
        onKeyDownCapture={() => settle.current()}>
        <HeroCarousel />
      </div>
    </div>
  </section>;
}
