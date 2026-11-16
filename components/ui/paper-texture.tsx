"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { PAPER_FRAGMENT_SHADER, PAPER_VERTEX_SHADER } from "./paper-texture-shaders";
import styles from "./paper-texture.module.css";

const maxPixels = 1_000_000;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

  gl.deleteShader(shader);
  return null;
}

function paletteColor(palette: CSSStyleDeclaration, token: string, fallback: number) {
  const hex = /^#([a-f0-9]{6})$/i.exec(palette.getPropertyValue(token).trim());
  const color = hex ? Number.parseInt(hex[1], 16) : fallback;
  return [(color >> 16) / 255, ((color >> 8) & 255) / 255, (color & 255) / 255];
}

function createPaperRenderer(canvas: HTMLCanvasElement) {
  let gl: WebGLRenderingContext | null;
  try {
    gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power", preserveDrawingBuffer: true });
  } catch {
    return null;
  }
  if (!gl) return null;

  const program = gl.createProgram();
  const quad = gl.createBuffer();
  const vertex = compileShader(gl, gl.VERTEX_SHADER, PAPER_VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, PAPER_FRAGMENT_SHADER);

  const dispose = () => {
    gl.deleteBuffer(quad);
    gl.deleteProgram(program);
  };

  try {
    if (!program || !quad || !vertex || !fragment) throw new Error("Paper Texture could not initialize.");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Paper Texture could not link.");

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const palette = getComputedStyle(canvas);
    gl.uniform3fv(gl.getUniformLocation(program, "u_dark"), paletteColor(palette, "--canvas", 0x0b0b0b));
    gl.uniform3fv(gl.getUniformLocation(program, "u_light"), paletteColor(palette, "--muted-text", 0xbcbcbc));
    const resolution = gl.getUniformLocation(program, "u_resolution");

    return {
      draw(width: number, height: number) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        gl.uniform2f(resolution, width, height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        return gl.getError() === gl.NO_ERROR;
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  } finally {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  }
}

export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const canvas = element;

    let renderer: ReturnType<typeof createPaperRenderer> = null;
    let inView = typeof IntersectionObserver === "undefined";
    let unavailable = false;
    let frame = 0;

    function draw() {
      frame = 0;
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(maxPixels / (width * height)));
      const pixelWidth = Math.max(1, Math.floor(width * scale));
      const pixelHeight = Math.max(1, Math.floor(height * scale));
      const rendered = canvas.dataset.rendered;
      if (rendered && canvas.width === pixelWidth && canvas.height === pixelHeight) return;

      renderer ??= createPaperRenderer(canvas);
      if (renderer?.draw(pixelWidth, pixelHeight)) {
        canvas.dataset.rendered = "true";
      } else {
        unavailable = true;
        renderer?.dispose();
        renderer = null;
        delete canvas.dataset.rendered;
      }
    }

    function schedule() {
      if (inView && !unavailable && frame === 0) frame = requestAnimationFrame(draw);
    }

    function onContextLost(event: Event) {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      unavailable = true;
      renderer = null;
      delete canvas.dataset.rendered;
    }

    function onContextRestored() {
      unavailable = false;
      schedule();
    }

    const intersection = inView ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    intersection?.observe(canvas);
    resize?.observe(canvas);
    window.addEventListener("resize", schedule);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      intersection?.disconnect();
      resize?.disconnect();
      window.removeEventListener("resize", schedule);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      renderer?.dispose();
      delete canvas.dataset.rendered;
    };
  }, []);

  return <canvas ref={canvasRef} className={cn(styles.texture, className)} data-slot="paper-texture" aria-hidden="true" />;
}
