import Link from "next/link";
import { type publishedVideos, videoKindLabels } from "../../content/studio";
import { EpisodeThumbnail } from "./episode-thumbnail";
import styles from "./glass.module.css";

export function GlassEpisodeCard({ video }: { video: (typeof publishedVideos)[number] }) {
  return <article className={`${styles.panel} ${styles.episode}`}>
    <Link href={video.href}>
      <EpisodeThumbnail src={video.thumbnail} sizes="(min-width: 64rem) 40vw, 90vw" />
      <div className={styles.episodeCopy}>
        <p className="meta">{videoKindLabels[video.kind]} · {video.duration}</p>
        <h3>{video.title}</h3>
        <span className="meta">Watch now <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  </article>;
}
