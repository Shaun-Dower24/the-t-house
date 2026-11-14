import Link from "next/link";
import { studio } from "../content/studio";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="page-grid header-inner flex items-center justify-between">
        <Link className="wordmark flex items-center" href="/#arrival" aria-label={`${studio.name} home`}>
          <span className="house-mark" aria-hidden="true" />
          <span aria-hidden="true">The T-House<small>Creative music studio</small></span>
        </Link>
        <nav className="header-nav flex items-center" aria-label="Main">
          <a href="#inside">Inside</a>
          <a href="#follow">Follow</a>
          <a className="header-youtube" href={studio.youtube}>
            YouTube <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
