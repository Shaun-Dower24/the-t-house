import Image from "next/image";
import { HomeScenes } from "../components/home-scenes";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { TileWall } from "../components/tile-wall";
import { studio } from "../content/studio";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <HomeScenes>
        <section id="arrival" className="arrival" aria-labelledby="arrival-heading" data-arrival>
          <fieldset className="lighting-control">
            <legend className="sr-only">Scene lighting</legend>
            <label><input type="radio" name="lighting" value="warm" defaultChecked /><span>Warm<span className="sr-only"> lighting</span></span></label>
            <label><input type="radio" name="lighting" value="cool" /><span>Cool<span className="sr-only"> lighting</span></span></label>
          </fieldset>
          <div className="arrival-background" aria-hidden="true">
            <div className="arrival-art" data-arrival-art>
              <Image src="/images/tile-room.webp" alt="" fill preload sizes="100vw" />
            </div>
            <div className="room-floor" />
          </div>
          <div className="arrival-inner">
            <h1 id="arrival-heading" className="arrival-title">Enter the house<span>.</span></h1>
            <TileWall />
            <p className="arrival-location">{studio.location}</p>
            <a className="entry-link" href="#inside">Step inside <span aria-hidden="true">↓</span></a>
          </div>
        </section>
        <section id="inside" className="inside" aria-labelledby="inside-heading">
          <div className="inside-layout">
            <h2 id="inside-heading" className="display inside-title">Inside the house.</h2>
            <figure className="inside-window">
              <div className="inside-frame">
                <div className="inside-art" data-inside-art>
                  <Image src="/images/threshold-detail.webp" alt="" fill sizes="(min-width: 48rem) 60vw, 90vw" />
                </div>
              </div>
              <figcaption>Entrance concept artwork</figcaption>
            </figure>
            <div className="inside-copy">
              <p>The T-House is a creative music studio in Leyton, associated with producer SV on the Beat. The studio also makes podcast and video content.</p>
              <a className="inside-link" href={studio.youtube}>Explore the YouTube channel <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
      </HomeScenes>
      <SiteFooter />
    </>
  );
}
