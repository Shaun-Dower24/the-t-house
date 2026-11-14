import Image from "next/image";
import Link from "next/link";
import { formatVideoDate, publishedVideos, videoKindLabels } from "../../content/studio";

type Video = (typeof publishedVideos)[number];

export function VideoCard({ video, heading = "h2", eager = false }: {
  video: Video;
  heading?: "h2" | "h3";
  eager?: boolean;
}) {
  const Heading = heading;

  return (
    <article className="watch-card">
      <Link className="watch-card-link" href={video.href} aria-labelledby={`video-${video.slug}`}>
        <div className="watch-poster">
          <Image
            src={video.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1200px) 720px, (min-width: 900px) 62vw, 92vw"
            unoptimized
            loading={eager ? "eager" : "lazy"}
          />
          <span className="watch-play-mark" aria-hidden="true" />
          <span className="watch-duration">{video.duration}</span>
        </div>
        <div className="watch-card-caption">
          <div>
            <p className="watch-meta">
              {videoKindLabels[video.kind]}
              <span aria-hidden="true"> / </span>
              <time dateTime={video.publishedAt}>{formatVideoDate(video.publishedAt)}</time>
            </p>
            <Heading id={`video-${video.slug}`}>{video.title}</Heading>
          </div>
          <span className="watch-card-arrow" aria-hidden="true">↗</span>
        </div>
      </Link>
    </article>
  );
}
