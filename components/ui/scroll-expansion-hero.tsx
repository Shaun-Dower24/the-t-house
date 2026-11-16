"use client";

import { useEffect, useRef } from "react";
import { HeroCarousel } from "../hero-carousel";
import { HouseElevation } from "../house-elevation";
import { HomeIntro } from "./home-intro";
import { createYouTubeArrival } from "./youtube-arrival";
import styles from "./scroll-expansion-hero.module.css";

const historyKey = "tHouseArrivalSettled";

export function ScrollExpansionHero() {
  const root = useRef<HTMLElement>(null);
  const settle = useRef<() => void>(() => {});

  useEffect(() => {
    const scene = root.current;
    const stage = scene?.querySelector<HTMLElement>("[data-arrival-stage]");
    const frame = scene?.querySelector<HTMLElement>("[data-arrival-media]");
    const background = scene?.querySelector<HTMLVideoElement>("[data-carousel-background] video");
    const art = frame?.parentElement;
    const preferences = scene?.closest<HTMLElement>("[data-motion], .prototype");
    if (!scene || !stage || !frame || !background || !art || !preferences) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    let disposed = false;
    let visible = false;
    let failed = false;
    let backgroundFailed = false;
    let backgroundRevealed = false;
    let teardown: (() => void) | undefined;
    let generation = 0;
    const player = createYouTubeArrival(frame, () => { failed = true; });

    function eligible() {
      return preferences?.dataset.motion === "full" && !query.matches;
    }

    function backgroundError() {
      backgroundFailed = true;
      background?.pause();
      background?.parentElement?.removeAttribute("data-playing");
    }

    function backgroundPlaying() {
      if (!disposed) background?.parentElement?.setAttribute("data-playing", "true");
    }

    background.addEventListener("playing", backgroundPlaying);
    background.addEventListener("error", backgroundError);

    function playback() {
      if (disposed || !scene) return;
      const watchActive = scene.querySelector('[data-carousel-slide][data-active="true"] [data-destination="watch"]');
      const intro = document.documentElement.dataset.intro;
      const waitingForIntro = (intro === "pending" || intro === "running" || intro === "ready") && !window.history.state?.[historyKey];
      if (background) {
        const sources = background.querySelectorAll<HTMLSourceElement>("source");
        if (!eligible()) {
          background.pause();
          if (background.querySelector("source[src]")) {
            sources.forEach(source => source.removeAttribute("src"));
            background.load();
          }
          background.parentElement?.removeAttribute("data-playing");
        } else if (!visible || document.hidden || waitingForIntro || !backgroundRevealed || backgroundFailed) {
          background.pause();
        } else {
          if (!background.querySelector("source[src]")) {
            sources.forEach(source => { source.src = source.dataset.src!; });
            background.load();
          }
          background.muted = true;
          if (background.paused) void background.play().catch((error: unknown) => {
            if (!disposed && !(error instanceof DOMException && error.name === "AbortError")) backgroundError();
          });
        }
      }
      const canPlay = eligible() && visible && !!watchActive && !document.hidden && !failed && !waitingForIntro;
      player.update(canPlay, eligible() && !failed);
    }

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      playback();
    });
    visibility.observe(stage);
    document.addEventListener("visibilitychange", playback);
    window.addEventListener("t-house:intro-aperture", playback);
    window.addEventListener("t-house:intro-done", playback);
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
      let chosen = window.history.state?.[historyKey] === true;
      let landing = { left: 0, top: 0, width: 0, height: 0 };
      let progress = 0;
      scene.dataset.arrivalEnhanced = "true";

      function moveMedia(parent: HTMLElement) {
        if (!frame || frame.parentElement === parent) return;
        const container = parent as HTMLElement & { moveBefore?: (node: Node, child: Node | null) => void };
        if (container.moveBefore) container.moveBefore(frame, null);
        else { parent.append(frame); player.reconnect(); }
        playback();
      }

      function draw(value: number) {
        if (!scene || !stage || !frame || !art) return;
        progress = chosen ? 1 : value;
        const revealBackground = progress > 0.02;
        if (backgroundRevealed !== revealBackground) { backgroundRevealed = revealBackground; playback(); }
        const morphing = progress < 0.999;
        scene.toggleAttribute("data-arrival-morph", morphing);
        stage.style.setProperty("--arrival-reveal", String(Math.min(1, progress * 1.7)));
        if (!morphing) {
          moveMedia(art);
          frame.removeAttribute("style");
          return;
        }
        moveMedia(stage);
        const eased = 1 - (1 - progress) ** 2;
        const mix = (from: number, to: number) => from + (to - from) * eased;
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
      const rail = scene.querySelector("[data-carousel-rail]");
      if (rail) resize.observe(rail);
      settle.current = () => { chosen = true; draw(1); };
      teardown = () => {
        resize.disconnect(); trigger.kill(); settle.current = () => {};
        moveMedia(art); frame.removeAttribute("style");
        delete scene.dataset.arrivalEnhanced; scene.removeAttribute("data-arrival-morph");
        stage.style.removeProperty("--arrival-reveal");
      };
    }

    const mode = new MutationObserver(() => { void configure(); });
    mode.observe(preferences, { attributes: true, attributeFilter: ["data-motion"] });
    query.addEventListener("change", configure);
    void configure();
    return () => {
      disposed = true; generation++; player.destroy(); teardown?.();
      background.pause();
      background.removeEventListener("playing", backgroundPlaying);
      background.removeEventListener("error", backgroundError);
      visibility.disconnect(); selection.disconnect(); mode.disconnect();
      query.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", playback);
      window.removeEventListener("t-house:intro-aperture", playback);
      window.removeEventListener("t-house:intro-done", playback);
    };
  }, []);

  function settleArrival() {
    window.history.replaceState({ ...window.history.state, [historyKey]: true }, "");
    settle.current();
  }

  return <section id="arrival" ref={root} className={styles.scene} aria-labelledby="arrival-heading">
    <div className={styles.stage} data-arrival-stage>
      <HomeIntro />
      <h1 id="arrival-heading" className="sr-only">The T-House Studio</h1>
      <div className={styles.background} data-carousel-background aria-hidden="true">
        <video muted loop playsInline autoPlay preload="metadata" poster="/images/carousel-bg-poster.jpg" tabIndex={-1}>
          <source data-src="/videos/carousel-bg.webm" type="video/webm" />
          <source data-src="/videos/carousel-bg.mp4" type="video/mp4" />
        </video>
      </div>
      <div className={`hero-environment ${styles.house}`} aria-hidden="true"><div className="arrival-art"><HouseElevation /></div></div>
      <div id="arrival-carousel" className={styles.carousel}
        onFocusCapture={settleArrival}
        onPointerDownCapture={(event) => { if (event.pointerType === "mouse") settleArrival(); }}
        onClickCapture={settleArrival}
        onKeyDownCapture={settleArrival}>
        <HeroCarousel onBrowse={settleArrival} />
      </div>
    </div>
  </section>;
}
