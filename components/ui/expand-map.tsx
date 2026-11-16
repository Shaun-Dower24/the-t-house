"use client";

import { ChevronDownIcon, MapIcon } from "lucide-react";
import { useId, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import styles from "./expand-map.module.css";

export interface LocationMapProps {
  location?: string;
  coordinates?: string;
  className?: string;
}

function pointerTilt({ currentTarget, pointerType, clientX, clientY }: PointerEvent<HTMLDetailsElement>) {
  if (pointerType !== "mouse") return;
  const bounds = currentTarget.parentElement?.getBoundingClientRect();
  if (!bounds?.width || !bounds.height) return;
  const x = Math.min(1, Math.max(-1, 2 * (clientX - bounds.left) / bounds.width - 1));
  const y = Math.min(1, Math.max(-1, 2 * (clientY - bounds.top) / bounds.height - 1));
  currentTarget.style.setProperty("--map-tilt-x", `${-4 * y}deg`);
  currentTarget.style.setProperty("--map-tilt-y", `${4 * x}deg`);
}

function resetTilt({ currentTarget }: PointerEvent<HTMLDetailsElement>) {
  currentTarget.style.removeProperty("--map-tilt-x");
  currentTarget.style.removeProperty("--map-tilt-y");
}

export function LocationMap({ location = "Location", coordinates, className }: LocationMapProps) {
  const panelId = useId();

  return (
    <div className={cn(styles.frame, className)} data-slot="expand-map">
      <details
        className={styles.card}
        onPointerMove={pointerTilt}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
      >
        <summary className={styles.summary} aria-controls={panelId}>
          <MapIcon className={styles.topIcon} aria-hidden="true" />
          <span className={styles.label}>{location}</span>
          <span className={styles.action}>
            <span className={styles.expandText}>Show map</span>
            <span className={styles.collapseText}>Hide map</span>
            <ChevronDownIcon className={styles.chevron} aria-hidden="true" />
          </span>
        </summary>
        <div className={styles.panel} id={panelId}>
          <div className={styles.atlas} aria-hidden="true">
            <svg className={styles.art} viewBox="0 0 360 160" preserveAspectRatio="xMidYMid slice" focusable="false">
              <path
                className={styles.blocks}
                d="M12 9H38V27H12ZM101 9H129V23H101ZM161 13H199V29H161ZM279 10H305V30H279ZM52 65H82V80H52ZM154 63L168 74H187V88H154ZM196 85H228V97H196ZM292 88H321V105H292ZM15 134H45V154H15ZM100 134H128V153H100ZM247 129H278V149H247ZM310 136H340V151H310Z"
              />
              <path
                className={styles.minorRoads}
                pathLength={1}
                d="M0 35H360M0 92H145L170 112H360M0 144H360M46 0V160M136 0V160M208 0V160M307 0V160M340 0V160"
              />
              <path
                className={styles.majorRoads}
                pathLength={1}
                d="M0 56H139L168 78H360M0 122H151L186 104H360M90 0V160M259 0V48L236 78V160"
              />
            </svg>
            <svg className={styles.pin} viewBox="0 0 24 30" focusable="false" data-slot="expand-map-pin">
              <path fill="currentColor" d="M12 0a12 12 0 0 0-12 12c0 6.6 12 18 12 18s12-11.4 12-18A12 12 0 0 0 12 0Z" />
              <circle cx="12" cy="11" r="3.1" fill="var(--sign-white)" />
            </svg>
          </div>
          <div className={styles.caption}>
            <span>Illustrative map</span>
            {coordinates && <span className={styles.coordinates}>{coordinates}</span>}
          </div>
        </div>
      </details>
    </div>
  );
}
