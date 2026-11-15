import styles from "./graffiti-arrow.module.css";

export function GraffitiArrow({
  direction,
  showSpray = true,
}: {
  direction: "left" | "right";
  showSpray?: boolean;
}) {
  return (
    <span className={styles.icon} aria-hidden="true">
      <svg className={styles.mark} viewBox="0 0 44 24" focusable="false" fill="currentColor">
        <g transform={direction === "left" ? "translate(44 0) scale(-1 1)" : undefined}>
          <path d="M2.8 12.9c7-1.7 14.4-2.2 22.2-1.9l9-.6-6.4-4.5 1.8-2.6c4.3 2.3 8.8 4.8 12.6 8l-.4 2a65 65 0 0 0-12.8 8.1l-2.2-2.1 7-5.4c-9.3.1-18.1.7-27.2 2l-3.3-.9Z" />
          <path d="m1.3 15.7 1.7-.7-.6 1.2-1.6.5Zm7.2 1.5 7.4-1.2 5.4.2-6.3.9Zm26.3 1.7 4.6-3.6 2.5-.7-1.8 1.9Z" opacity=".58" />
        </g>
      </svg>
      {showSpray && <GraffitiSpray className={styles.spray} />}
    </span>
  );
}

export function GraffitiSpray({ className, stretch = false }: { className: string; stretch?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 12"
      preserveAspectRatio={stretch ? "none" : undefined}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d="M2.5 7.8C10.6 5.9 23.7 4.2 41.7 4" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="m4.1 7.6 7.2-2.3L20 4.2l5.8-.2 5.6-1 9.9.3-1.2 1.4-9.4 1.2-5.3.2-7.9.9-6.6 1-6.5.1Z" />
      <g opacity=".65">
        <circle cx="1.3" cy="5.7" r=".75" /><circle cx="5.5" cy="10" r=".9" />
        <circle cx="9.8" cy="3.9" r=".72" /><circle cx="14" cy="9.5" r=".63" />
        <circle cx="17.5" cy="2.5" r=".66" /><circle cx="25.5" cy="7.8" r=".75" />
        <circle cx="28.5" cy="2" r=".82" /><circle cx="33.7" cy="7.2" r=".57" />
        <circle cx="38.8" cy="1.65" r=".63" /><circle cx="43" cy="6.3" r=".75" />
      </g>
    </svg>
  );
}
