import Link from "next/link";
import { routeMetadata } from "../../content/site";
import { featuredVideo } from "../../content/studio";
import styles from "../inside-the-house/studio-pages.module.css";

export const metadata = routeMetadata(
  "/about",
  "About",
  "Learn about The T-House, a creative music studio in Leyton, East London, and its connection to producer SV on the Beat.",
);

export default function AboutPage() {
  return (
    <div className={styles.about}>
      <div className={`page-grid ${styles.aboutLayout}`}>
        <header className={styles.intro}>
          <h1 className={styles.title}>About The T-House</h1>
          <p className={styles.lead}>The T-House is a creative music studio in East London sharing music, conversation and video.</p>
          <Link href="/inside-the-house" className={styles.textLink}>Inside the House <span aria-hidden="true">→</span></Link>
        </header>

        <section className={styles.profile} aria-labelledby="sv-on-the-beat">
          <h2 id="sv-on-the-beat">SV on the Beat</h2>
          <p>Producer SV on the Beat is associated with The T-House. Watch him face Kojo Funds in the first episode of Fifa In The T.</p>
          <Link href={featuredVideo.href} className={styles.textLink}>Watch Fifa In The T <span aria-hidden="true">→</span></Link>
        </section>
      </div>

      <nav className={`page-grid ${styles.continue}`} aria-label="More from The T-House">
        <Link href="/watch" className={styles.textLink}>Watch the latest <span aria-hidden="true">→</span></Link>
        <Link href="/connect" className={styles.textLink}>Get in touch <span aria-hidden="true">→</span></Link>
      </nav>
    </div>
  );
}
