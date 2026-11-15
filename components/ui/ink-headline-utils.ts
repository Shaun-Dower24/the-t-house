/** Pure helpers from Ink Headline by Ryan Online, adapted from the supplied MIT source.
 * https://github.com/ryanonline1234/ease-atlas
 */

export type EaseFn = (t: number) => number
export type Trigger = 'inView' | 'scroll' | 'manual'
export type By = 'word' | 'line' | 'all'
export type RGB = [number, number, number]
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EaseFn {
  const bx = (t: number) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t
  const by = (t: number) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let lo = 0
    let hi = 1
    let t = x
    for (let i = 0; i < 40; i++) {
      t = (lo + hi) / 2
      if (bx(t) < x) lo = t
      else hi = t
    }
    return by(t)
  }
}

/** Curves by name. easings.net bezier twins of the GSAP eases; studio curves observed on the named sites. */
export const NAMED_CURVES: Record<string, [number, number, number, number]> = {
  ink: [0.7, 0, 0.2, 1], // observed · oneshot-sakura.vercel.app
  lusion: [0.35, 0, 0, 1], // observed · lusion.co
  osmo: [0.625, 0.05, 0, 1], // observed · osmo.supply
  'expo.out': [0.16, 1, 0.3, 1], // easings.net easeOutExpo
  'power3.out': [0.25, 1, 0.5, 1], // easings.net easeOutQuart
  'power2.inOut': [0.65, 0, 0.35, 1], // easings.net easeInOutCubic
}

/** A NAMED_CURVES key, a cubic-bezier() string, or 'linear'. Anything else is the ink curve. */
export function resolveEase(value: string): EaseFn {
  const v = String(value ?? '').trim()
  if (v === 'linear') return (t) => t
  const named = NAMED_CURVES[v]
  if (named) return cubicBezier(...named)
  const m = v.match(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/)
  if (m) return cubicBezier(+m[1]!, +m[2]!, +m[3]!, +m[4]!)
  return cubicBezier(...NAMED_CURVES.ink!)
}

/**
 * Default gap between units: 240 ms between words and 360 ms between lines. Twice the sumi-e
 * cluster (120 ms) and poem-line (180 ms) staggers from the awwwards-motion table, because the
 * whole effect runs at twice the pace (DECISION, Ryan 2026-10-20: "the effect should take like 2x as long").
 */
export const DEFAULT_STAGGER: Record<By, number> = { word: 240, line: 360, all: 0 }
/** The cascade never spreads over more than this, however many words (fix the total, not each gap). */
export const MAX_SPREAD = 2400

/** The gap actually used for n units: the asked-for gap, shrunk so the cascade fits MAX_SPREAD. */
export function effectiveStagger(stagger: number, n: number): number {
  if (n <= 1) return 0
  return Math.max(0, Math.min(stagger, MAX_SPREAD / (n - 1)))
}

/** Total time for n units, each `duration` ms long, `stagger` ms apart. */
export function totalTime(duration: number, stagger: number, n: number): number {
  return duration + effectiveStagger(stagger, n) * Math.max(0, n - 1)
}

/** Linear progress (0–1) of unit k of n when the whole headline is at P. */
export function unitProgress(P: number, k: number, n: number, duration: number, stagger: number): number {
  const s = effectiveStagger(stagger, n)
  const T = totalTime(duration, stagger, n)
  return clamp01((clamp01(P) * T - k * s) / Math.max(1, duration))
}

/**
 * Where a unit swaps from drawn ink to its real text. The ink is dry and solid by then and the drawn
 * glyphs sit on the text's own pixels (the probe holds them to it), so a one-frame swap is invisible;
 * a crossfade would dim the letters midway or thicken their edges.
 */
export const HANDOFF = 0.9

/** Opacity of a unit's real text at its progress p: hidden until HANDOFF, then shown. */
export function handoffAt(p: number): number {
  return p >= HANDOFF ? 1 : 0
}

export interface Token {
  word: string
  /** a space follows this word */
  space: boolean
  /** a forced line break follows this word */
  br: boolean
}

/** Words of a headline. A newline forces a line break. Runs of whitespace collapse like HTML does. */
export function splitWords(text: string): Token[] {
  const out: Token[] = []
  const lines = String(text ?? '').split(/\r?\n/)
  lines.forEach((line, li) => {
    const words = line.split(/\s+/).filter(Boolean)
    words.forEach((word, wi) => {
      out.push({ word, space: wi < words.length - 1, br: wi === words.length - 1 && li < lines.length - 1 })
    })
  })
  return out
}

/** Line index for each word box, by its top edge: a new line starts more than half a line below. */
export function groupLines(tops: number[], lineHeight: number): number[] {
  const out: number[] = []
  let line = -1
  let lastTop = -Infinity
  for (const top of tops) {
    if (top - lastTop > lineHeight * 0.5) {
      line++
      lastTop = top
    }
    out.push(Math.max(0, line))
  }
  return out
}

/**
 * One rectangle per word, [x0, y0, x1, y1], that tile the heading without overlapping: each line's
 * band splits from its neighbours halfway through any overlap of their boxes (tight leading), each
 * word's cell splits halfway across the space to its neighbours, and the outer edges reach `pad`
 * past the text (clamped to the canvas).
 */
export function wordTiles(boxes: Array<[number, number, number, number]>, lines: number[], pad: number, width: number, height: number): Array<[number, number, number, number]> {
  const n = lines.length ? Math.max(...lines) + 1 : 0
  const top: number[] = Array(n).fill(Infinity)
  const bot: number[] = Array(n).fill(-Infinity)
  boxes.forEach((b, i) => {
    top[lines[i]!] = Math.min(top[lines[i]!]!, b[1])
    bot[lines[i]!] = Math.max(bot[lines[i]!]!, b[3])
  })
  const mid = (a: number, b: number) => (a + b) / 2
  const bandTop = top.map((t, l) => (l === 0 ? Math.max(0, t - pad) : Math.max(t - pad, mid(bot[l - 1]!, t))))
  const bandBot = bot.map((b, l) => (l === n - 1 ? Math.min(height, b + pad) : Math.min(b + pad, mid(b, top[l + 1]!))))
  const out: Array<[number, number, number, number]> = boxes.map(() => [0, 0, 0, 0])
  for (let l = 0; l < n; l++) {
    const idx = boxes.map((_, i) => i).filter((i) => lines[i] === l).sort((a, b) => boxes[a]![0] - boxes[b]![0])
    idx.forEach((i, j) => {
      const b = boxes[i]!
      const prev = j > 0 ? boxes[idx[j - 1]!]! : null
      const next = j < idx.length - 1 ? boxes[idx[j + 1]!]! : null
      const x0 = prev ? mid(prev[2], b[0]) : Math.max(0, b[0] - pad)
      const x1 = next ? mid(b[2], next[0]) : Math.min(width, b[2] + pad)
      out[i] = [x0, bandTop[l]!, x1, bandBot[l]!]
    })
  }
  return out
}

/** The unit (0-based) each word animates with. Units past the shader's 64 slots share slots. */
export function unitsFor(by: By, lines: number[]): number[] {
  const raw = by === 'all' ? lines.map(() => 0) : by === 'line' ? lines.slice() : lines.map((_, i) => i)
  const n = raw.length ? Math.max(...raw) + 1 : 0
  return n > MAX_UNITS ? raw.map((u) => Math.floor((u * MAX_UNITS) / n)) : raw
}
export const MAX_UNITS = 64

/** CSS text-transform applied to the string the canvas draws, so its glyphs match the heading's. */
export function applyTransform(word: string, transform: string): string {
  if (transform === 'uppercase') return word.toUpperCase()
  if (transform === 'lowercase') return word.toLowerCase()
  if (transform === 'capitalize') return word.replace(/^\p{L}/u, (c) => c.toUpperCase())
  return word
}

/** trigger 'scroll': 0 while the heading is below the viewport, 1 once its center reaches the middle. */
export function scrollProgress(top: number, height: number, viewport: number): number {
  return clamp01((viewport - top) / Math.max(1, viewport * 0.5 + height * 0.5))
}

/** Exponential smoothing that behaves the same at 60 Hz and 120 Hz. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt)
}

export interface Clock {
  now: () => number
  raf: (cb: (t: number) => void) => number
  caf: (id: number) => void
}
const browserClock: Clock = {
  now: () => performance.now(),
  raf: (cb) => requestAnimationFrame(cb),
  caf: (id) => cancelAnimationFrame(id),
}

/** A minimal rAF tween: no library, cancellable, lands exactly on `to`. */
export function createTween(
  o: { from: number; to: number; duration: number; ease: EaseFn; onUpdate: (v: number) => void; onDone?: () => void },
  clock: Clock = browserClock,
): { cancel: () => void } {
  if (o.duration <= 0) {
    o.onUpdate(o.to)
    o.onDone?.()
    return { cancel() {} }
  }
  const start = clock.now()
  let dead = false
  let id = 0
  const step = (now: number) => {
    if (dead) return
    const k = Math.min(1, Math.max(0, (now - start) / o.duration))
    o.onUpdate(k >= 1 ? o.to : o.from + (o.to - o.from) * o.ease(k))
    if (k >= 1) {
      dead = true
      o.onDone?.()
    } else id = clock.raf(step)
  }
  id = clock.raf(step)
  return {
    cancel() {
      dead = true
      clock.caf(id)
    },
  }
}

/** #rgb, #rrggbb, rgb(), rgba() → unit floats; null for transparent and for formats that need a browser. */
export function colorToRgb(css: string): RGB | null {
  const s = css.trim()
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (m) {
    const hex = m[1]!.length === 3 ? m[1]!.split('').map((c) => c + c).join('') : m[1]!
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as RGB
  }
  if (/^transparent$/i.test(s)) return null
  m = s.match(/^rgba?\(\s*([\d.]+)\s*,?\s*([\d.]+)\s*,?\s*([\d.]+)\s*(?:[,/]\s*([\d.]+)(%?))?\s*\)/i)
  if (m) {
    if (m[4] !== undefined && Number(m[4]) === 0) return null
    return [+m[1]! / 255, +m[2]! / 255, +m[3]! / 255]
  }
  return null
}
