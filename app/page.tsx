import Image from "next/image";
import Link from "next/link";
import { HouseOutline } from "../components/house-outline";
import { HeroCarousel } from "../components/hero-carousel";
import { routeMetadata } from "../content/site";
import { featuredVideo, studio } from "../content/studio";
import heroImage from "../public/images/house-installation.webp";

export const metadata = routeMetadata(
  "/",
  "The T-House Studio | Leyton, East London",
  "Enter The T-House, a creative music studio in Leyton, East London. Watch the latest release and get to know the studio.",
);

export default function HomePage() {
  return (
    <>
      <section className="arrival" id="arrival" aria-labelledby="arrival-heading">
        <div className="hero-environment" aria-hidden="true">
          <div className="hero-depth" data-hero-depth>
            <Image src={heroImage} alt="" fill loading="eager" fetchPriority="high" sizes="100vw" placeholder="blur" />
          </div>
        </div>
        <div className="page-grid arrival-grid">
          <div className="arrival-copy">
            <p className="meta location"><span aria-hidden="true" />{studio.location}</p>
            <h1 id="arrival-heading" className="display arrival-title">Enter the<br /> house<span>.</span></h1>
            <p className="intro">A creative music studio in East London.</p>
          </div>
          <div className="arrival-art" data-house-art aria-hidden="true"><HouseOutline motion /></div>
        </div>
        <div className="arrival-carousel"><HeroCarousel /></div>
        <div className="page-grid arrival-foot">
          <a className="meta scroll-link" href="#watch"><span aria-hidden="true">↓</span> Featured video</a>
        </div>
      </section>

      <section id="watch" className="watch section-space" aria-labelledby="watch-heading" tabIndex={-1}>
        <div className="page-grid">
          <div className="section-heading">
            <h2 id="watch-heading" className="display section-title">Watch the latest<span>.</span></h2>
            <Link className="text-action" href="/watch">View all videos <span aria-hidden="true">↗</span></Link>
          </div>
          <article className="feature" data-feature-stage>
            <Link className="feature-link" href={featuredVideo.href} aria-labelledby="video-title watch-action">
              <div className="feature-screen">
                <picture>
                  <source media="(max-width: 40rem)" srcSet={`https://i.ytimg.com/vi/${featuredVideo.id}/mqdefault.jpg 320w, https://i.ytimg.com/vi/${featuredVideo.id}/sddefault.jpg 640w`} sizes="90vw" />
                  <Image src={featuredVideo.thumbnail} alt="" fill unoptimized />
                </picture>
                <div className="feature-play" aria-hidden="true"><span /></div>
                <span className="meta duration">{featuredVideo.duration}</span>
              </div>
              <div className="feature-caption">
                <h3 id="video-title">{featuredVideo.title}</h3>
                <span id="watch-action" className="meta">Watch episode <span aria-hidden="true">↗</span></span>
              </div>
            </Link>
          </article>
        </div>
      </section>

      <section id="inside" className="inside section-space" aria-labelledby="inside-heading">
        <div className="page-grid home-studio">
          <div className="home-studio-copy">
            <h2 id="inside-heading" className="display section-title">Inside<br /> the house<span>.</span></h2>
            <p>The T-House is a creative music studio in Leyton, East London, associated with producer SV on the Beat.</p>
            <Link className="text-action" href="/inside-the-house">Step inside <span aria-hidden="true">↗</span></Link>
          </div>
          <figure className="home-studio-image">
            <div className="studio-frame">
              <div className="studio-art" data-studio-art>
                <Image src="/images/threshold-detail.webp" alt="" fill sizes="(min-width: 82rem) 52rem, (min-width: 48rem) 60vw, 94vw" />
              </div>
            </div>
            <figcaption className="meta">Entrance concept artwork</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
