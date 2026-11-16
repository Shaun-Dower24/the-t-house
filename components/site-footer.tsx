import { studio } from "../content/studio";
import { HouseOutline } from "./house-outline";
import Link from "next/link";
import { StudioMark } from "./studio-mark";

export function SiteFooter() {
  return (
    <footer id="follow" className="site-footer" tabIndex={-1}>
      <svg className="graffiti-edge graffiti-edge-top" viewBox="0 0 1440 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className="graffiti-stroke" d="M0 4 170 2 322 5 510 3 690 4 870 2 1030 5 1200 3 1440 4 M20 7 240 5 410 6 M990 6 1180 7 1420 5" />
      </svg>
      <div className="page-grid footer-layout">
        <div className="footer-art" aria-hidden="true"><HouseOutline /></div>
        <Link className="wordmark" href="/" aria-label={`${studio.name} home`}>
          <StudioMark className="studio-mark footer-mark" />
        </Link>
        <nav aria-label="Footer" className="footer-nav">
          <Link href="/watch">Watch</Link>
          <Link href="/inside-the-house">Inside the House</Link>
          <Link href="/about">About</Link>
          <Link href="/connect">Connect</Link>
        </nav>
        <nav className="social-links" aria-label="Social media">
          <a className="sticker" href={studio.youtube}>YouTube <span aria-hidden="true">↗</span></a>
          <a className="sticker" href={studio.instagram}>Instagram <span aria-hidden="true">↗</span></a>
        </nav>
        <svg className="footer-tag" viewBox="0 0 110 90" aria-hidden="true" focusable="false">
          <path className="graffiti-stroke" d="m8 42 43-32 48 30 M13 45 54 15 98 44 M22 36l-1 39 67-2 1-38 M27 38l-1 34 M43 73l1-24 19 1-1 23 M29 43l9-1v12h-9z M71 43l9 1v12l-9-1z M16 78l79-4" />
          <path className="footer-tag-signature" d="m31 83 44-4 m-36 7 27-4 m-9-4-2 10" />
        </svg>
      </div>
    </footer>
  );
}
