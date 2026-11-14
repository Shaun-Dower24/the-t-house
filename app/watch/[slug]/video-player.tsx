"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useEnhancedControls } from "./use-enhanced-controls";

type Props = {
  title: string;
  duration: string;
  thumbnail: string;
  url: string;
  embedUrl?: string;
};

export function VideoPlayer({ title, duration, thumbnail, url, embedUrl }: Props) {
  const [activated, setActivated] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const canLoadPlayer = useEnhancedControls() && Boolean(embedUrl);
  const poster = (
    <>
      <Image
        src={thumbnail}
        alt=""
        fill
        preload
        sizes="(min-width: 1200px) 1100px, 92vw"
        unoptimized
      />
      <span className="watch-play-mark" aria-hidden="true" />
      <span className="watch-play-label">{canLoadPlayer ? "Load YouTube player" : "Watch on YouTube"}</span>
      <span className="watch-duration" aria-hidden="true">{duration}</span>
    </>
  );

  useEffect(() => {
    if (activated) container.current?.focus();
  }, [activated]);

  return (
    <div className="watch-player-wrap">
      <div ref={container} className="watch-player" tabIndex={-1} role="group" aria-label={`Video player for ${title}`}>
        {activated && embedUrl ? (
          <iframe
            src={`${embedUrl}?playsinline=1&rel=0`}
            title={title}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : canLoadPlayer ? (
          <button className="watch-poster watch-player-trigger" type="button" onClick={() => setActivated(true)}>
            {poster}
          </button>
        ) : (
          <a className="watch-poster watch-player-trigger" href={url}>{poster}</a>
        )}
      </div>
    </div>
  );
}
