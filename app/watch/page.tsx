import { routeMetadata } from "../../content/site";
import { featuredVideo, publishedVideos, studio } from "../../content/studio";
import { VideoCard } from "./video-card";

const description = "Watch videos from The T-House, a creative music studio in Leyton, East London.";
const pageMetadata = routeMetadata("/watch", "Watch", description);

export const metadata = {
  ...pageMetadata,
  openGraph: {
    ...pageMetadata.openGraph,
    images: [{ url: featuredVideo.thumbnail, width: 1280, height: 720, alt: featuredVideo.title }],
  },
};

export default function WatchPage() {
  return (
    <div className="watch-page">
      <div className="page-grid watch-inner">
        <header className="watch-index-header">
          <div>
            <h1>Watch<span>.</span></h1>
            <p>Videos from The T-House in Leyton, East London.</p>
          </div>
          <a className="watch-text-link" href={studio.youtube}>
            YouTube channel <span aria-hidden="true">↗</span>
          </a>
        </header>
        {publishedVideos.length ? (
          <div className="watch-shelf">
            {publishedVideos.map((video, index) => <VideoCard key={video.slug} video={video} eager={index === 0} />)}
          </div>
        ) : (
          <p className="watch-empty">Find the latest videos on our YouTube channel.</p>
        )}
      </div>
    </div>
  );
}
