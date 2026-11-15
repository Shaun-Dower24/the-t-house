import Link from "next/link";
import HoverExpandGallery from "@/components/ui/hover-expand-gallery";
import { HouseOutline } from "../../components/house-outline";
import { routeMetadata } from "../../content/site";
import styles from "./studio-pages.module.css";

export const metadata = routeMetadata(
  "/inside-the-house",
  "Inside the House",
  "Explore The T-House, a creative music studio in Leyton, East London, and discover the videos coming out of the studio.",
);

export default function InsideTheHousePage() {
  return (
    <div className={styles.inside}>
      <div className={`page-grid ${styles.split}`}>
        <header className={styles.intro}>
          <h1 className={styles.title}>Inside the House</h1>
          <p className={styles.lead}>Warm lighting, wood panelling and an illuminated house sign give this Leyton music studio its character.</p>
          <Link className={styles.action} href="/watch">Explore the videos <span aria-hidden="true">→</span></Link>
        </header>

        <figure className={styles.gallery}>
          <div className={styles.elevation} aria-hidden="true"><HouseOutline /></div>
          <HoverExpandGallery
            className={styles.exhibit}
            height="clamp(19rem, 61cqw, 29rem)"
            railWidth={56}
            maxOpenWidth={560}
            mobileImageHeight={340}
            duration={440}
          />
          <figcaption className={styles.caption}>Studio concept artwork</figcaption>
        </figure>
      </div>

      <nav className={`page-grid ${styles.continue}`} aria-label="Explore the studio">
        <Link href="/about" className={styles.textLink}>About The T-House <span aria-hidden="true">→</span></Link>
        <Link href="/connect" className={styles.textLink}>Get in touch <span aria-hidden="true">→</span></Link>
      </nav>
    </div>
  );
}
