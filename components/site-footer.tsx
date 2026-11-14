import { studio } from "../content/studio";
import { HouseOutline } from "./house-outline";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="follow" className="site-footer" aria-labelledby="follow-heading" tabIndex={-1}>
      <div className="page-grid">
        <div className="footer-art" aria-hidden="true"><HouseOutline /></div>
        <div className="follow-layout grid">
          <div>
            <h2 id="follow-heading" className="display footer-title">Stay connected<span>.</span></h2>
            <p>Follow The T-House for studio content and updates.</p>
          </div>
          <nav className="social-links" aria-label="Social media">
            <a href={studio.youtube}>YouTube <span aria-hidden="true">↗</span></a>
            <a href={studio.instagram}>Instagram <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
        <div className="footer-base flex flex-wrap justify-between gap-3">
          <span>{studio.name}</span>
          <nav aria-label="Footer" className="footer-nav">
            <Link href="/watch">Watch</Link>
            <Link href="/inside-the-house">Inside the House</Link>
            <Link href="/about">About</Link>
            <Link href="/connect">Connect</Link>
          </nav>
          <span>{studio.location}</span>
        </div>
      </div>
    </footer>
  );
}
