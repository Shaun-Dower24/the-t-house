"use client";

import { useEffect, useRef } from "react";

export type DotColor = readonly [red: number, green: number, blue: number];

const defaultColors: readonly DotColor[] = [[59, 130, 246], [139, 92, 246]];

export function CanvasRevealEffect({
  animationSpeed = 5,
  containerClassName,
  colors = defaultColors,
  dotSize = 3,
}: {
  animationSpeed?: number;
  containerClassName?: string;
  colors?: readonly DotColor[];
  dotSize?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const palette = (colors.length ? colors : defaultColors).map((rgb) => `rgb(${rgb.join(" ")})`);
    const size = Math.max(1, dotSize);
    const spacing = Math.max(8, size * 4);
    const start = performance.now();
    let previousFrame = -Infinity;
    let frame = 0;
    let width = 0;
    let height = 0;

    function draw(now: number) {
      if (!context || now - previousFrame < 1000 / 30) return;
      previousFrame = now;
      const progress = (now - start) * animationSpeed / 1000;
      context.clearRect(0, 0, width, height);

      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          const pattern = Math.abs(Math.sin(x * 12.9898 + y * 78.233));
          const delay = (x / width + y / height) * 0.22 + pattern * 0.4;
          const reveal = animationSpeed === 0 ? 1 : Math.min(1, Math.max(0, (progress - delay) * 3));
          const pulse = 0.7 + Math.sin(progress + pattern * Math.PI * 2) * 0.3;
          context.globalAlpha = reveal * pulse * 0.32;
          context.fillStyle = palette[Math.floor(pattern * palette.length) % palette.length];
          context.fillRect(x, y, size, size);
        }
      }
    }

    const observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      previousFrame = -Infinity;
      draw(performance.now());
    });
    observer.observe(canvas);

    function tick(now: number) {
      draw(now);
      frame = window.requestAnimationFrame(tick);
    }
    if (animationSpeed > 0) frame = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [animationSpeed, colors, dotSize]);

  return <canvas ref={canvasRef} aria-hidden="true" className={containerClassName} style={{ width: "100%", height: "100%" }} />;
}
