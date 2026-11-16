"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { loadGsap, rollChars, splitText, textMotionAllowed, watchTextMotion } from "../lib/text-motion";
import { useCardRouteTransition } from "./card-route-transition";
import { HouseOutline } from "./house-outline";
import { GraffitiArrow } from "./ui/graffiti-arrow";
import { WarpCarousel } from "./ui/warp-carousel";
import styles from "./hero-carousel.module.css";

const destinations = [
  { id: "watch", label: "Watch", href: "/watch", image: "/images/arrival-poster.jpg" },
  { id: "inside", label: "Inside the House", href: "/inside-the-house", image: "/images/threshold-detail.webp" },
  { id: "about", label: "About", href: "/about" },
  { id: "connect", label: "Connect", href: "/connect" },
] as const;

const historyKey = "tHouseHeroCard";
const step = 360 / destinations.length;

type Drag = {
  pointer: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  moved: boolean;
};

function wrap(index: number) {
  return ((index % destinations.length) + destinations.length) % destinations.length;
}

function centerOf(rail: HTMLUListElement, slide: Element) {
  const bounds = slide.getBoundingClientRect();
  const railBounds = rail.getBoundingClientRect();
  return rail.scrollLeft + bounds.left - railBounds.left + (bounds.width - rail.clientWidth) / 2;
}

type Landing = { finish: () => void };

/** Split Text: the label's letters drop onto the sticker one by one with a slight tilt. */
function landLabel(gsap: typeof import("gsap").gsap, label: HTMLElement) {
  const split = splitText(label);
  if (!split) return;
  const timeline = gsap.timeline({ onComplete: () => split.revert() });
  timeline.fromTo(split.chars, {
    yPercent: -95,
    opacity: 0,
    rotation: () => gsap.utils.random(-14, 14, 1),
    transformOrigin: "50% 100%",
  }, {
    yPercent: 0,
    opacity: 1,
    rotation: 0,
    duration: 0.46,
    ease: "back.out(2.4)",
    stagger: 0.035,
  });
  return timeline;
}

function closestCard(rail: HTMLUListElement) {
  const distances = Array.from(rail.children, (slide) => Math.abs(centerOf(rail, slide) - rail.scrollLeft));
  return distances.indexOf(Math.min(...distances));
}

export function HeroCarousel({ onBrowse }: { onBrowse?: () => void }) {
  const rail = useRef<HTMLUListElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const shown = useRef<number>(null);
  const landing = useRef<Landing>(null);
  const browsed = useRef(0);
  const drag = useRef<Drag>(null);
  const ignoreClick = useRef(false);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [orbit, setOrbit] = useState(false);
  const [rotation, setRotation] = useState({ angle: 0, instant: true });
  const router = useRouter();
  const { busy, start } = useCardRouteTransition();

  useEffect(() => {
    const list = rail.current;
    if (!list) return;
    const preferences = list.closest<HTMLElement>("[data-motion], .prototype");
    const media = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const supported = CSS.supports("transform", "perspective(100px) translate3d(0, 0, -1px) rotateY(1deg)");
    const saved: unknown = window.history.state?.[historyKey];
    if (typeof saved === "number" && list.children[saved]) browsed.current = saved;

    function updateMode() {
      drag.current = null;
      list?.removeAttribute("data-dragging");
      setActive(browsed.current);
      setRotation({ angle: browsed.current * step, instant: true });
      setOrbit(supported && preferences?.dataset.motion === "full" && !media.matches);
    }

    const observer = new MutationObserver(updateMode);
    if (preferences) observer.observe(preferences, { attributes: true, attributeFilter: ["data-motion"] });
    media.addEventListener("change", updateMode);
    updateMode();
    setEnhanced(true);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMode);
    };
  }, []);

  useLayoutEffect(() => {
    const list = rail.current;
    if (!list || !enhanced || orbit) return;

    let frame = 0;

    function syncPosition(list: HTMLUListElement) {
      const index = closestCard(list);
      browsed.current = index;
      setActive(index);
    }

    function onScroll() {
      if (!list) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => syncPosition(list));
    }

    function restorePosition() {
      if (!list) return;
      const slide = list.children[browsed.current];
      if (!slide) return;
      list.scrollTo({ left: centerOf(list, slide), behavior: "instant" });
      syncPosition(list);
    }

    const observer = new ResizeObserver(restorePosition);
    list.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(list);
    restorePosition();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      list.removeEventListener("scroll", onScroll);
    };
  }, [enhanced, orbit]);

  useEffect(() => {
    const position = counter.current;
    const previous = shown.current;
    if (!enhanced || !position) return;
    shown.current = active;
    if (previous === null || previous === active || !textMotionAllowed(position)) return;

    const forward = orbit ? wrap(active - previous) <= destinations.length / 2 : active > previous;
    const label = rail.current?.children[active]?.querySelector<HTMLElement>(`.${styles.label}`);
    let cancelled = false;
    let stopWatching: (() => void) | undefined;
    const runs: { timeline: gsap.core.Timeline; revert?: () => void }[] = [];
    const finish = () => {
      cancelled = true;
      stopWatching?.();
      runs.splice(0).forEach(({ timeline, revert }) => {
        timeline.progress(1);
        revert?.();
      });
      landing.current = null;
    };
    landing.current = { finish };

    void loadGsap().then((gsap) => {
      if (cancelled) return;
      stopWatching = watchTextMotion(position, (allowed) => { if (!allowed) finish(); });
      if (cancelled) return;
      const split = splitText(position);
      if (split) {
        runs.push({
          timeline: rollChars(gsap, split.chars, { direction: forward ? 1 : -1, from: `${previous + 1} / ${destinations.length}`, steps: 2, duration: 0.5 })
            .eventCallback("onComplete", () => split.revert()),
          revert: () => split.revert(),
        });
      }
      const timeline = label && landLabel(gsap, label);
      if (timeline) runs.push({ timeline });
    }).catch(() => {});

    return finish;
  }, [active, enhanced, orbit]);

  function selectTurn(angle: number, instant: boolean) {
    const index = wrap(Math.round(angle / step));
    browsed.current = index;
    setActive(index);
    setRotation({ angle, instant });
  }

  function browse(index: number, withMotion: boolean) {
    if (busy) return;
    if (orbit) {
      const current = Math.round(rotation.angle / step);
      const offset = wrap(index - wrap(current) + destinations.length / 2) - destinations.length / 2;
      selectTurn((current + offset) * step, !withMotion);
      return;
    }

    const list = rail.current;
    const slide = list?.children[index];
    if (!list || !slide) return;

    list.scrollTo({
      left: centerOf(list, slide),
      behavior: withMotion && list.closest("[data-motion='full']") ? "smooth" : "instant",
    });
  }

  function browseWithKeys(event: KeyboardEvent<HTMLUListElement>) {
    if (busy || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const slide = (event.target as HTMLElement).closest("[data-carousel-slide]");
    const current = slide ? Array.from(event.currentTarget.children).indexOf(slide) : active;
    const next = event.key === "Home" ? 0 : event.key === "End" ? destinations.length - 1
      : current + (event.key === "ArrowLeft" ? -1 : 1);
    const link = rail.current?.children[orbit ? wrap(next) : next]?.querySelector("a");
    event.preventDefault();
    link?.focus({ preventScroll: true });
  }

  function beginDrag(event: PointerEvent<HTMLUListElement>) {
    ignoreClick.current = false;
    if (!orbit || busy || !event.isPrimary || event.button !== 0) return;
    const width = event.currentTarget.firstElementChild?.clientWidth ?? 160;
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, angle: rotation.angle,
      distance: Math.max(115, width), moved: false };
  }

  function moveDrag(event: PointerEvent<HTMLUListElement>) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    const dx = event.clientX - current.x;
    if (!current.moved) {
      const dy = event.clientY - current.y;
      if (Math.abs(dx) < 9 && Math.abs(dy) < 9) return;
      if (Math.abs(dx) <= Math.abs(dy)) {
        drag.current = null;
        return;
      }
      const shown = Number.parseFloat(getComputedStyle(event.currentTarget).getPropertyValue("--t-house-orbit-angle"));
      if (Number.isFinite(shown)) current.angle = shown;
      current.moved = true;
      onBrowse?.();
      ignoreClick.current = true;
      event.currentTarget.setAttribute("data-dragging", "");
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setRotation({ angle: current.angle - dx / current.distance * step, instant: true });
  }

  function endDrag(event: PointerEvent<HTMLUListElement>) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    drag.current = null;
    if (!current.moved) return;
    event.currentTarget.removeAttribute("data-dragging");
    const dx = current.x - event.clientX;
    const from = Math.round(current.angle / step);
    const nearest = Math.round(current.angle / step + dx / current.distance);
    const flick = nearest === from && Math.abs(dx) > 30;
    const turn = event.type === "pointerup" ? nearest + (flick ? Math.sign(dx) : 0) : Math.round(rotation.angle / step);
    selectTurn(turn * step, false);
  }

  return (
    <nav className={styles.carousel} aria-label="Explore The T-House" data-enhanced={enhanced}>
      <div className={styles.stage}>
        <WarpCarousel className={styles.rail} data-carousel-rail aria-busy={busy || undefined}
          navigation={{ railRef: rail, enabled: orbit, position: rotation.angle / step, motion: !rotation.instant }}
          onKeyDown={browseWithKeys} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={(event) => { if (event.target === event.currentTarget) endDrag(event); }}
          onPointerLeave={() => { if (drag.current && !drag.current.moved) drag.current = null; }}
          onClickCapture={(event) => {
            if (ignoreClick.current && event.detail > 0) {
              ignoreClick.current = false;
              event.preventDefault();
            }
          }}>
          {destinations.map((card, index) => (
            <li key={card.id} className={styles.slide} data-carousel-slide data-active={index === active}>
              <Link
                href={card.href}
                className={styles.card}
                data-destination={card.id}
                prefetch={false}
                draggable={false}
                onPointerEnter={() => router.prefetch(card.href)}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) browse(index, false);
                  router.prefetch(card.href);
                }}
                onNavigate={(event) => {
                  const link = rail.current?.children[index]?.querySelector("a");
                  if (!busy && rail.current) {
                    window.history.replaceState({ ...window.history.state, [historyKey]: browsed.current }, "");
                  }
                  landing.current?.finish();
                  if (link && start(link, card)) {
                    event.preventDefault();
                    if (!busy) router.prefetch(card.href);
                  }
                }}
              >
                <span className={styles.art} aria-hidden="true">
                  {card.id === "watch" && <span data-arrival-media className={styles.videoFrame}>
                    <Image src="/images/arrival-poster.jpg" alt="" fill unoptimized sizes="100vw" draggable={false} />
                  </span>}
                  {card.id === "watch" ? null : "image" in card ? (
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      draggable={false}
                      sizes="(min-width: 576px) and (hover: hover) and (pointer: fine) min(683px, calc(100vw - 40px)), (min-width: 768px) 192px, (min-width: 400px) 184px, 46vw"
                    />
                  ) : <HouseOutline />}
                </span>
                <span>
                  {card.id === "inside" && <span className={styles.caption} aria-hidden="true">Concept artwork</span>}
                  <span className={styles.label}>{card.label}</span>
                </span>
              </Link>
            </li>
          ))}
        </WarpCarousel>
      </div>
      <div className={styles.controls}>
        <button className={styles.control} type="button" aria-label="Previous destination"
          aria-disabled={busy || (!orbit && active === 0)} onClick={() => browse(active - 1, true)}>
          <GraffitiArrow direction="left" />
        </button>
        <span ref={counter} className={styles.position} aria-hidden="true">{active + 1} / {destinations.length}</span>
        <button className={styles.control} type="button" aria-label="Next destination"
          aria-disabled={busy || (!orbit && active === destinations.length - 1)} onClick={() => browse(active + 1, true)}>
          <GraffitiArrow direction="right" />
        </button>
      </div>
      <span className="sr-only" role="status">{enhanced ? `${destinations[active].label}, ${active + 1} of ${destinations.length}` : ""}</span>
    </nav>
  );
}
