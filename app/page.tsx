import Image from "next/image";
import { HomeScenes } from "../components/home-scenes";
import { HouseOutline } from "../components/house-outline";
import { SiteFooter } from "../components/site-footer";
import { featuredVideo, studio } from "../content/studio";

export default function HomePage() {
  return (
    <HomeScenes footer={<SiteFooter />}>
      <section id="arrival" className="arrival" aria-labelledby="arrival-heading" tabIndex={-1}>
        <div className="page-grid arrival-grid">
          <div className="arrival-copy">
            <p className="meta location"><span aria-hidden="true" /> {studio.location}</p>
            <h1 id="arrival-heading" className="display arrival-title">Enter the<br /> house<span>.</span></h1>
            <p className="intro">A creative music studio in East London. Explore the people, conversations and content coming out of The T-House.</p>
            <div className="actions">
              <a className="primary-action" href="#watch">Watch latest <span aria-hidden="true">↘</span></a>
              <a className="text-action" href="#inside">Explore the house <span aria-hidden="true">↘</span></a>
            </div>
          </div>
          <div className="arrival-art" data-house-art aria-hidden="true"><HouseOutline motion /></div>
        </div>
        <div className="page-grid arrival-foot">
          <a className="meta scroll-link" href="#watch"><span aria-hidden="true">↓</span> Scroll to watch</a>
        </div>
      </section>

      <section id="watch" className="watch section-space" aria-labelledby="watch-heading" tabIndex={-1}>
        <div className="page-grid">
          <div className="section-heading">
            <h2 id="watch-heading" className="display section-title">Watch the latest<span>.</span></h2>
            <a className="text-action" href={studio.youtube}>YouTube channel <span aria-hidden="true">↗</span></a>
          </div>
          <article className="feature">
            <a className="feature-link" href={featuredVideo.url} aria-labelledby="video-title watch-action">
              <div className="feature-screen">
                <Image
                  src={`https://i.ytimg.com/vi/${featuredVideo.id}/maxresdefault.jpg`}
                  alt=""
                  fill
                  unoptimized
                />
                <div className="feature-play" aria-hidden="true"><span /></div>
                <span className="meta duration">{featuredVideo.duration}</span>
              </div>
              <div className="feature-caption">
                <h3 id="video-title">{featuredVideo.title}</h3>
                <span id="watch-action" className="meta">Watch on YouTube <span aria-hidden="true">↗</span></span>
              </div>
            </a>
          </article>
        </div>
      </section>

      <section id="inside" className="inside section-space" aria-labelledby="inside-heading" tabIndex={-1}>
        <div className="page-grid">
          <div className="section-heading studio-heading">
            <h2 id="inside-heading" className="display section-title">Inside the house<span>.</span></h2>
            <p>The T-House is a creative music studio in Leyton, associated with producer SV on the Beat.</p>
          </div>
          <figure className="studio-gallery">
            <div className="studio-frame">
              <div className="studio-art" data-studio-art>
                <Image src="/images/threshold-detail.webp" alt="" fill sizes="(min-width: 82rem) 52rem, (min-width: 48rem) 67vw, 94vw" />
              </div>
            </div>
            <div className="studio-drawing" aria-hidden="true"><HouseOutline /></div>
            <figcaption className="meta">Entrance concept artwork</figcaption>
          </figure>
        </div>
      </section>
    </HomeScenes>
  );
}
