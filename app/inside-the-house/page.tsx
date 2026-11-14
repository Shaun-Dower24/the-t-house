import Image from "next/image";
import Link from "next/link";
import { routeMetadata } from "../../content/site";
import { studio } from "../../content/studio";
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
          <p className={styles.location}>{studio.location}</p>
          <h1 className={styles.title}>Inside the House<span>.</span></h1>
          <p className={styles.lead}>Warm lighting, wood panelling and an illuminated house sign give this Leyton music studio its character.</p>
          <Link className={styles.action} href="/watch">Explore the videos <span aria-hidden="true">→</span></Link>
        </header>

        <figure className={styles.gallery}>
          <div className={styles.frame}>
            <Image
              src="/images/threshold-detail.webp"
              alt="An imagined entrance framed by repeated amber roof outlines"
              width={910}
              height={786}
              sizes="(max-width: 47.99rem) 94vw, (max-width: 85rem) 48vw, 42rem"
              preload
            />
          </div>
          <figcaption className={styles.caption}>Entrance concept artwork</figcaption>
        </figure>
      </div>

      <nav className={`page-grid ${styles.continue}`} aria-label="Explore the studio">
        <Link href="/about" className={styles.textLink}>About The T-House <span aria-hidden="true">→</span></Link>
        <Link href="/connect" className={styles.textLink}>Get in touch <span aria-hidden="true">→</span></Link>
      </nav>
    </div>
  );
}
