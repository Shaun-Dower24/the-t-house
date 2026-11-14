import Image from "next/image";
import { HomeScenes } from "../components/home-scenes";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { studio } from "../content/studio";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <HomeScenes>
        <section className="arrival" aria-labelledby="arrival-heading" data-arrival>
          <div className="arrival-background" aria-hidden="true">
            <div className="arrival-art" data-arrival-art>
              <Image src="/images/arrival.webp" alt="" fill preload sizes="100vw" />
            </div>
            <div className="arrival-linework" />
          </div>
          <div className="page-grid arrival-inner flex flex-col justify-end">
            <div className="arrival-copy">
              <p className="eyebrow arrival-location">{studio.location}</p>
              <h1 id="arrival-heading" className="display arrival-title">
                <span>Enter the</span>{" "}
                <span>house<span className="accent">.</span></span>
              </h1>
              <p className="arrival-description">A creative music studio in Leyton, East London.</p>
              <a className="entry-link inline-flex items-center justify-between" href="#inside">
                Step inside <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>
        <section id="inside" className="inside" aria-labelledby="inside-heading">
          <div className="page-grid inside-layout grid items-center">
            <div className="inside-copy">
              <p className="eyebrow">The studio</p>
              <h2 id="inside-heading" className="display inside-title">Inside the house<span className="accent">.</span></h2>
              <p>The T-House is a creative music studio in Leyton, associated with producer SV on the Beat. The studio also makes podcast and video content.</p>
              <a className="inside-link inline-flex items-center" href={studio.youtube}>
                Explore the YouTube channel <span aria-hidden="true">↗</span>
              </a>
            </div>
            <figure>
              <div className="inside-frame">
                <div className="inside-art" data-inside-art>
                  <Image src="/images/threshold-detail.webp" alt="" fill sizes="(min-width: 64rem) 55vw, (min-width: 48rem) 52vw, 100vw" />
                </div>
              </div>
              <figcaption>Entrance concept artwork</figcaption>
            </figure>
          </div>
        </section>
      </HomeScenes>
      <SiteFooter />
    </>
  );
}
