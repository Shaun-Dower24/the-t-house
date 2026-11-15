import { applyTransform, groupLines, MAX_UNITS, unitsFor, wordTiles, type By } from "./ink-headline-utils";

export interface InkMask {
  width: number;
  height: number;
  dpr: number;
  em: number;
  units: number[];
  unitCount: number;
  spans: Float32Array;
  tiles: Float32Array;
}

const MAX_DIMENSION = 4094;
const MAX_PIXELS = 4_000_000;

export function buildInkMask(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  mask: HTMLCanvasElement,
  words: HTMLElement[],
  by: By,
  dprCap: number,
): InkMask | null {
  const document = root.ownerDocument;
  const view = document.defaultView;
  if (!view || !words.length) return null;

  const style = view.getComputedStyle(root);
  const em = parseFloat(style.fontSize);
  const bounds = root.getBoundingClientRect();
  if (!Number.isFinite(em) || em <= 0 || bounds.width <= 0 || bounds.height <= 0) return null;

  let context: CanvasRenderingContext2D | null;
  try {
    context = mask.getContext("2d");
  } catch {
    return null;
  }
  if (!context) return null;

  const rects = words.map((word) => word.getBoundingClientRect());
  if (rects.some((rect) => rect.width <= 0 || rect.height <= 0)) return null;

  const margin = Math.ceil(em * 0.35);
  const viewportWidth = document.documentElement.clientWidth || view.innerWidth;
  // Bound the temporary canvas by the words and keep its padding inside the viewport.
  const left = Math.max(0, Math.min(...rects.map((rect) => rect.left)) - margin);
  const right = Math.min(viewportWidth, Math.max(...rects.map((rect) => rect.right)) + margin);
  const top = Math.min(bounds.top, ...rects.map((rect) => rect.top)) - margin;
  const bottom = Math.max(bounds.bottom, ...rects.map((rect) => rect.bottom)) + margin;
  const cssWidth = right - left;
  const cssHeight = bottom - top;
  if (cssWidth <= 0 || cssHeight <= 0) return null;

  const screenDpr = view.devicePixelRatio;
  const dpr = Math.min(
    Number.isFinite(screenDpr) && screenDpr > 0 ? screenDpr : 1,
    Number.isFinite(dprCap) && dprCap > 0 ? dprCap : 2,
    MAX_DIMENSION / cssWidth,
    MAX_DIMENSION / cssHeight,
    Math.sqrt(MAX_PIXELS / (cssWidth * cssHeight)),
  );
  // Snap the origin to device pixels so the bitmap lands on the same rows as the text.
  const originX = Math.floor(left * dpr) / dpr;
  const originY = Math.floor(top * dpr) / dpr;
  const rightPixel = Math.min(Math.ceil(right * dpr), Math.floor(viewportWidth * dpr));
  const width = rightPixel - Math.floor(left * dpr);
  const height = Math.ceil(bottom * dpr) - Math.floor(top * dpr);
  if (width < 1 || height < 1) return null;

  canvas.style.left = `${originX - bounds.left - root.clientLeft}px`;
  canvas.style.top = `${originY - bounds.top - root.clientTop}px`;
  canvas.style.width = `${width / dpr}px`;
  canvas.style.height = `${height / dpr}px`;
  canvas.width = mask.width = width;
  canvas.height = mask.height = height;

  const lines = groupLines(rects.map((rect) => rect.top), parseFloat(style.lineHeight) || em * 1.2);
  const units = unitsFor(by, lines);
  const unitCount = Math.max(...units) + 1;
  const spans = new Float32Array(MAX_UNITS * 2);
  const tiles = new Float32Array(MAX_UNITS * 4);
  for (let unit = 0; unit < unitCount; unit++) {
    spans[unit * 2] = 1;
    tiles.set([Infinity, Infinity, -Infinity, -Infinity], unit * 4);
  }

  // Red holds the glyph mask and green holds a whole-pixel unit index for the shader.
  context.fillStyle = "rgb(0,0,0)";
  context.fillRect(0, 0, width, height);
  const cells = wordTiles(
    rects.map((rect) => [rect.left - originX, rect.top - originY, rect.right - originX, rect.bottom - originY]),
    lines,
    em * 0.3,
    width / dpr,
    height / dpr,
  );

  cells.forEach(([left, top, right, bottom], index) => {
    const unit = units[index]!;
    const x0 = Math.round(left * dpr);
    const y0 = Math.round(top * dpr);
    const x1 = Math.round(right * dpr);
    const y1 = Math.round(bottom * dpr);
    context.fillStyle = `rgb(0,${unit + 1},0)`;
    context.fillRect(x0, y0, x1 - x0, y1 - y0);

    const tile = unit * 4;
    tiles[tile] = Math.min(tiles[tile]!, x0);
    tiles[tile + 1] = Math.min(tiles[tile + 1]!, height - y1);
    tiles[tile + 2] = Math.max(tiles[tile + 2]!, x1);
    tiles[tile + 3] = Math.max(tiles[tile + 3]!, height - y0);
    const rect = rects[index]!;
    spans[unit * 2] = Math.min(spans[unit * 2]!, (rect.left - originX) * dpr / width);
    spans[unit * 2 + 1] = Math.max(spans[unit * 2 + 1]!, (rect.right - originX) * dpr / width);
  });

  context.globalCompositeOperation = "lighter";
  context.fillStyle = "rgb(255,0,0)";
  context.font = `${style.fontStyle} ${style.fontWeight} ${em * dpr}px ${style.fontFamily}`;
  const letterSpacing = parseFloat(style.letterSpacing);
  if ("letterSpacing" in context) context.letterSpacing = `${Number.isFinite(letterSpacing) ? letterSpacing * dpr : 0}px`;
  context.fontKerning = style.fontKerning === "none" ? "none" : "normal";
  context.textBaseline = "alphabetic";

  // A zero-size inline box sits on the word's baseline, including tight script leading.
  const markers = words.map((word) => {
    const marker = document.createElement("span");
    marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    word.append(marker);
    return marker;
  });
  const baselines = markers.map((marker) => marker.getBoundingClientRect().top);
  markers.forEach((marker) => marker.remove());

  words.forEach((word, index) => {
    const text = applyTransform(word.textContent ?? "", style.textTransform);
    context.fillText(text, (rects[index]!.left - originX) * dpr, Math.round(baselines[index]! * dpr) - originY * dpr);
  });

  return { width, height, dpr, em, units, unitCount, spans, tiles };
}
