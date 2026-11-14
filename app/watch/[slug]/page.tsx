import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { routeMetadata, siteUrl } from "../../../content/site";
import { formatVideoDate, getEmbedUrl, publishedVideos, studio, videoKindLabels } from "../../../content/studio";
import { VideoCard } from "../video-card";
import { ShareLink } from "./share-link";
import { VideoPlayer } from "./video-player";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedVideos.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = publishedVideos.find((item) => item.slug === slug);
  if (!video) notFound();

  const base = routeMetadata(video.href, video.title, video.description);
  const image = { url: video.thumbnail, width: 1280, height: 720, alt: video.title };

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "video.episode",
      releaseDate: video.publishedAt,
      duration: video.durationSeconds,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: video.title, description: video.description, images: [image] },
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const video = publishedVideos.find((item) => item.slug === slug);
  if (!video) notFound();

  const canonicalUrl = siteUrl ? new URL(video.href, siteUrl).href : undefined;
  const embedUrl = video.embedAllowed ? getEmbedUrl(video.id) : undefined;
  const related = publishedVideos.filter((item) => video.relatedSlugs?.includes(item.slug) && item.slug !== slug);
  const minutes = Math.floor(video.durationSeconds / 60);
  const seconds = video.durationSeconds % 60;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.publishedAt,
    duration: `PT${minutes}M${seconds}S`,
    embedUrl,
    url: canonicalUrl,
    sameAs: video.url,
  };

  return (
    <article className="watch-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }} />
      <div className="page-grid watch-inner">
        <header className="watch-detail-header">
          <Link className="watch-text-link" href="/watch"><span aria-hidden="true">←</span> Back to Watch</Link>
          <p className="watch-meta">
            {videoKindLabels[video.kind]}
            <span aria-hidden="true"> / </span>
            <time dateTime={video.publishedAt}>{formatVideoDate(video.publishedAt)}</time>
            <span aria-hidden="true"> / </span>
            <span aria-hidden="true">{video.duration}</span>
            <span className="sr-only">{minutes} minutes and {seconds} seconds</span>
          </p>
          <h1>{video.title}</h1>
        </header>

        <VideoPlayer title={video.title} duration={video.duration} thumbnail={video.thumbnail} url={video.url} embedUrl={embedUrl} />

        <div className="watch-info">
          <p>{video.description}</p>
          <div className="watch-actions">
            <a className="watch-primary-link" href={video.url}>Watch on YouTube <span aria-hidden="true">↗</span></a>
            <a className="watch-text-link" href={studio.youtube}>Subscribe on YouTube <span aria-hidden="true">↗</span></a>
            <ShareLink canonicalUrl={canonicalUrl} />
          </div>
        </div>
        {related.length > 0 && (
          <section className="watch-related" aria-labelledby="watch-related-heading">
            <h2 id="watch-related-heading">Related videos</h2>
            <div className="watch-shelf">
              {related.map((item) => <VideoCard key={item.slug} video={item} heading="h3" />)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
