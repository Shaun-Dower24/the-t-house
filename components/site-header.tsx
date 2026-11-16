"use client";

import { useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { studio } from "../content/studio";
import { StudioMark } from "./studio-mark";

const links = [
  { href: "/", label: "Home" },
  { href: "/watch", label: "Watch" },
  { href: "/inside-the-house", label: "Inside the House" },
  { href: "/about", label: "About" },
  { href: "/connect", label: "Connect" },
];

const subscribe = () => () => {};

export function SiteHeader({ reduceMotion, toggleMotion, systemReduced }: {
  reduceMotion: boolean;
  toggleMotion: () => void;
  systemReduced: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);

  function closeMenu() {
    menu.current?.focus();
  }

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="page-grid header-inner">
        <Link className="wordmark" href="/" aria-label={`${studio.name} home`}>
          <StudioMark className="studio-mark header-mark" />
        </Link>
        <div className="header-actions">
          <nav className="header-nav" aria-label="Main">
            <Link href="/watch" data-shuffle aria-current={pathname.startsWith("/watch") ? "page" : undefined}>Watch</Link>
            <Link href="/inside-the-house" data-shuffle aria-current={pathname === "/inside-the-house" ? "page" : undefined}>Inside<span className="sr-only"> the House</span></Link>
            <Link href="/about" data-shuffle className="header-secondary" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
            <Link href="/connect" data-shuffle className="header-secondary" aria-current={pathname === "/connect" ? "page" : undefined}>Connect</Link>
          </nav>
          {enhanced && (
            <button ref={menu} type="button" className="menu-trigger sticker" data-shuffle aria-haspopup="dialog" aria-controls="site-menu" onClick={() => dialog.current?.showModal()}>
              <span aria-hidden="true" className="menu-icon" /> Menu
            </button>
          )}
        </div>
      </div>
      <dialog ref={dialog} id="site-menu" className="site-menu" aria-labelledby="menu-title" onClose={closeMenu}>
        <div className="page-grid menu-layout">
          <div className="menu-top">
            <StudioMark className="studio-mark menu-mark" />
            <h2 id="menu-title" className="sr-only">The T-House / Menu</h2>
            <form method="dialog"><button className="menu-trigger sticker" data-shuffle autoFocus>Close <span aria-hidden="true">×</span></button></form>
          </div>
          <nav aria-label="Site menu" className="menu-links">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} data-shuffle aria-current={pathname === href ? "page" : undefined} onClick={(event) => {
                if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
                dialog.current?.close();
              }}>{label}<span aria-hidden="true">↗</span></Link>
            ))}
          </nav>
          <div className="menu-bottom">
            <div className="menu-socials">
              <a href={studio.youtube} data-shuffle>YouTube <span aria-hidden="true">↗</span></a>
              <a href={studio.instagram} data-shuffle>Instagram <span aria-hidden="true">↗</span></a>
            </div>
            <button type="button" className="motion-control" aria-pressed={reduceMotion} disabled={systemReduced} onClick={toggleMotion}>
              {systemReduced ? "Reduce motion (system)" : "Reduce motion"}
            </button>
          </div>
        </div>
      </dialog>
      <svg className="graffiti-edge graffiti-edge-bottom" viewBox="0 0 1440 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className="graffiti-stroke" d="M0 3 120 4 267 2 410 5 599 3 760 4 944 2 1100 5 1267 3 1440 4 M12 6 210 5 390 7 510 5 M1010 6 1190 7 1430 5" />
      </svg>
    </header>
  );
}
