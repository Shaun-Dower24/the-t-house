/**
 * Nearby Walk illustration and route by Aakash Mehra.
 * https://aakashmehra.com/ref/nearbywalk
 */
"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type JSX, type PointerEvent, type ReactNode } from "react";
import { useEnhancedControls } from "@/lib/use-enhanced-controls";
import { cn } from "@/lib/utils";
import styles from "./nearby-walk-menu.module.css";

export interface NearbyPlace {
  /** The bundled drawing to use: myeongdong, station, gate, palace, or tower. */
  id: string;
  name: string;
  km: number;
  walkMinutes: number;
}

export interface NearbyWalkProps {
  places?: readonly NearbyPlace[];
  origin?: string;
  formatDistance?: (km: number) => string;
  formatWalk?: (minutes: number) => string;
  ariaLabel?: string;
  hint?: string | null;
  theme?: NearbyWalkTheme;
  defaultTheme?: NearbyWalkTheme;
  onThemeChange?: (theme: NearbyWalkTheme) => void;
  showThemes?: boolean;
  cursorEffect?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const paper = {
  page: "#e4e4e4", page2: "#f5f5f5", bg: "#f5f5f5", bg2: "#ebebeb",
  ink: "#232323", wall: "#f5f5f5", roof: "#333", stone: "#e0e0e0", hill: "#ddd", win: "#d1d1d1",
  sun: "#f5f5f5", cloud: "#eaeaea", "cloud-line": "#bcbcbc", beacon: "#333",
  route: "#525252", ground: "#333", walker: "#333", pin: "#232323", "pin-text": "#f5f5f5",
  fg: "#232323", muted: "#505050", shadow: "#2323231a", lamp: "#2323230e", stroke: "1.8", thin: "1.2",
};

const night = {
  page: "var(--canvas)", page2: "var(--surface)", bg: "var(--surface)", bg2: "var(--canvas)",
  ink: "var(--sign-white)", wall: "var(--surface)", roof: "var(--charcoal)", stone: "var(--charcoal)",
  hill: "var(--charcoal)", win: "var(--surface)", sun: "var(--sign-white)", cloud: "var(--charcoal)",
  "cloud-line": "var(--muted-text)", beacon: "var(--signature-red)",
  route: "var(--sign-white)", ground: "var(--muted-text)", walker: "var(--signature-red)",
  pin: "var(--signature-red)", "pin-text": "var(--sign-white)", fg: "var(--sign-white)",
  muted: "var(--muted-text)", shadow: "#0003", lamp: "#ffffff0c", stroke: "1.8", thin: "1.2",
};

export const THEMES = {
  classic: { label: "Classic", dot: "#e4e4e4", vars: paper },
  night: { label: "Night", dot: "#232323", vars: night },
  sunset: {
    label: "Dusk", dot: "var(--signature-red)",
    vars: { ...night, page2: "#291818", bg2: "#251616", hill: "#312121", cloud: "#302424", lamp: "#c838381a" },
  },
  ink: {
    label: "Ink", dot: "#777", vars: { ...paper, page: "#d1d1d1", bg2: "#e4e4e4", roof: "#171717", stroke: "2.1", thin: "1" },
  },
};

export type NearbyWalkTheme = keyof typeof THEMES;
const themeIds = Object.keys(THEMES) as NearbyWalkTheme[];

export const DEFAULT_PLACES: readonly NearbyPlace[] = [
  { id: "myeongdong", name: "Myeongdong", km: 0.8, walkMinutes: 12 },
  { id: "station", name: "Seoul Station", km: 0.9, walkMinutes: 15 },
  { id: "gate", name: "Sungnyemun Gate", km: 0.5, walkMinutes: 8 },
  { id: "palace", name: "Deoksugung Palace", km: 1.0, walkMinutes: 15 },
  { id: "tower", name: "N Seoul Tower", km: 1.0, walkMinutes: 25 },
];

const W = 1200; // viewBox width; the drawings are mirrored around it

// The drawings keep their original coordinates and are flipped as a whole by this transform,
// so the hotel lands on the left and the tower on the right. Text never goes inside it.
const FLIP = `translate(${W},0) scale(-1,1)`;

// Walking route, mirrored (x' = 1200 - x) and running from the hotel door to the tower,
// so walkers on it go left to right.
const ROUTE = "M100 262 C100 274 112 279 130 279 L870 279 C910 279 938 262 960 236 C986 204 1030 178 1076 174";

// Per landmark, in the mirrored scene: stagger step and hit box (x y w h).
const LAYOUT: Record<string, { i: number; hit: [number, number, number, number] }> = {
  myeongdong: { i: 1, hit: [200, 94, 132, 170] },
  station: { i: 2, hit: [348, 106, 172, 158] },
  gate: { i: 3, hit: [552, 126, 136, 138] },
  palace: { i: 4, hit: [716, 122, 178, 142] },
  tower: { i: 5, hit: [954, 14, 160, 250] },
};

// Stagger: the hotel rises first, then each landmark in turn to the tower.
const d = (i: number) => ({ "--d": `${i * 120}ms` }) as CSSProperties;

// ---- Drawings, in the original (unmirrored) coordinates.

function Tower() {
  return (
    <>
      <path className="nw-hill" d="M0 262C30 230 70 175 118 172C170 169 230 215 300 262Z" />
      <path className="nw-line" d="M106 173L112 150H124L130 173" />
      <rect className="nw-wall" x="114" y="92" width="8" height="58" />
      <rect className="nw-wall" x="99" y="82" width="38" height="10" rx="5" />
      <rect className="nw-wall" x="104" y="70" width="28" height="12" rx="4" />
      <path className="nw-line" d="M106 76H130" />
      <rect className="nw-wall" x="110" y="62" width="16" height="8" rx="2" />
      <path className="nw-line" d="M118 62V30M114 42H122M112 52H124" />
      <circle className="nw-beacon" cx="118" cy="27" r="3" />
    </>
  );
}

// Deoksugung: two-tier hall with upturned eaves on a stone platform
function Palace() {
  return (
    <>
      <rect className="nw-stone" x="328" y="246" width="134" height="16" />
      <path className="nw-line" d="M346 218V246M370 218V246M395 218V246M420 218V246M444 218V246" />
      <rect className="nw-wall" x="362" y="186" width="66" height="12" />
      <path className="nw-roof" d="M352 196H438L466 208Q472 210 476 203Q471 216 450 218H340Q319 216 314 203Q318 210 324 208Z" />
      <path className="nw-roof" d="M368 168H422L442 177Q447 179 450 174Q446 186 430 186H360Q344 186 340 174Q343 179 348 177Z" />
    </>
  );
}

// Sungnyemun: stone base with an arched gateway, two-tier roof
function Gate() {
  return (
    <>
      <path className="nw-stone" d="M530 262V222H630V262H595V242Q580 226 565 242V262Z" />
      <path className="nw-thin" d="M530 236H560M600 236H630M530 249H562M598 249H630" />
      <path className="nw-line" d="M550 211V222M570 211V222M590 211V222M610 211V222" />
      <rect className="nw-wall" x="557" y="183" width="46" height="9" />
      <path className="nw-roof" d="M556 192H604L626 201Q631 203 634 198Q630 210 614 211H546Q530 210 526 198Q529 203 534 201Z" />
      <path className="nw-roof" d="M564 170H596L610 177Q614 179 616 175Q613 185 602 185H558Q547 185 544 175Q546 179 550 177Z" />
    </>
  );
}

// Old Seoul Station (1925): symmetric front, central dome, side turrets, arched windows
function Station() {
  return (
    <>
      <rect className="nw-wall" x="688" y="208" width="154" height="54" />
      <rect className="nw-wall" x="740" y="190" width="50" height="72" />
      <rect className="nw-wall" x="750" y="179" width="30" height="11" />
      <path className="nw-dome" d="M748 179A17 17 0 0 1 782 179Z" />
      <path className="nw-line" d="M765 162V154" />
      <circle className="nw-wall" cx="765" cy="152" r="2" />
      <rect className="nw-wall" x="692" y="198" width="14" height="10" />
      <path className="nw-dome" d="M692 198A7 7 0 0 1 706 198Z" />
      <rect className="nw-wall" x="824" y="198" width="14" height="10" />
      <path className="nw-dome" d="M824 198A7 7 0 0 1 838 198Z" />
      <circle className="nw-thin" cx="765" cy="203" r="5" />
      <path className="nw-lit" d="M755 262V242Q765 230 775 242V262Z" />
      {[698, 714, 798, 814].map((x, i) => (
        <path key={x} className={i === 1 ? "nw-lit" : "nw-thin"} d={`M${x} 246V232Q${x + 6} 224 ${x + 12} 232V246Z`} />
      ))}
    </>
  );
}

// Myeongdong: a cluster of towers with window grids, a few windows lit
function Myeongdong() {
  return (
    <>
      {[
        [878, 172, 34, 3, 9],
        [916, 142, 30, 2, 12],
        [950, 192, 38, 3, 7],
      ].map(([x, y, w, cols, rows], b) => (
        <g key={x}>
          <rect className="nw-wall" x={x} y={y} width={w} height={262 - y} />
          {Array.from({ length: cols * rows }, (_, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const lit = (i * 7 + b * 3) % 5 === 0;
            return (
              <rect
                key={i}
                className={lit ? "nw-lit" : "nw-win"}
                x={x + 6 + c * ((w - 12) / cols) + 1}
                y={y + 8 + r * 9}
                width={(w - 12) / cols - 3}
                height={4.5}
              />
            );
          })}
        </g>
      ))}
    </>
  );
}

// The hotel: three storeys, rooftop camper van under string lights
function Hotel() {
  return (
    <>
      <rect className="nw-wall" x="1030" y="150" width="140" height="112" />
      <rect className="nw-stone" x="1024" y="144" width="152" height="7" />
      <path className="nw-thin" d="M1030 187H1170M1030 224H1170" />
      {[160, 197].flatMap((y) =>
        [1046, 1089, 1132].map((x, i) => (
          <rect
            key={`${x}-${y}`}
            className={(x + y) % 3 === 0 || i === 1 ? "nw-lit" : "nw-win"}
            x={x}
            y={y}
            width="22"
            height="16"
            rx="2"
          />
        )),
      )}
      <rect className="nw-win" x="1046" y="234" width="22" height="16" rx="2" />
      <rect className="nw-lit" x="1132" y="234" width="22" height="16" rx="2" />
      <rect className="nw-door" x="1086" y="232" width="28" height="30" rx="3" />
      {/* Rooftop camper van */}
      <path className="nw-line" d="M1036 144V102M1162 144V104" />
      <path className="nw-thin" d="M1036 104Q1099 128 1162 106" />
      {[1052, 1068, 1084, 1100, 1116, 1132, 1148].map((x) => (
        <circle
          key={x}
          className="nw-bulb"
          cx={x}
          cy={110 + 9 * Math.sin((Math.PI * (x - 1036)) / 126)}
          r="2.4"
        />
      ))}
      <rect className="nw-wall" x="1050" y="114" width="80" height="28" rx="9" />
      <rect className="nw-lit" x="1060" y="120" width="26" height="10" rx="3" />
      <rect className="nw-thin" x="1100" y="119" width="12" height="20" rx="2" />
      <path className="nw-line" d="M1130 136H1144" />
      <circle className="nw-wall" cx="1070" cy="143" r="5" />
    </>
  );
}

const DRAW: Record<string, () => JSX.Element> = {
  tower: Tower,
  palace: Palace,
  gate: Gate,
  station: Station,
  myeongdong: Myeongdong,
};
function spotStyle([x, y, width, height]: [number, number, number, number]) {
  return {
    "--spot-x": `${x / W * 100}%`,
    "--spot-y": `${y / 300 * 100}%`,
    "--spot-w": `${width / W * 100}%`,
    "--spot-h": `${height / 300 * 100}%`,
  } as CSSProperties;
}

function pointerLight(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType === "touch") return;
  const scene = event.currentTarget;
  const box = scene.getBoundingClientRect();
  scene.style.setProperty("--mx", `${event.clientX - box.left}px`);
  scene.style.setProperty("--my", `${event.clientY - box.top}px`);
  scene.dataset.lamp = "";
}

function hideLight(event: PointerEvent<HTMLDivElement>) {
  delete event.currentTarget.dataset.lamp;
}

/** An illustrated route with example Seoul landmarks and a toggle for distance. */
export function NearbyWalk({
  places = DEFAULT_PLACES, origin = "Example starting point",
  formatDistance = (km) => `${km.toFixed(1)} km`,
  formatWalk = (minutes) => `${minutes} min walk`,
  ariaLabel = "Nearby walk",
  hint = "Illustrated Seoul walk with sample distances and walking times.",
  theme, defaultTheme = "classic", onThemeChange, showThemes = true, cursorEffect = true, children, className, style,
}: NearbyWalkProps) {
  const enhanced = useEnhancedControls();
  const uid = useId();
  const root = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [ownTheme, setOwnTheme] = useState(defaultTheme);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const currentTheme = theme ?? ownTheme;
  const active = focused ?? hovered ?? selected;
  const seen = new Set<string>();
  const list = places.filter(({ id }) => {
    if (!Object.hasOwn(DRAW, id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const vars = Object.fromEntries(Object.entries(THEMES[currentTheme].vars).map(([name, value]) => [`--nw-${name}`, value]));

  useEffect(() => {
    const target = root.current;
    const card = scene.current;
    if (!target || !card || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (!matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)").matches &&
          !target.closest('[data-motion="reduced"]')) {
        target.dataset.animated = "";
      }
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  function pickTheme(next: NearbyWalkTheme) {
    if (theme === undefined) setOwnTheme(next);
    onThemeChange?.(next);
  }

  return (
    <section
      ref={root}
      className={cn(styles.root, className)}
      data-nearby-walk=""
      data-theme={currentTheme}
      aria-label={ariaLabel}
      style={{ ...vars, ...style }}
    >
      {hint && <p className={styles.hint}>{hint}</p>}
      <div
        ref={scene}
        className={styles.scene}
        data-cursor-effect={cursorEffect || undefined}
        onPointerMove={cursorEffect ? pointerLight : undefined}
        onPointerLeave={cursorEffect ? hideLight : undefined}
        onPointerCancel={cursorEffect ? hideLight : undefined}
      >
        <svg className={styles.art} viewBox={`0 0 ${W} 300`} aria-hidden="true" focusable="false">
          <g transform={FLIP}>
            <path className="nw-cloud" d="M300 58a14 14 0 0 1 26-6a11 11 0 0 1 19 8h-45z" />
            <path className="nw-cloud" d="M820 44a16 16 0 0 1 30-7a12 12 0 0 1 21 9h-51z" />
          </g>
          {list.map((place) => {
            const Draw = DRAW[place.id];
            return (
              <g key={place.id} className="nw-bob" data-active={active === place.id || undefined}>
                <g className="nw-rise" style={d(LAYOUT[place.id].i)}>
                  <g transform={FLIP}><Draw /></g>
                </g>
              </g>
            );
          })}
          <g className="nw-rise" style={d(0)}><g transform={FLIP}><Hotel /></g></g>
          <path className="nw-ground" pathLength={1} d={`M0 262H${W}`} />
          <path className="nw-route" d={ROUTE} />
          <circle className="nw-walker" r="5" style={{ offsetPath: `path("${ROUTE}")` }} />
        </svg>

        <p className={styles.origin}>{origin}</p>
        <ul role="list" className={styles.controls} aria-label="Landmarks">
          {list.map((place, i) => {
            const id = `${uid}-landmark-${i}`;
            const isActive = active === place.id;
            const walk = formatWalk(place.walkMinutes);
            const distance = formatDistance(place.km);
            return (
              <li className={styles.spot} key={place.id} style={spotStyle(LAYOUT[place.id].hit)}>
                {enhanced ? (
                  <button
                    type="button"
                    className={styles.button}
                    aria-label={place.name}
                    aria-describedby={id}
                    aria-pressed={selected === place.id}
                    data-active={isActive || undefined}
                    onClick={() => setSelected((value) => value === place.id ? null : place.id)}
                    onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(place.id); }}
                    onPointerLeave={(event) => { if (event.pointerType === "mouse") setHovered((value) => value === place.id ? null : value); }}
                    onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setFocused(place.id); }}
                    onBlur={() => setFocused((value) => value === place.id ? null : value)}
                  >
                    <span className={styles.name}>{place.name}</span>
                    <span className={styles.metric} aria-hidden="true">{isActive ? distance : walk}</span>
                    <span id={id} className="sr-only">{walk}. Straight-line distance {distance}.</span>
                  </button>
                ) : (
                  <span className={styles.button}>
                    <span className={styles.name}>{place.name}</span>
                    <span className={styles.metric}>{walk} · {distance}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {enhanced && showThemes && (
        <div role="group" aria-label="Colour theme" className={styles.themes}>
          {themeIds.map((value) => (
            <button
              key={value}
              type="button"
              className={styles.theme}
              aria-pressed={currentTheme === value}
              onClick={() => pickTheme(value)}
            >
              <span aria-hidden="true" className={styles.swatch} style={{ background: THEMES[value].dot }} />
              {THEMES[value].label}
            </button>
          ))}
        </div>
      )}
      {children && <div className={styles.footer}>{children}</div>}
    </section>
  );
}

export default NearbyWalk;
