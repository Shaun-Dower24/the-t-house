"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import {
  isValidElement, useCallback, useEffect, useEffectEvent, useId, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode,
} from "react";
import { useEnhancedControls } from "@/lib/use-enhanced-controls";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { VerticalCutReveal } from "./vertical-cut-reveal";
import styles from "./slit-type-faq.module.css";

export interface FaqItem {
  question: string;
  answer: ReactNode;
  answerText?: string;
  category?: string;
  id?: string;
}

export interface SlitPalette {
  paper: string;
  ink: string;
  flood?: string;
  onInk?: string;
}

export type SlitPaletteInput = Partial<SlitPalette>;
export type SlitPreset = "signal" | "cobalt" | "moss" | "carbon";

export interface SlitTypeFaqProps {
  items: readonly FaqItem[];
  /** Use the parent FAQ section's heading and layout. */
  embedded?: boolean;
  headline?: string;
  intro?: ReactNode;
  preset?: SlitPreset;
  palette?: SlitPaletteInput;
  darkPalette?: SlitPaletteInput;
  theme?: "auto" | "light" | "dark";
  type?: "single" | "multiple";
  defaultOpen?: number | string | readonly (number | string)[];
  open?: readonly string[];
  onOpenChange?: (ids: string[]) => void;
  idPrefix?: string;
  search?: boolean;
  searchLabel?: string;
  categories?: readonly string[];
  ticker?: readonly string[];
  contact?: { prompt: string; label: string; href: string } | null;
  copyLinks?: boolean;
  syncHash?: boolean;
  minHeight?: number | string;
  displayFont?: string;
  textFont?: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const presets: Record<SlitPreset, { light: SlitPalette; dark: SlitPalette }> = {
  signal: {
    light: { paper: "#fff", ink: "#9b1921", flood: "#9b1921", onInk: "#fff" },
    dark: { paper: "#140c0c", ink: "#f5f5f5", flood: "#a82e36", onInk: "#fff" },
  },
  cobalt: {
    light: { paper: "#f6f7ff", ink: "#1d3cf5", onInk: "#fff" },
    dark: { paper: "#0b1030", ink: "#9ba8ff", onInk: "#0b1030" },
  },
  moss: {
    light: { paper: "#f4f6ef", ink: "#1f4d2b", onInk: "#f4f6ef" },
    dark: { paper: "#0e1a12", ink: "#8fd19e", onInk: "#0e1a12" },
  },
  carbon: {
    light: { paper: "#f3f3f1", ink: "#111", onInk: "#f3f3f1" },
    dark: { paper: "#131313", ink: "#f1f1ee", onInk: "#131313" },
  },
};

function paletteVars(base: SlitPalette | undefined, override: SlitPaletteInput | undefined, suffix = "") {
  const { paper, ink, flood, onInk } = { ...base, ...override };
  return {
    [`--faq-paper${suffix}`]: paper,
    [`--faq-ink${suffix}`]: ink,
    [`--faq-flood${suffix}`]: flood ?? ink,
    [`--faq-on-flood${suffix}`]: onInk ?? paper,
  };
}

function toSlug(text: string) {
  return text.normalize("NFKD").toLowerCase().replace(/\p{Mark}/gu, "")
    .replace(/[^a-z0-9]+/g, "-").slice(0, 64).replace(/^-+|-+$/g, "") || "question";
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join(" ");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return "";
}

function questionEntries(items: readonly FaqItem[], prefix: string) {
  const used = new Set<string>();
  return items.map((item) => {
    const base = prefix + (item.id ?? toSlug(item.question));
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    const text = `${item.question} ${item.answerText ?? nodeText(item.answer)}`.toLowerCase();
    return { ...item, id, text };
  });
}

function currentFragment() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

function hashFor(id: string) {
  return `#${encodeURIComponent(id)}`;
}

function marked(text: string, pattern: RegExp | null) {
  if (!pattern) return text;
  return text.split(pattern).map((part, index) => index % 2 === 1 ? <mark key={index}>{part}</mark> : part);
}

function ShareQuestion({ id }: { id: string }) {
  const [manual, setManual] = useState(false);
  const url = new URL(window.location.href);
  url.hash = hashFor(id);

  const selectLink = useCallback((input: HTMLInputElement | null) => {
    input?.focus();
    input?.select();
  }, []);

  return (
    <div className={styles.tools}>
      <CopyButton
        className={styles.copy}
        content={url.href}
        label="Copy link"
        messages={{ copied: "Question link copied.", error: "Question link selected. Copy it manually." }}
        onCopyError={() => setManual(true)}
        onCopied={() => setManual(false)}
      />
      {manual && <input className={styles.manual} ref={selectLink} value={url.href} aria-label="Question link" readOnly />}
    </div>
  );
}

export function SlitTypeFaq({
  items, embedded = false, headline = "Frequently asked questions", intro, preset, palette, darkPalette, theme = "auto",
  type = "single", defaultOpen = [], open, onOpenChange, idPrefix, search = true, searchLabel = "Search the answers",
  categories, ticker, contact, copyLinks = true, syncHash = false, minHeight, displayFont, textFont, ariaLabel, className, style,
}: SlitTypeFaqProps) {
  const enhanced = useEnhancedControls();
  const uid = useId();
  const prefix = idPrefix ?? `faq-${uid}-`;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const rows = useRef(new Map<string, HTMLDetailsElement>());
  const entries = useMemo(() => questionEntries(items, prefix), [items, prefix]);
  const single = type === "single";
  const initial = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  const defaultIds = initial.map((value) => typeof value === "number" ? entries[value]?.id :
    entries.find(({ id }) => id === value || id === prefix + value)?.id).filter(Boolean);
  const openIds = open ?? defaultIds;
  const firstOpen = openIds.find((value) => entries.some(({ id }) => id === value));

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const pattern = words.length
    ? new RegExp(`(${words.map((word) => word.replace(/[.*+?^\x24{}()|[\]\\]/g, "\\$&")).join("|")})`, "gi")
    : null;
  const matching = entries.filter(({ text }) => words.every((word) => text.includes(word)));
  const visible = matching.filter((item) => !category || item.category === category);
  const filtering = words.length > 0 || category !== null;

  function liveOpenIds() {
    return entries.filter(({ id }) => rows.current.get(id)?.open).map(({ id }) => id);
  }

  const revealFragment = useEffectEvent((id: string) => {
    const node = rows.current.get(id);
    if (!node) return;
    const needsScroll = !node.open || node.hidden;
    setQuery("");
    setCategory(null);
    if (!node.open) {
      const next = single ? [id] : [...liveOpenIds(), id];
      if (open === undefined) node.open = true;
      onOpenChange?.(next);
    }
    return needsScroll ? node.querySelector("summary") : null;
  });

  useEffect(() => {
    let frame = 0;
    function followHash() {
      cancelAnimationFrame(frame);
      const summary = revealFragment(currentFragment());
      if (summary) frame = requestAnimationFrame(() => summary.scrollIntoView({ block: "center", behavior: "instant" }));
    }
    followHash();
    window.addEventListener("hashchange", followHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", followHash);
    };
  }, []);

  function toggle(event: MouseEvent<HTMLElement>, id: string) {
    const current = liveOpenIds();
    const closing = current.includes(id);
    if (open !== undefined) event.preventDefault();
    if (onOpenChange) {
      onOpenChange(closing ? current.filter((value) => value !== id) : single ? [id] : [...current, id]);
    }
    if (syncHash && (!closing || currentFragment() === id)) {
      history.replaceState(history.state, "", location.pathname + location.search + (closing ? "" : hashFor(id)));
    }
  }

  function focusQuestion(event: KeyboardEvent, index: number) {
    const count = visible.length;
    if (!count) return;
    const destinations: Record<string, number> = {
      ArrowDown: (index + 1) % count, ArrowUp: (index - 1 + count) % count, Home: 0, End: count - 1,
    };
    const next = destinations[event.key];
    if (next === undefined) return;
    event.preventDefault();
    rows.current.get(visible[next].id)?.querySelector("summary")?.focus();
  }

  const variables = {
    ...paletteVars(preset && presets[preset].light, palette),
    ...paletteVars(preset && presets[preset].dark, darkPalette, "-dark"),
    "--faq-display-font": displayFont,
    "--faq-text-font": textFont,
    minHeight,
    ...style,
  } as CSSProperties;
  const Container = embedded ? "div" : "section";

  return (
    <Container
      className={cn(styles.root, className)}
      data-slot="slit-type-faq"
      data-theme={theme}
      data-embedded={embedded || undefined}
      aria-label={!embedded ? ariaLabel ?? (!headline ? "Frequently asked questions" : undefined) : undefined}
      aria-labelledby={!embedded && !ariaLabel && headline ? `${uid}-heading` : undefined}
      style={variables}
    >
      {!embedded && (
        <div>
          {headline && (
            <h2 className={styles.heading} id={`${uid}-heading`}>
              <VerticalCutReveal splitBy="characters" inView staggerDuration={0.018} transition={{ duration: 0.42, ease: "easeOut" }}>
                {headline}
              </VerticalCutReveal>
            </h2>
          )}
          {intro && <div className={styles.intro}>{intro}</div>}
          {ticker?.length ? <p className={styles.ticker}>{ticker.join(" · ")}</p> : null}
        </div>
      )}
      <div className={styles.body}>
        {enhanced && search && (
          <div className={styles.search} role="search" aria-label="FAQ">
            <label htmlFor={`${uid}-search`}>{searchLabel}</label>
            <div className={styles.field}>
              <SearchIcon aria-hidden="true" />
              <input
                ref={searchInput} id={`${uid}-search`} type="search" value={query} autoComplete="off"
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") focusQuestion(event, -1);
                  if (event.key === "Escape" && query) { event.preventDefault(); setQuery(""); }
                }}
              />
              {query && <button type="button" onClick={() => { setQuery(""); searchInput.current?.focus(); }}>Clear</button>}
            </div>
          </div>
        )}
        {enhanced && categories?.length ? (
          <ul className={styles.filters} aria-label="Filter by topic">
            <li><button type="button" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button></li>
            {categories.map((value) => (
              <li key={value}><button type="button" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button></li>
            ))}
          </ul>
        ) : null}
        {enhanced && (search || categories?.length) ? (
          <p role="status" className={filtering ? styles.count : "sr-only"}>
            {filtering ? `${visible.length} of ${entries.length} questions` : ""}
          </p>
        ) : null}
        <div className={styles.list}>
          {entries.map(({ answer, id, question }) => {
            const position = visible.findIndex((item) => item.id === id);
            const row = (
              <span className={styles.row}>
                <span className={styles.label}>{marked(question, pattern)}</span>
                <span className={styles.plus}><PlusIcon aria-hidden="true" /></span>
              </span>
            );
            return (
              <details
                key={id}
                ref={(node) => { if (node) rows.current.set(id, node); else rows.current.delete(id); }}
                className={styles.question}
                name={single ? uid : undefined}
                open={(single ? firstOpen === id : openIds.includes(id)) || undefined}
                hidden={position < 0}
                suppressHydrationWarning
              >
                <summary
                  className={styles.summary}
                  onClick={onOpenChange || syncHash || open !== undefined ? (event) => toggle(event, id) : undefined}
                  onKeyDown={(event) => focusQuestion(event, position)}
                >
                  {row}
                  <span aria-hidden="true" className={styles.flood} data-slot="faq-flood">{row}</span>
                </summary>
                <div className={styles.panel} data-slot="faq-panel" id={id}>
                  <div className={styles.answer}>{typeof answer === "string" ? <p>{marked(answer, pattern)}</p> : answer}</div>
                  {enhanced && copyLinks && <ShareQuestion id={id} />}
                </div>
              </details>
            );
          })}
        </div>
        {entries.length > 0 && !visible.length && (
          <div className={styles.empty}>
            <p>No matching questions.</p>
            <button type="button" onClick={() => { setQuery(""); setCategory(null); searchInput.current?.focus(); }}>Show all questions</button>
          </div>
        )}
        {contact && (
          <div className={styles.contact}>
            <p>{contact.prompt}</p>
            <a href={contact.href}>{contact.label}</a>
          </div>
        )}
      </div>
    </Container>
  );
}

export default SlitTypeFaq;
