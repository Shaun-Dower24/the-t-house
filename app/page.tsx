import Image from "next/image";
import Link from "next/link";
import InteractiveImageAccordion from "@/components/ui/interactive-image-accordion";
import { GraffitiArrow } from "@/components/ui/graffiti-arrow";
import { ScrollExpansionHero } from "../components/ui/scroll-expansion-hero";
import { routeMetadata } from "../content/site";
import { featuredVideo, studio } from "../content/studio";

export const metadata = routeMetadata(
  "/",
  "The T-House Studio | Leyton, East London",
  "Enter The T-House, a creative music studio in Leyton, East London. Watch the latest release and get to know the studio.",
);

export default function HomePage() {
  return (
    <>
      <ScrollExpansionHero />

      <section id="watch" className="watch home-watch section-space" aria-labelledby="watch-heading" tabIndex={-1}>
        <div className="page-grid">
          <div className="section-heading">
            <h2 id="watch-heading" className="tag-title section-title">Watch the latest</h2>
            <Link className="text-action marker-link" href="/watch">View all videos <GraffitiArrow direction="right" showSpray={false} /></Link>
          </div>
          <article className="feature" data-feature-stage>
            <Link className="feature-link marker-frame" href={featuredVideo.href} aria-labelledby="video-title watch-action">
              <div className="feature-screen">
                <picture>
                  <source media="(max-width: 40rem)" srcSet={`https://i.ytimg.com/vi/${featuredVideo.id}/mqdefault.jpg 320w, https://i.ytimg.com/vi/${featuredVideo.id}/sddefault.jpg 640w`} sizes="90vw" />
                  <Image src={featuredVideo.thumbnail} alt="" fill unoptimized />
                </picture>
                <div className="feature-play" aria-hidden="true"><span /></div>
                <span className="meta duration sticker">{featuredVideo.duration}</span>
              </div>
              <div className="feature-caption">
                <h3 id="video-title">{featuredVideo.title}</h3>
                <span id="watch-action" className="meta marker-link">Watch episode <GraffitiArrow direction="right" showSpray={false} /></span>
              </div>
            </Link>
          </article>
        </div>
      </section>

      <section id="inside" className="inside home-inside section-space" aria-labelledby="inside-heading">
        <div className="page-grid home-studio">
          <div className="home-studio-copy">
            <h2 id="inside-heading" className="tag-title section-title">Inside the house</h2>
            <p>The T-House is a creative music studio in {studio.location}, associated with producer SV on the Beat.</p>
            <Link className="text-action marker-link" href="/inside-the-house">Step inside <GraffitiArrow direction="right" showSpray={false} /></Link>
          </div>
          <figure className="home-studio-image">
            <InteractiveImageAccordion />
            <figcaption className="meta">Studio concept artwork</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
