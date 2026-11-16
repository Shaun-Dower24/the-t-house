import Link from "next/link";
import InteractiveImageAccordion from "@/components/ui/interactive-image-accordion";
import { ScrollExpansionHero } from "../components/ui/scroll-expansion-hero";
import { GlassPanel } from "../components/glass/glass-panel";
import { GlassCTA } from "../components/glass/glass-cta";
import { GlassEpisodeCard } from "../components/glass/glass-episode-card";
import { EpisodeThumbnail } from "../components/glass/episode-thumbnail";
import { GlassReveals } from "../components/glass/glass-reveals";
import { routeMetadata } from "../content/site";
import { featuredVideo, formatVideoDate, publishedVideos, studio } from "../content/studio";
import styles from "./home-glass.module.css";

export const metadata = routeMetadata(
  "/",
  "The T-House Studio | Leyton, East London",
  "Enter The T-House, a creative music studio in Leyton, East London. Watch the latest release and get to know the studio.",
);

export default function HomePage() {
  return (
    <>
      <ScrollExpansionHero />

      <GlassReveals>
        <section className={`page-grid ${styles.actions}`} aria-labelledby="home-actions-heading" data-glass-section>
          <GlassPanel className={styles.actionStrip}>
            <h2 id="home-actions-heading" className="meta">Come on in</h2>
            <nav aria-label="Explore The T-House" className={styles.links}>
              <Link className="text-action" href={featuredVideo.href}>Watch the podcast <span aria-hidden="true">↗</span></Link>
              <Link className="text-action" href="/inside-the-house">Explore the studio <span aria-hidden="true">↗</span></Link>
            </nav>
          </GlassPanel>
        </section>

        <section id="watch" className={`page-grid ${styles.section}`} aria-labelledby="watch-heading" tabIndex={-1} data-glass-section>
          <header className={styles.heading}><p className="meta">The latest from The T-House</p><h2 id="watch-heading" className="script-title section-title">Featured episode</h2></header>
          <article className={styles.featured}>
            <Link href={featuredVideo.href} aria-label={`Watch ${featuredVideo.title}`} className={styles.featuredImage}>
              <EpisodeThumbnail src={featuredVideo.thumbnail} sizes="(min-width: 64rem) 60vw, 90vw" />
              <span className={styles.play} aria-hidden="true">▶</span>
            </Link>
            <GlassPanel className={styles.featuredInfo}>
              <p className="meta">Fifa In The T · Episode 1</p>
              <h3>{featuredVideo.title}</h3>
              <p>{featuredVideo.description}</p>
              <dl className={styles.facts}>
                <div><dt>Guest</dt><dd>Kojo Funds</dd></div>
                <div><dt>Duration</dt><dd>{featuredVideo.duration}</dd></div>
                <div><dt>Published</dt><dd><time dateTime={featuredVideo.publishedAt}>{formatVideoDate(featuredVideo.publishedAt.slice(0, 10))}</time></dd></div>
              </dl>
              <div className={styles.links}><Link className="text-action" href={featuredVideo.href}>Watch episode <span aria-hidden="true">↗</span></Link><a className="text-action" href={featuredVideo.url}>Watch on YouTube <span aria-hidden="true">↗</span></a></div>
            </GlassPanel>
          </article>
        </section>

        <section className={`page-grid ${styles.section}`} aria-labelledby="episodes-heading" data-glass-section>
          <header className={styles.heading}><p className="meta">From the channel</p><h2 id="episodes-heading" className="script-title section-title">Discover the episodes</h2></header>
          <div className={styles.episodeGrid}>
            {publishedVideos.map(video => <GlassEpisodeCard key={video.slug} video={video} />)}
            <GlassPanel className={styles.subscribe}><p className="meta">Stay connected</p><h3>Subscribe on YouTube</h3><p>Follow The T-House on the official channel.</p><a className="text-action" href={`${studio.youtube}?sub_confirmation=1`}>Subscribe on YouTube <span aria-hidden="true">↗</span></a></GlassPanel>
          </div>
        </section>

        <section id="inside" className={`page-grid ${styles.section}`} aria-labelledby="inside-heading" data-glass-section>
          <header className={styles.heading}><p className="meta">Leyton, East London</p><h2 id="inside-heading" className="script-title section-title">Inside The T-House</h2></header>
          <figure><InteractiveImageAccordion /><figcaption><GlassPanel className={styles.caption}>
            <div><p className="meta">Studio concept artwork</p><p>A visual concept for The T-House. These illustrations are not studio photographs.</p></div>
            <Link className="text-action" href="/inside-the-house">Explore the studio <span aria-hidden="true">↗</span></Link>
          </GlassPanel></figcaption></figure>
        </section>

        <section className={`page-grid ${styles.section}`} aria-labelledby="brand-heading" data-glass-section>
          <GlassPanel className={styles.about}>
            <div><p className="meta">Music · conversation · video</p><h2 id="brand-heading" className="script-title section-title">About the brand</h2></div>
            <div><p className={styles.lead}>The T-House is a creative music studio in {studio.location}, associated with producer SV on the Beat.</p><div className={styles.links}><a className="text-action" href={studio.youtube}>YouTube <span aria-hidden="true">↗</span></a><a className="text-action" href={studio.instagram}>Instagram <span aria-hidden="true">↗</span></a></div></div>
          </GlassPanel>
        </section>

        <section className={`page-grid ${styles.section} ${styles.enquiry}`} aria-labelledby="enquiry-heading" data-glass-section>
          <header className={styles.heading}><p className="meta">Connect with the studio</p><h2 id="enquiry-heading" className="script-title section-title">Studio enquiries</h2></header>
          <GlassCTA href="/connect"><span>Get in touch with The T-House<span className={styles.ctaDetail}>Find our official channels</span></span></GlassCTA>
        </section>
      </GlassReveals>
    </>
  );
}
