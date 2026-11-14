"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { featuredVideo } from "../content/studio";
import { useCardRouteTransition } from "./card-route-transition";
import { HouseOutline } from "./house-outline";
import styles from "./hero-carousel.module.css";

const destinations = [
  { id: "watch", label: "Watch", href: "/watch", image: featuredVideo.thumbnail, tone: "#1d140f" },
  { id: "inside", label: "Inside the House", href: "/inside-the-house", image: "/images/threshold-detail.webp", tone: "#19110d" },
  { id: "about", label: "About", href: "/about", tone: "#211712" },
  { id: "connect", label: "Connect", href: "/connect", tone: "#251810" },
] as const;

const historyKey = "tHouseHeroCard";

function centerOf(rail: HTMLUListElement, slide: Element) {
  const bounds = slide.getBoundingClientRect();
  const railBounds = rail.getBoundingClientRect();
  return rail.scrollLeft + bounds.left - railBounds.left + (bounds.width - rail.clientWidth) / 2;
}

function closestCard(rail: HTMLUListElement) {
  const distances = Array.from(rail.children, (slide) => Math.abs(centerOf(rail, slide) - rail.scrollLeft));
  return distances.indexOf(Math.min(...distances));
}

export function HeroCarousel() {
  const rail = useRef<HTMLUListElement>(null);
  const browsed = useRef(0);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const router = useRouter();
  const { busy, start } = useCardRouteTransition();

  useEffect(() => {
    const list = rail.current;
    if (!list) return;

    let frame = 0;
    let restoring = true;

    function syncPosition(list: HTMLUListElement) {
      const index = closestCard(list);
      browsed.current = index;
      setActive(index);
    }

    function onScroll() {
      if (!list || restoring) return;
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
    const saved: unknown = window.history.state?.[historyKey];
    browsed.current = typeof saved === "number" && list.children[saved] ? saved : closestCard(list);
    const ready = requestAnimationFrame(() => {
      restorePosition();
      restoring = false;
      setEnhanced(true);
    });

    return () => {
      cancelAnimationFrame(ready);
      cancelAnimationFrame(frame);
      observer.disconnect();
      list.removeEventListener("scroll", onScroll);
    };
  }, []);

  function browse(index: number, withMotion: boolean) {
    const list = rail.current;
    const slide = list?.children[index];
    if (!list || !slide || busy) return;

    list.scrollTo({
      left: centerOf(list, slide),
      behavior: withMotion && list.closest("[data-motion='full']") ? "smooth" : "instant",
    });
  }

  function browseWithKeys(event: KeyboardEvent<HTMLUListElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const slide = (event.target as HTMLElement).closest("[data-carousel-slide]");
    const current = slide ? Array.from(event.currentTarget.children).indexOf(slide) : active;
    const next = event.key === "Home" ? 0 : event.key === "End" ? destinations.length - 1
      : current + (event.key === "ArrowLeft" ? -1 : 1);
    const link = rail.current?.children[next]?.querySelector("a");
    event.preventDefault();
    link?.focus({ preventScroll: true });
  }

  return (
    <nav className={styles.carousel} aria-label="Explore The T-House" data-enhanced={enhanced}>
      <ul className={styles.rail} ref={rail} data-carousel-rail onKeyDown={browseWithKeys}>
        {destinations.map((card, index) => (
          <li key={card.id} className={styles.slide} data-carousel-slide data-active={index === active}
            data-side={index < active ? "before" : index > active ? "after" : undefined}>
            <Link
              href={card.href}
              className={styles.card}
              data-destination={card.id}
              prefetch={false}
              onPointerEnter={() => router.prefetch(card.href)}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) browse(index, false);
                router.prefetch(card.href);
              }}
              onNavigate={(event) => {
                const link = rail.current?.children[index]?.querySelector("a");
                if (!busy && rail.current) {
                  window.history.replaceState({ ...window.history.state, [historyKey]: closestCard(rail.current) }, "");
                }
                if (link && start(link, card)) {
                  event.preventDefault();
                  if (!busy) router.prefetch(card.href);
                }
              }}
            >
              <span className={styles.art} aria-hidden="true">
                {"image" in card ? (
                  <Image src={card.image} alt="" fill sizes="(min-width: 768px) 368px, 78vw" unoptimized={card.id === "watch"} />
                ) : <HouseOutline />}
              </span>
              {card.id === "inside" && <span className={styles.caption} aria-hidden="true">Concept artwork</span>}
              <span className={styles.label}>{card.label}</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.controls}>
        <button className={styles.control} type="button" aria-label="Previous destination"
          aria-disabled={busy || active === 0} onClick={() => browse(active - 1, true)}>
          <span aria-hidden="true">←</span>
        </button>
        <span className={styles.position} aria-hidden="true">{active + 1} / {destinations.length}</span>
        <button className={styles.control} type="button" aria-label="Next destination"
          aria-disabled={busy || active === destinations.length - 1} onClick={() => browse(active + 1, true)}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <span className="sr-only" role="status">{enhanced ? `${destinations[active].label}, ${active + 1} of ${destinations.length}` : ""}</span>
    </nav>
  );
}
