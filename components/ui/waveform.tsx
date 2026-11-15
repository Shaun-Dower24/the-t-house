"use client";

// Drawing and interaction adapted from the chatcn Waveform (https://chatcn.dev).
import { useEffect, useMemo, useRef, type ComponentProps, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import styles from "./waveform.module.css";

type Level = number | (() => number);

export interface WaveformProps extends Omit<ComponentProps<"div">, "children"> {
  variant?: "bars" | "line";
  level?: Level;
  active?: boolean;
  peaks?: readonly number[];
  progress?: number;
  barWidth?: number;
  gap?: number;
  reducedMotion?: boolean;
  label?: string;
}

const sampleTime = 1 / 16;
const quietOpacity = 0.34;
const clampLevel = (value: number) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
const shape = (value: number) => value ** 0.75;

function normalizePeaks(peaks: readonly number[]) {
  const absolute = peaks.map(value => Number.isFinite(value) ? Math.abs(value) : 0);
  const max = absolute.reduce((largest, value) => Math.max(largest, value), 0);
  return max > 0 ? absolute.map(value => value / max) : absolute;
}

function resamplePeaks(peaks: readonly number[], count: number) {
  const result = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    const first = Math.floor(i * peaks.length / count);
    const last = Math.max(first + 1, Math.floor((i + 1) * peaks.length / count));
    let loudest = 0;
    for (let j = first; j < last; j++) loudest = Math.max(loudest, peaks[j] ?? 0);
    result[i] = loudest;
  }
  return result;
}

function drawWave(ctx: CanvasRenderingContext2D, values: number[], x: number, height: number, options: {
  variant: NonNullable<WaveformProps["variant"]>;
  bar: number;
  step: number;
}) {
  const { bar, step, variant } = options;
  const middle = height / 2;
  ctx.beginPath();
  if (variant === "bars") {
    for (const value of values) {
      const length = Math.max(Math.min(bar, height), shape(value) * height);
      const top = middle - length / 2;
      if (ctx.roundRect) ctx.roundRect(x, top, bar, length, bar / 2);
      else ctx.rect(x, top, bar, length);
      x += step;
    }
    ctx.fill();
    return;
  }

  const amplitude = Math.max(0, (height - 2 * bar) / 2);
  const points = values.map((value, i) => ({
    x: x + i * step + bar / 2,
    y: middle + (i % 2 === 0 ? -1 : 1) * shape(value) * amplitude,
  }));
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || first === last) return;
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < points.length - 1; i++) {
    const point = points[i];
    const next = points[i + 1];
    ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  }
  ctx.lineTo(last.x, last.y);
  ctx.lineWidth = bar;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function fadeOldest(ctx: CanvasRenderingContext2D, width: number, height: number, rtl: boolean) {
  const fadeWidth = width * 0.14;
  const fade = rtl
    ? ctx.createLinearGradient(width, 0, width - fadeWidth, 0)
    : ctx.createLinearGradient(0, 0, fadeWidth, 0);
  fade.addColorStop(0, "black");
  fade.addColorStop(1, "transparent");
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = fade;
  ctx.fillRect(rtl ? width - fadeWidth : 0, 0, fadeWidth, height);
  ctx.restore();
}

export function Waveform({
  variant = "bars", level, active = true, peaks, progress = 0, barWidth, gap = 2,
  reducedMotion, label, className, style, ...props
}: WaveformProps) {
  const defaultBar = variant === "line" ? 1.5 : 3;
  const bar = Number.isFinite(barWidth) ? Math.max(0.5, barWidth ?? defaultBar) : defaultBar;
  const spacing = Number.isFinite(gap) ? Math.max(0, gap) : 2;
  const step = Math.max(variant === "line" ? 10 : 1, bar + spacing);
  const played = clampLevel(progress);
  const recorded = useMemo(() => peaks && normalizePeaks(peaks), [peaks]);
  const fallback = useMemo(() => recorded && resamplePeaks(recorded, Math.min(36, recorded.length)), [recorded]);

  const source = useMemo(() => ({ active, level, recorded, played, variant, bar, spacing, step, reducedMotion }),
    [active, level, recorded, played, variant, bar, spacing, step, reducedMotion]);
  const sourceRef = useRef(source);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scheduleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    sourceRef.current = source;
    scheduleRef.current?.();
  }, [source]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const host = canvas?.parentElement;
    if (!canvas || !ctx || !host) return;

    const paint = ctx;
    const surface = canvas;
    const element = host;
    const motionScope = element.closest(".prototype");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const history: number[] = [];
    let visible = true;
    let frame = 0;
    let lastFrame = 0;
    let sinceSample = 0;
    let held = 0;
    let previousMode = "";
    let reducedSample = -Infinity;
    let reducedValue = 0;

    function schedule() {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    }

    function suspend() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
    }

    function draw(now: number) {
      frame = 0;
      const width = surface.clientWidth;
      const height = surface.clientHeight;
      if (!width || !height || forcedColors.matches) {
        delete surface.dataset.drawn;
        lastFrame = 0;
        return;
      }

      const options = sourceRef.current;
      const css = getComputedStyle(element);
      const rtl = css.direction === "rtl";
      const dim = css.getPropertyValue("--waveform-unplayed-opacity").trim();
      const opacity = dim ? clampLevel(Number(dim)) : quietOpacity;
      const reduce = (options.reducedMotion ?? motion.matches) || motionScope?.getAttribute("data-motion") === "reduced";
      const dormant = !options.active || options.level === undefined;
      const mode = options.recorded ? "recorded" : dormant ? "idle" : reduce ? "reduced" : options.variant;
      if (mode !== previousMode) {
        history.length = 0;
        sinceSample = 0;
        held = 0;
        lastFrame = 0;
        reducedSample = -Infinity;
        previousMode = mode;
      }

      const ratio = Math.min(window.devicePixelRatio || 1, 3);
      const pixelsWide = Math.max(1, Math.round(width * ratio));
      const pixelsHigh = Math.max(1, Math.round(height * ratio));
      if (surface.width !== pixelsWide || surface.height !== pixelsHigh) {
        surface.width = pixelsWide;
        surface.height = pixelsHigh;
      }
      paint.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
      paint.clearRect(0, 0, width, height);
      paint.strokeStyle = css.color;
      paint.fillStyle = css.color;
      paint.globalAlpha = 1;
      if (surface.dataset.drawn === undefined) surface.dataset.drawn = "";

      const count = Math.max(options.variant === "line" ? 2 : 1, Math.floor((width + options.spacing) / options.step));
      const left = (width - ((count - 1) * options.step + options.bar)) / 2;
      const elapsed = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
      lastFrame = now;

      if (options.recorded) {
        const values = resamplePeaks(options.recorded, count);
        if (rtl) values.reverse();
        paint.globalAlpha = opacity;
        drawWave(paint, values, left, height, options);
        if (options.played > 0) {
          const split = options.played * width;
          paint.save();
          paint.globalAlpha = 1;
          paint.beginPath();
          paint.rect(rtl ? width - split : 0, 0, split, height);
          paint.clip();
          drawWave(paint, values, left, height, options);
          paint.restore();
        }
        return;
      }

      if (dormant) {
        paint.globalAlpha = opacity;
        drawWave(paint, new Array<number>(count).fill(0), left, height, options);
        return;
      }

      if (reduce) {
        if (typeof options.level === "number" || now - reducedSample >= 125) {
          reducedValue = clampLevel(typeof options.level === "function" ? options.level() : options.level ?? 0);
          reducedSample = now;
        }
        const values = Array.from({ length: count }, (_, i) => {
          const phase = count === 1 ? 0 : i / (count - 1) * 2 - 1;
          return reducedValue * (0.35 + 0.65 * Math.cos(phase * Math.PI / 2) ** 2);
        });
        drawWave(paint, values, left, height, options);
        if (typeof options.level === "function") schedule();
        return;
      }

      const sample = clampLevel(typeof options.level === "function" ? options.level() : options.level ?? 0);
      held = Math.max(held, sample);
      sinceSample += elapsed;
      if (sinceSample >= sampleTime) {
        sinceSample -= sampleTime;
        history.push(held);
        held = sample;
      }
      const keep = count + 1;
      if (history.length > keep) history.splice(0, history.length - keep);
      const values = [...new Array<number>(keep - history.length).fill(0), ...history];
      const offset = sinceSample / sampleTime * options.step;
      if (rtl) values.reverse();
      const start = rtl ? offset : width - options.bar - (keep - 1) * options.step - offset;
      drawWave(paint, values, start, height, options);
      fadeOldest(paint, width, height, rtl);
      schedule();
    }

    function visibilityChanged() {
      if (visible && !document.hidden) schedule();
      else suspend();
    }

    const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    resize?.observe(surface);
    const intersection = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visibilityChanged();
    }) : null;
    intersection?.observe(surface);
    const theme = new MutationObserver(schedule);
    theme.observe(element, { attributes: true, attributeFilter: ["class", "style", "dir"] });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "dir", "data-theme"] });
    if (motionScope) theme.observe(motionScope, { attributes: true, attributeFilter: ["data-motion"] });
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    forcedColors.addEventListener("change", schedule);
    scheduleRef.current = schedule;
    schedule();

    return () => {
      scheduleRef.current = null;
      suspend();
      delete surface.dataset.drawn;
      resize?.disconnect();
      intersection?.disconnect();
      theme.disconnect();
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      forcedColors.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div
      role="img"
      aria-label={label ?? (recorded ? `Waveform, ${Math.round(played * 100)} percent played` : active ? "Input level" : "Idle")}
      data-slot="waveform"
      data-variant={variant}
      data-active={active ? "" : undefined}
      className={cn("relative h-8 w-full min-w-0 text-foreground", className)}
      style={{ "--wave-bar": `${bar}px`, "--wave-gap": `${spacing}px`, ...style } as CSSProperties}
      {...props}
    >
      <canvas aria-hidden="true" className={styles.canvas} ref={canvasRef} />
      <span aria-hidden="true" className={styles.fallback}>
        {fallback?.length ? fallback.map((value, index) => (
          <span
            className={styles.fallbackBar}
            key={index}
            data-played={(index + 0.5) / fallback.length <= played || undefined}
            style={{ "--wave-height": `${shape(value) * 100}%` } as CSSProperties}
          />
        )) : <span className={styles.baseline} />}
      </span>
    </div>
  );
}

export default Waveform;
