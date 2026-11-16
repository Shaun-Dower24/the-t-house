"use client";

import { CalendarCheck, ChevronLeft, ChevronRight, Globe2 } from "lucide-react";
import { useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useEnhancedControls } from "@/lib/use-enhanced-controls";
import { cn } from "@/lib/utils";
import styles from "./slot-week-picker.module.css";

export interface Slot {
  /** ISO timestamp with a UTC offset. */
  start: string;
  unavailableReason?: string;
}

export interface SlotWeekPickerProps {
  slots: readonly Slot[];
  timeZone?: string;
  slotMinutes?: number;
  minNoticeHours?: number;
  /** Freeze the current time for a preview or test. */
  now?: Date | string;
  title?: string;
  confirmationLabel?: string;
  successMessage?: string;
  onChange?: (slot: Slot | null) => void;
  onConfirm?: (slot: Slot) => Promise<void> | void;
  className?: string;
}

const dayMs = 86_400_000;
const dayDate = (key: string) => new Date(`${key}T12:00:00Z`);
const addDays = (key: string, days: number) => new Date(dayDate(key).getTime() + days * dayMs).toISOString().slice(0, 10);
const readServerClock = () => null;
const nowInstant = () => Date.now();
const readClock = () => Math.floor(nowInstant() / 1000) * 1000;

function subscribeClock(update: () => void) {
  const timer = window.setInterval(update, 1000);
  return () => window.clearInterval(timer);
}

function subscribeStatic() {
  return () => {};
}

function validZone(value: string | undefined) {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: value }).resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function formatters(zone: string) {
  const format = (options: Intl.DateTimeFormatOptions, timeZone = zone) =>
    new Intl.DateTimeFormat("en-GB", { ...options, timeZone });
  const calendar = format({ year: "numeric", month: "2-digit", day: "2-digit" });
  const offsets = format({ hour: "2-digit", timeZoneName: "shortOffset" });
  return {
    dayKey: (instant: number) => {
      const parts = calendar.formatToParts(instant);
      return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
    },
    time: format({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    offset: (instant: number) => {
      const label = offsets.formatToParts(instant).find(({ type }) => type === "timeZoneName")?.value.replace("GMT", "UTC") ?? "";
      return /^UTC[+-]0{1,2}(?::00)?$/.test(label) ? "UTC" : label;
    },
    weekday: format({ weekday: "short" }, "UTC"),
    day: format({ day: "numeric" }, "UTC"),
    fullDate: format({ weekday: "long", day: "numeric", month: "long", year: "numeric" }, "UTC"),
    shortDate: format({ day: "numeric", month: "short" }, "UTC"),
  };
}

function timeOptions(slots: readonly Slot[]) {
  const unique = new Map<number, Slot>();
  for (const slot of slots) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(slot.start)) continue;
    const instant = Date.parse(slot.start);
    if (!Number.isFinite(instant)) continue;
    const earlier = unique.get(instant);
    if (!earlier || (!earlier.unavailableReason && slot.unavailableReason)) unique.set(instant, slot);
  }
  return Array.from(unique, ([instant, slot]) => ({ instant, slot })).sort((a, b) => a.instant - b.instant);
}

function blockedReason(instant: number, clock: number, noticeHours: number, reason?: string) {
  if (instant <= clock) return "Time has passed";
  if (reason) return reason;
  if (instant - clock < noticeHours * 3_600_000) return `${noticeHours} h notice required`;
  return undefined;
}

function countWeeks(first: string, last: string) {
  return Math.max(0, Math.floor((dayDate(last).getTime() - dayDate(first).getTime()) / (7 * dayMs)));
}

function startsIn(instant: number, clock: number) {
  const minutes = Math.ceil((instant - clock) / 60_000);
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours ? `${hours} h${remaining ? ` ${remaining} min` : ""}` : `${minutes} min`;
}

export function SlotWeekPicker({
  slots, timeZone, slotMinutes = 30, minNoticeHours = 2, now, title = "Pick a time",
  confirmationLabel = "Confirm", successMessage = "Time confirmed.", onChange, onConfirm, className,
}: SlotWeekPickerProps) {
  const enhanced = useEnhancedControls();
  const uid = useId();
  const inheritedZone = enhanced ? undefined : "UTC";
  const zone = useMemo(() => validZone(timeZone ?? inheritedZone), [timeZone, inheritedZone]);
  const fmt = useMemo(() => formatters(zone), [zone]);
  const fixedValue = now instanceof Date ? now.getTime() : now ? Date.parse(now) : NaN;
  const fixedClock = Number.isFinite(fixedValue) ? fixedValue : null;
  const liveClock = useSyncExternalStore<number | null>(fixedClock === null ? subscribeClock : subscribeStatic, readClock, readServerClock);
  const clock = fixedClock ?? liveClock;
  const notice = Number.isFinite(minNoticeHours) ? Math.max(0, minNoticeHours) : 2;
  const duration = Number.isFinite(slotMinutes) && slotMinutes > 0 ? slotMinutes : 30;
  const options = useMemo(() => timeOptions(slots).map(({ instant, slot }) => ({
    instant, slot, key: fmt.dayKey(instant), label: fmt.time.format(instant),
  })), [slots, fmt]);

  const [week, setWeek] = useState<number | null>(null);
  const [preferredDay, setPreferredDay] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState<ReadonlySet<number>>(new Set());
  const [feedback, setFeedback] = useState("");
  const dateButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const inFlight = useRef(false);

  const today = clock === null ? null : fmt.dayKey(clock);
  const latest = options.at(-1)?.key;
  const available = clock === null ? [] : options.map((option) => ({
    ...option, reason: blockedReason(option.instant, clock, notice, option.slot.unavailableReason),
  }));
  const firstFree = available.find(({ reason }) => !reason)?.key;
  const lastWeek = today && latest ? countWeeks(today, latest) : 0;
  const initialWeek = today && firstFree ? countWeeks(today, firstFree) : 0;
  const activeWeek = Math.min(week ?? initialWeek, lastWeek);
  const days = today ? Array.from({ length: 7 }, (_, index) => addDays(today, activeWeek * 7 + index)) : [];
  const weekOptions = available.filter(({ key }) => days.includes(key));
  const day = preferredDay && days.includes(preferredDay) ? preferredDay :
    weekOptions.find(({ reason }) => !reason)?.key ?? weekOptions[0]?.key ?? days[0];
  const daySlots = available.filter(({ key }) => key === day);
  const labelCounts = new Map<string, number>();
  for (const { label } of daySlots) labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
  const pickedSlot = daySlots.find(({ instant }) => instant === picked);
  const selected = pickedSlot && !pickedSlot.reason ? pickedSlot : undefined;
  const selectedConfirmed = picked !== null && confirmed.has(picked);
  const canConfirm = Boolean(enhanced && selected && !selectedConfirmed && !pending && onConfirm);

  function moveToDay(next: string) {
    if (!enhanced || inFlight.current || next === day) return;
    setPreferredDay(next);
    setWeek(activeWeek);
    setFeedback("");
    if (picked !== null) {
      setPicked(null);
      onChange?.(null);
    }
  }

  function moveWeek(delta: number) {
    const next = activeWeek + delta;
    if (!enhanced || inFlight.current || next < 0 || next > lastWeek) return;
    setWeek(next);
    setPreferredDay(null);
    setFeedback("");
    if (picked !== null) {
      setPicked(null);
      onChange?.(null);
    }
  }

  function dateKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % days.length; break;
      case "ArrowLeft": next = (index + days.length - 1) % days.length; break;
      case "Home": next = 0; break;
      case "End": next = days.length - 1; break;
      default: return;
    }
    event.preventDefault();
    moveToDay(days[next]);
    dateButtons.current[next]?.focus();
  }

  async function confirmSelection() {
    if (!onConfirm || !selected || !canConfirm || inFlight.current) return;
    const reason = blockedReason(selected.instant, fixedClock ?? nowInstant(), notice, selected.slot.unavailableReason);
    if (reason) {
      setFeedback("That time is no longer available. Choose another time.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setFeedback("Confirming time…");
    try {
      await onConfirm(selected.slot);
      setConfirmed((previous) => new Set(previous).add(selected.instant));
      setFeedback(successMessage);
    } catch {
      setFeedback("Could not confirm this time. Try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const range = days.length ? fmt.shortDate.formatRange(dayDate(days[0]), dayDate(days[6])).replace(/\s+/g, " ") : "";
  const dayTitle = day ? fmt.fullDate.format(dayDate(day)) : "";
  const end = pickedSlot ? pickedSlot.instant + duration * 60_000 : null;
  let summary = picked === null ? "No time selected." : "Selected time is no longer available.";
  if (pickedSlot && end !== null && (!pickedSlot.reason || selectedConfirmed)) {
    const startOffset = fmt.offset(pickedSlot.instant);
    const endOffset = fmt.offset(end);
    const showOffset = (labelCounts.get(pickedSlot.label) ?? 0) > 1 || startOffset !== endOffset;
    const endDate = fmt.dayKey(end);
    const startTime = showOffset ? `${pickedSlot.label} ${startOffset}` : pickedSlot.label;
    const finishTime = showOffset ? `${fmt.time.format(end)} ${endOffset}` : fmt.time.format(end);
    const nextDate = endDate === pickedSlot.key ? "" : ` on ${fmt.shortDate.format(dayDate(endDate))}`;
    summary = `${fmt.shortDate.format(dayDate(pickedSlot.key))}, ${startTime} to ${finishTime}${nextDate}`;
  }

  return (
    <section className={cn(styles.root, className)} data-slot="slot-week-picker" aria-labelledby={`${uid}-title`}>
      <header className={styles.header}>
        <div>
          <h2 id={`${uid}-title`} className={styles.title}>{title}</h2>
          {range && <p className={styles.range} aria-live="polite">{range}</p>}
        </div>
        {days.length > 0 && (
          <div className={styles.navigation}>
            <button type="button" className={styles.arrow} aria-label="Previous week" aria-disabled={activeWeek === 0 || pending} disabled={!enhanced} onClick={() => moveWeek(-1)}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className={styles.arrow} aria-label="Next week" aria-disabled={activeWeek === lastWeek || pending} disabled={!enhanced} onClick={() => moveWeek(1)}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        )}
      </header>
      {day && (
        <>
          <div role="tablist" aria-label="Days" className={styles.days}>
            {days.map((key, index) => {
              const date = dayDate(key);
              const count = weekOptions.filter((option) => option.key === key && !option.reason).length;
              return (
                <button
                  key={key}
                  ref={(element) => { dateButtons.current[index] = element; }}
                  id={`${uid}-day-${index}`}
                  role="tab"
                  type="button"
                  aria-controls={`${uid}-panel`}
                  aria-selected={day === key}
                  aria-label={`${fmt.fullDate.format(date)}, ${count} available`}
                  tabIndex={day === key ? 0 : -1}
                  disabled={!enhanced || pending}
                  onClick={() => moveToDay(key)}
                  onKeyDown={(event) => dateKeys(event, index)}
                  className={styles.day}
                >
                  <span className={styles.weekday}>{fmt.weekday.format(date)}</span>
                  <strong className={styles.number}>{fmt.day.format(date)}</strong>
                  <span className={styles.dayCount}>{count} free</span>
                </button>
              );
            })}
          </div>
          <div
            id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-day-${days.indexOf(day)}`}
            tabIndex={enhanced && !daySlots.some(({ reason }) => !reason) ? 0 : undefined}
            className={styles.panel}
          >
            <fieldset className={styles.slots}>
              <legend className={styles.legend}>Times for {dayTitle}</legend>
              {daySlots.length ? (
                <div className={styles.grid}>
                  {daySlots.map((slot) => {
                    const pickedHere = slot.instant === picked && !slot.reason;
                    const repeatedLabel = (labelCounts.get(slot.label) ?? 0) > 1;
                    const visibleLabel = repeatedLabel ? `${slot.label} ${fmt.offset(slot.instant)}` : slot.label;
                    return (
                      <label key={slot.instant} className={styles.slot} data-selected={pickedHere || undefined} data-unavailable={Boolean(slot.reason) || undefined}>
                        <input
                          type="radio"
                          className="sr-only"
                          name={`${uid}-time`}
                          value={String(slot.instant)}
                          checked={pickedHere}
                          disabled={!enhanced || pending || Boolean(slot.reason)}
                          onChange={() => {
                            if (slot.reason || inFlight.current) return;
                            setPreferredDay(day);
                            setWeek(activeWeek);
                            setPicked(slot.instant);
                            setFeedback("");
                            onChange?.(slot.slot);
                          }}
                        />
                        <span className={styles.tile}>
                          <span className={styles.time}>{visibleLabel}</span>
                          {slot.reason && <small className={styles.reason}>{slot.reason}</small>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : <p className={styles.empty}>No times listed for this day.</p>}
            </fieldset>
          </div>
        </>
      )}
      {!day && enhanced && <p className={styles.empty}>Loading time slots…</p>}
      <footer className={styles.footer}>
        <p className={styles.zone}><Globe2 aria-hidden="true" /> Times shown in {zone.replaceAll("_", " ")}</p>
        <div className={styles.summaryRow}>
          <div className={styles.summary} aria-live="polite">
            <p>{summary}</p>
            {selected && clock !== null && !selectedConfirmed && (
              <p className={styles.notice}>Starts in {startsIn(selected.instant, clock)}</p>
            )}
          </div>
          {onConfirm && (
            <button type="button" className={styles.confirm} disabled={!enhanced} aria-disabled={!canConfirm} onClick={() => void confirmSelection()}>
              <CalendarCheck aria-hidden="true" />{pending ? "Confirming…" : selectedConfirmed ? "Confirmed" : confirmationLabel}
            </button>
          )}
        </div>
        <p role="status" className={styles.status}>{feedback}</p>
        <noscript>Enable JavaScript to change dates and select a time.</noscript>
      </footer>
    </section>
  );
}

export default SlotWeekPicker;
