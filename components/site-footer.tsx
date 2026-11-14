import { studio } from "../content/studio";

export function SiteFooter() {
  return (
    <footer id="follow" className="site-footer" aria-labelledby="follow-heading">
      <div className="page-grid">
        <div className="follow-layout grid">
          <div>
            <h2 id="follow-heading" className="display footer-title">Stay connected.</h2>
            <p>Follow The T-House for studio content and updates.</p>
          </div>
          <nav className="social-links" aria-label="Social media">
            <a href={studio.youtube}>YouTube <span aria-hidden="true">↗</span></a>
            <a href={studio.instagram}>Instagram <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
        <div className="footer-base flex flex-wrap justify-between gap-3">
          <span>{studio.name}</span>
          <span>{studio.location}</span>
        </div>
      </div>
    </footer>
  );
}
