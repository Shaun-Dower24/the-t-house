import Link from "next/link";
import { studio } from "../../../content/studio";

export default function VideoNotFound() {
  return (
    <section className="watch-page">
      <div className="page-grid watch-inner">
        <header className="watch-detail-header">
          <h1>Video unavailable</h1>
          <p>Find our published videos in Watch or on YouTube.</p>
        </header>
        <div className="watch-actions">
          <Link className="watch-primary-link" href="/watch">Back to Watch <span aria-hidden="true">↗</span></Link>
          <a className="watch-text-link" href={studio.youtube}>YouTube channel <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
