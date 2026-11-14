"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { HouseOutline } from "./house-outline";
import styles from "./card-route-transition.module.css";

type Card = { href: string; label: string; image?: string; tone: string };
type Phase = "flip" | "zoom" | "navigate" | "reveal";
type Gsap = typeof import("gsap").gsap;
type OrbitPose = {
  scene: DOMRect;
  left: number;
  top: number;
  width: number;
  height: number;
  transform: string;
  transformOrigin: string;
};
type Visual = {
  card: Card;
  bounds: DOMRect;
  orbit?: OrbitPose;
  frontImage?: string;
};
type Motion = {
  visual: Visual;
  source: HTMLAnchorElement;
  preferences: HTMLElement;
  pathname: string;
  phase: Phase;
  originalOpacity: string;
  timeline?: gsap.core.Timeline;
  timeout?: number;
};

const RouteTransitionContext = createContext<{
  busy: boolean;
  start: (link: HTMLAnchorElement, card: Card) => boolean;
}>({ busy: false, start: () => false });

function motionIsEnabled(preferences?: HTMLElement | null) {
  return preferences?.dataset.motion === "full"
    && !window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)").matches;
}

function readOrbitPose(source: HTMLAnchorElement): OrbitPose | undefined {
  const slide = source.parentElement;
  const stage = slide?.parentElement;
  if (!stage?.hasAttribute("data-hero-orbit") || !slide || slide.offsetParent !== stage) return;

  const { transform, transformOrigin } = getComputedStyle(slide);
  const matrix = new DOMMatrixReadOnly(transform === "none" ? undefined : transform);
  // Perspective has no visible effect on the centred face at zero rotation and depth.
  if (Math.abs(matrix.m13) < 0.001 && Math.abs(matrix.m41) < 0.001 && Math.abs(matrix.m43) < 0.001) return;

  return {
    scene: stage.getBoundingClientRect(),
    left: stage.clientLeft + slide.offsetLeft + source.offsetLeft,
    top: stage.clientTop + slide.offsetTop + source.offsetTop,
    width: source.offsetWidth,
    height: source.offsetHeight,
    transform,
    transformOrigin,
  };
}

function copyFrontFace(source: HTMLAnchorElement, face: HTMLElement) {
  const originalSlide = source.parentElement;
  if (!originalSlide) return;

  const slide = document.createElement("div");
  slide.className = originalSlide.className;
  Object.assign(slide.dataset, originalSlide.dataset);

  const front = document.createElement("div");
  front.className = source.className;
  Object.assign(front.dataset, source.dataset);
  front.style.transform = "none";
  front.style.transition = "none";

  for (const child of source.childNodes) front.append(child.cloneNode(true));
  const sourceGlint = source.querySelector<HTMLElement>("[data-card-glint]");
  const glint = front.querySelector<HTMLElement>("[data-card-glint]");
  if (sourceGlint && glint) glint.style.transform = getComputedStyle(sourceGlint).transform;

  const image = front.querySelector("img");
  const sourceImage = source.querySelector("img");
  if (image && sourceImage?.currentSrc) {
    image.removeAttribute("srcset");
    image.removeAttribute("sizes");
    image.src = sourceImage.currentSrc;
  }

  slide.append(front);
  face.replaceChildren(slide);
}

export function useCardRouteTransition() {
  return useContext(RouteTransitionContext);
}

export function CardRouteTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const animation = useRef<Gsap>(null);
  const active = useRef<Motion>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [visual, setVisual] = useState<Visual | null>(null);
  const [slow, setSlow] = useState<Card | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (pathname !== "/" || animation.current) return;
    let mounted = true;
    let preloadTimer: number | undefined;

    const preload = () => {
      void import("gsap").then(({ gsap }) => {
        if (mounted) animation.current = gsap;
      }).catch(() => {});
    };

    const idleId = window.requestIdleCallback?.(preload, { timeout: 650 });
    if (idleId === undefined) preloadTimer = window.setTimeout(preload, 0);

    return () => {
      mounted = false;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      window.clearTimeout(preloadTimer);
    };
  }, [pathname]);

  const clear = useCallback((restoreFocus = false) => {
    const current = active.current;
    if (!current) return;
    active.current = null;
    current.timeline?.kill();
    window.clearTimeout(current.timeout);
    current.source.style.opacity = current.originalOpacity;
    setBusy(false);
    setVisual(null);
    setSlow(null);
    if (restoreFocus && current.source.isConnected) current.source.focus({ preventScroll: true });
  }, []);

  const navigate = useCallback((current: Motion) => {
    if (active.current !== current || current.phase === "navigate" || current.phase === "reveal") return;
    window.clearTimeout(current.timeout);
    current.phase = "navigate";
    if (layer.current) layer.current.dataset.phase = "navigate";
    current.timeout = window.setTimeout(() => {
      current.timeline?.kill();
      current.source.style.opacity = current.originalOpacity;
      setVisual(null);
      setSlow(current.visual.card);
    }, 650);

    try {
      router.push(current.visual.card.href);
    } catch {
      clear();
      window.location.assign(current.visual.card.href);
    }
  }, [clear, router]);

  const skipMotion = useCallback((current: Motion) => {
    current.timeline?.kill();
    current.source.style.opacity = current.originalOpacity;
    if (layer.current) layer.current.hidden = true;
    navigate(current);
  }, [navigate]);

  function start(source: HTMLAnchorElement, card: Card) {
    if (active.current) return true;
    const preferences = source.closest<HTMLElement>("[data-motion]");
    if (!animation.current || !preferences || !motionIsEnabled(preferences)
      || !CSS.supports("transform-style", "preserve-3d") || pathname === card.href) return false;

    const bounds = source.getBoundingClientRect();
    const viewport = document.documentElement;
    if (bounds.width < 1 || bounds.height < 1 || bounds.right <= 0 || bounds.bottom <= 0
      || bounds.left >= viewport.clientWidth || bounds.top >= viewport.clientHeight) return false;

    const image = source.querySelector("img");
    const nextVisual = {
      card, bounds,
      orbit: readOrbitPose(source),
      frontImage: image?.currentSrc || image?.src || card.image,
    };
    active.current = { visual: nextVisual, source, preferences, pathname, phase: "flip", originalOpacity: source.style.opacity };
    setSlow(null);
    setBusy(true);
    setVisual(nextVisual);
    return true;
  }

  useLayoutEffect(() => {
    const current = active.current;
    if (!visual || !current || current.visual !== visual || current.phase !== "flip" || current.timeline) return;
    const gsap = animation.current;
    const overlay = layer.current;
    const placement = overlay?.querySelector<HTMLElement>("[data-card-route-placement]");
    const panel = overlay?.querySelector<HTMLElement>("[data-card-route-panel]");
    const rotator = overlay?.querySelector<HTMLElement>("[data-card-route-rotator]");
    const scrim = overlay?.querySelector<HTMLElement>("[data-card-route-scrim]");
    const front = overlay?.querySelector<HTMLElement>("[data-card-route-front]");
    const title = overlay?.querySelector<HTMLElement>("[data-card-route-title]");
    if (!gsap || !overlay || !placement || !panel || !rotator || !scrim || !front || !title
      || getComputedStyle(overlay).position !== "fixed" || !motionIsEnabled(current.preferences)) {
      skipMotion(current);
      return;
    }

    const { orbit, bounds } = visual;
    const { width, height } = orbit ?? bounds;
    const left = orbit ? orbit.scene.left + orbit.left : bounds.left;
    const top = orbit ? orbit.scene.top + orbit.top : bounds.top;
    const target = overlay.getBoundingClientRect();
    const x = target.width / 2 - (left + width / 2);
    const y = target.height / 2 - (top + height / 2);
    const scale = Math.max(target.width / width, target.height / height) + 0.025;
    const lift = orbit ? 0.12 : 0;
    const zoom = lift + 0.3;

    try {
      copyFrontFace(current.source, front);
      current.source.style.opacity = "0";
      const fitTitle = gsap.quickSetter(title, "scale");

      current.timeline = gsap.timeline({ onComplete: () => navigate(current) });
      if (orbit) {
        const projected = new DOMMatrixReadOnly(orbit.transform).toFloat64Array();
        const flat = new DOMMatrixReadOnly().toFloat64Array();
        const pose = { progress: 0 };
        // Keep the source's perspective terms until the card has settled into the flip plane.
        current.timeline.to(pose, {
          progress: 1, duration: lift, ease: "power2.out",
          onUpdate: () => {
            const matrix = projected.map((coordinate, index) => coordinate + (flat[index] - coordinate) * pose.progress);
            placement.style.transform = `matrix3d(${matrix.join(",")})`;
          },
          onComplete: () => { placement.style.transform = "none"; },
        }, 0);
      }

      current.timeline
        .to(scrim, { opacity: 0.64, duration: 0.28, ease: "power2.out" }, 0)
        .to(rotator, { rotationY: 180, duration: 0.3, ease: "power2.inOut" }, lift)
        .call(() => {
          current.phase = "zoom";
          overlay.dataset.phase = "zoom";
        }, [], zoom)
        .to(panel, {
          x, y, scale, duration: 0.32, ease: "power3.inOut",
          onUpdate: () => {
            const scaleX = Number(gsap.getProperty(panel, "scaleX"));
            fitTitle(Math.min(1, 1.35 / scaleX));
          },
        }, zoom);

      // Give navigation a bounded wait even if the animation is interrupted.
      current.timeout = window.setTimeout(() => skipMotion(current), 780 + lift * 1000);
    } catch {
      skipMotion(current);
    }
  }, [navigate, skipMotion, visual]);

  useLayoutEffect(() => {
    const current = active.current;
    if (!current || current.pathname === pathname) return;
    if (current.phase !== "navigate" || pathname !== current.visual.card.href) {
      clear();
      return;
    }

    current.phase = "reveal";
    window.clearTimeout(current.timeout);
    document.getElementById("main-content")?.focus({ preventScroll: true });
    if (!layer.current || layer.current.hidden || !animation.current || !motionIsEnabled(current.preferences)) {
      clear();
      return;
    }

    layer.current.dataset.phase = "reveal";
    current.timeline = animation.current.timeline({ onComplete: () => clear() })
      .to(layer.current, { opacity: 0, duration: 0.14, ease: "power2.out" });
    current.timeout = window.setTimeout(() => clear(), 180);
  }, [clear, pathname]);

  useEffect(() => {
    if (!busy) return;
    const preferences = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");

    function handleKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || !active.current || active.current.phase === "navigate" || active.current.phase === "reveal") return;
      event.preventDefault();
      clear(true);
    }

    function stopForNavigation() {
      clear();
      setSlow(null);
    }

    function finishImmediately() {
      const current = active.current;
      if (!current) return;
      if (current.phase === "reveal") {
        clear();
        return;
      }
      skipMotion(current);
    }

    function updatePreference() {
      if (active.current && !motionIsEnabled(active.current.preferences)) finishImmediately();
    }

    window.addEventListener("keydown", handleKey);
    window.addEventListener("popstate", stopForNavigation);
    window.addEventListener("resize", finishImmediately);
    preferences.addEventListener("change", updatePreference);
    const preferencesElement = active.current?.preferences;
    const observer = new MutationObserver(updatePreference);
    if (preferencesElement) observer.observe(preferencesElement, { attributes: true, attributeFilter: ["data-motion"] });

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("popstate", stopForNavigation);
      window.removeEventListener("resize", finishImmediately);
      preferences.removeEventListener("change", updatePreference);
      observer.disconnect();
    };
  }, [busy, clear, skipMotion]);

  useEffect(() => () => {
    active.current?.timeline?.kill();
    window.clearTimeout(active.current?.timeout);
    if (active.current) active.current.source.style.opacity = active.current.originalOpacity;
    active.current = null;
  }, []);

  return (
    <RouteTransitionContext.Provider value={{ busy, start }}>
      {children}
      {visual && createPortal(
        <div ref={layer} className={styles.overlay} data-card-route-overlay data-phase="flip" aria-hidden="true" inert>
          <div className={styles.scrim} data-card-route-scrim />
          <div className={styles.scene} style={visual.orbit && {
            left: visual.orbit.scene.left,
            top: visual.orbit.scene.top,
            width: visual.orbit.scene.width,
            height: visual.orbit.scene.height,
          }}>
            <div className={styles.placement} data-card-route-placement style={{
              left: (visual.orbit ?? visual.bounds).left,
              top: (visual.orbit ?? visual.bounds).top,
              width: (visual.orbit ?? visual.bounds).width,
              height: (visual.orbit ?? visual.bounds).height,
              transform: visual.orbit?.transform,
              transformOrigin: visual.orbit?.transformOrigin,
            }}>
              <div className={styles.panel} data-card-route-panel>
                <div className={styles.rotator} data-card-route-rotator>
                  <div className={styles.front} data-card-route-front />
                  <div className={styles.back} style={{ backgroundColor: visual.card.tone }}>
                    {visual.frontImage ? <div className={styles.image} style={{ backgroundImage: `url("${visual.frontImage}")` }} /> : <HouseOutline />}
                    <span data-card-route-title>{visual.card.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>, document.body,
      )}
      {slow && pathname === "/" && createPortal(
        <div className={styles.pending}>
          <p role="status">Opening {slow.label}…</p>
          <a href={slow.href}>Open {slow.label} now</a>
        </div>, document.body,
      )}
    </RouteTransitionContext.Provider>
  );
}
