"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./glass.module.css";

export function EpisodeThumbnail({ src, sizes }: { src: string; sizes: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.thumbnail}>
    <span className={styles.thumbnailFallback} aria-hidden="true">The T-House<span>Watch the episode ↗</span></span>
    {!failed && <Image src={src} alt="" fill unoptimized sizes={sizes} onError={() => setFailed(true)} />}
  </div>;
}
