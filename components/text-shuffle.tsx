"use client";

// Shuffle: on mouse or pen hover and on keyboard focus, letters in [data-shuffle] elements roll through
// a few random letters and land back on the word. A [data-shuffle] element inside a link or button rolls
// when that link or button is hovered or focused. Touch taps don't trigger it.

import { useEffect } from "react";
import { loadGsap, rollChars, splitText, watchTextMotion, type TextSplit } from "../lib/text-motion";

type Run = { timeline: gsap.core.Timeline; split: TextSplit };

function shuffleTargets(trigger: Element) {
  const targets = trigger.matches("[data-shuffle]") ? [trigger] : [];
  return [...targets, ...trigger.querySelectorAll("[data-shuffle]")].filter(
    (target): target is HTMLElement => target instanceof HTMLElement,
  );
}

export function TextShuffle() {
  useEffect(() => {
    const scope = document.querySelector(".prototype");
    if (!scope) return;
    const runs = new Map<HTMLElement, Run>();
    let gsap: typeof import("gsap").gsap | undefined;
    let allowed = false;

    const finishAll = () => {
      runs.forEach(({ timeline, split }) => {
        timeline.kill();
        split.revert();
      });
      runs.clear();
    };

    const shuffle = (trigger: Element) => {
      if (!allowed || !gsap) return;
      for (const target of shuffleTargets(trigger)) {
        if (runs.has(target) || !target.isConnected) continue;
        const split = splitText(target, { lockSize: true });
        if (!split) continue;
        const done = () => {
          split.revert();
          runs.delete(target);
        };
        const timeline = rollChars(gsap, split.chars, { steps: 2 }).eventCallback("onComplete", done);
        if (!timeline.getChildren().length) {
          timeline.kill();
          done();
          continue;
        }
        runs.set(target, { timeline, split });
      }
    };

    const pointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
      const trigger = event.target.closest("a, button");
      if (!trigger || (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))) return;
      shuffle(trigger);
    };
    const focusIn = (event: FocusEvent) => {
      if (event.target instanceof Element && event.target.matches(":focus-visible")) shuffle(event.target);
    };

    const stopWatching = watchTextMotion(scope, (value) => {
      allowed = value;
      if (!value) {
        finishAll();
        return;
      }
      void loadGsap().then((module) => { gsap = module; }).catch(() => {});
    });
    document.addEventListener("pointerover", pointerOver);
    document.addEventListener("focusin", focusIn);
    return () => {
      stopWatching();
      document.removeEventListener("pointerover", pointerOver);
      document.removeEventListener("focusin", focusIn);
      finishAll();
    };
  }, []);

  return null;
}
