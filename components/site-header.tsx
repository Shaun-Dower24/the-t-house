"use client";

import { useRef, useSyncExternalStore } from "react";
import { studio } from "../content/studio";

const links = [
  { href: "#arrival", label: "Home" },
  { href: "#watch", label: "Watch" },
  { href: "#inside", label: "Inside the House" },
  { href: "#follow", label: "Follow" },
];

const subscribe = () => () => {};

export function SiteHeader({ reduceMotion, toggleMotion, systemReduced }: {
  reduceMotion: boolean;
  toggleMotion: () => void;
  systemReduced: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const destination = useRef<string | null>(null);
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);

  function closeMenu() {
    const sectionId = destination.current;
    destination.current = null;

    if (sectionId) {
      document.getElementById(sectionId)?.focus({ preventScroll: true });
    } else {
      menu.current?.focus();
    }
  }

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="page-grid header-inner">
        <a className="wordmark" href="#arrival" aria-label={`${studio.name} home`}>
          <span className="house-mark" aria-hidden="true" />
          The T-House<span className="sr-only"> Studio</span>
        </a>
        <div className="header-actions">
          <nav className="header-nav" aria-label="Main">
            <a href="#watch">Watch</a>
            <a href="#inside">Inside<span className="sr-only"> the House</span></a>
            {!enhanced && <a href="#follow">Follow</a>}
          </nav>
          {enhanced && (
            <button ref={menu} type="button" className="menu-trigger" aria-haspopup="dialog" aria-controls="site-menu" onClick={() => dialog.current?.showModal()}>
              <span aria-hidden="true" className="menu-icon" /> Menu
            </button>
          )}
        </div>
      </div>
      <dialog ref={dialog} id="site-menu" className="site-menu" aria-labelledby="menu-title" onClose={closeMenu}>
        <div className="page-grid menu-layout">
          <div className="menu-top">
            <h2 id="menu-title" className="meta">The T-House / Menu</h2>
            <form method="dialog"><button className="menu-trigger" autoFocus>Close <span aria-hidden="true">×</span></button></form>
          </div>
          <nav aria-label="Site menu" className="menu-links">
            {links.map(({ href, label }) => (
              <a key={href} href={href} onClick={(event) => {
                if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
                destination.current = href.slice(1);
                dialog.current?.close();
              }}>{label}<span aria-hidden="true">↘</span></a>
            ))}
          </nav>
          <div className="menu-bottom">
            <div className="menu-socials">
              <a href={studio.youtube}>YouTube <span aria-hidden="true">↗</span></a>
              <a href={studio.instagram}>Instagram <span aria-hidden="true">↗</span></a>
            </div>
            <button type="button" className="motion-control" aria-pressed={reduceMotion} disabled={systemReduced} onClick={toggleMotion}>
              {systemReduced ? "Reduce motion (system)" : "Reduce motion"}
            </button>
          </div>
        </div>
      </dialog>
    </header>
  );
}
