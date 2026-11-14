"use client";

import { useRef, useState } from "react";
import { useEnhancedControls } from "./use-enhanced-controls";

export function ShareLink({ canonicalUrl }: { canonicalUrl?: string }) {
  const [copied, setCopied] = useState(false);
  const link = useRef<HTMLInputElement>(null);
  const enhanced = useEnhancedControls();

  if (!enhanced && !canonicalUrl) return null;

  function prepareLink() {
    if (!link.current) return;
    link.current.value = canonicalUrl ?? `${window.location.origin}${window.location.pathname}`;
    setCopied(false);
  }

  async function copyLink() {
    if (!link.current) return;
    try {
      await navigator.clipboard.writeText(link.current.value);
      setCopied(true);
    } catch {
      link.current.focus();
      link.current.select();
    }
  }

  return (
    <details className="watch-share" onToggle={prepareLink}>
      <summary className="watch-text-link">Share</summary>
      <div className="watch-share-panel">
        <label htmlFor="watch-share-url">Episode link</label>
        <div>
          <input id="watch-share-url" ref={link} type="url" readOnly defaultValue={canonicalUrl} />
          {enhanced && <button type="button" onClick={copyLink}>Copy</button>}
        </div>
        <span role="status">{copied ? "Link copied." : ""}</span>
      </div>
    </details>
  );
}
