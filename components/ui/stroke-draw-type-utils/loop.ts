"use client";

import { useEffect, useEffectEvent, useMemo, useRef, type RefObject } from "react";

type Frame = (delta: number) => boolean;

function observeLoop(element: Element, frame: Frame) {
  const document = element.ownerDocument;
  const ownerView = document.defaultView;
  if (!ownerView) return null;
  const view = ownerView;

  let intersects = typeof view.IntersectionObserver === "undefined";
  let requested = true;
  let disposed = false;
  let frameId: number | null = null;
  let lastTime: number | null = null;

  function canRun() {
    return !disposed && requested && intersects && !document.hidden;
  }

  function reconcile() {
    if (canRun()) {
      frameId ??= view.requestAnimationFrame(tick);
      return;
    }

    if (frameId !== null) view.cancelAnimationFrame(frameId);
    frameId = null;
    lastTime = null;
  }

  function tick(time: number) {
    frameId = null;
    if (!canRun()) {
      lastTime = null;
      return;
    }

    // Reset time on resume and cap slow frames for the spring simulation.
    const delta = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    requested = frame(delta);
    reconcile();
  }

  const observer = intersects ? null : new view.IntersectionObserver(([entry]) => {
    intersects = entry?.isIntersecting ?? false;
    reconcile();
  });

  observer?.observe(element);
  document.addEventListener("visibilitychange", reconcile);
  reconcile();

  return {
    element,
    wake() {
      requested = true;
      reconcile();
    },
    dispose() {
      disposed = true;
      reconcile();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
    },
  };
}

/** Invoke frame with elapsed seconds while the element and document are visible. */
export function useVisibleLoop<T extends Element>(
  rootRef: RefObject<T | null>,
  frame: Frame,
  { enabled }: { enabled: boolean },
) {
  const loop = useRef<ReturnType<typeof observeLoop>>(null);
  const renderFrame = useEffectEvent(frame);
  const controls = useMemo(() => ({ wake: () => loop.current?.wake() }), []);

  // A stable ref object can point at a different element after a commit.
  useEffect(() => {
    const element = enabled ? rootRef.current : null;
    if ((loop.current?.element ?? null) === element) return;
    loop.current?.dispose();
    loop.current = element ? observeLoop(element, (delta) => renderFrame(delta)) : null;
  });

  useEffect(() => () => {
    loop.current?.dispose();
    loop.current = null;
  }, []);

  return controls;
}
