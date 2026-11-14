import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-grid section-space">
      <h1 className="display section-title">Page not found<span>.</span></h1>
      <p className="intro">Explore the latest video or head back to The T-House.</p>
      <div className="actions">
        <Link className="primary-action" href="/watch">Go to Watch</Link>
        <Link className="text-action" href="/">Back to the house</Link>
      </div>
    </div>
  );
}
