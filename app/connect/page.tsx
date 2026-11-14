import { routeMetadata } from "../../content/site";
import { studio } from "../../content/studio";
import styles from "../inside-the-house/studio-pages.module.css";

export const metadata = routeMetadata(
  "/connect",
  "Connect",
  "Get in touch with The T-House Studio on Instagram or follow the studio’s videos on YouTube.",
);

export default function ConnectPage() {
  return (
    <div className={styles.connect}>
      <div className={`page-grid ${styles.connectLayout}`}>
        <header className={styles.intro}>
          <p className={styles.location}>{studio.location}</p>
          <h1 className={styles.title}>Connect<span>.</span></h1>
          <p className={styles.lead}>Have a guest suggestion or an idea for a collaboration? Reach The T-House on Instagram.</p>
        </header>

        <div className={styles.channels}>
          <a className={styles.channel} href={studio.instagram}>
            <span className={styles.channelLabel}>
              <span className={styles.channelName}>Message on Instagram</span>
              <span className={styles.channelHandle}>@thethousestudio</span>
            </span>
            <span aria-hidden="true" className={styles.channelArrow}>↗</span>
          </a>
          <a className={styles.channel} href={studio.youtube}>
            <span className={styles.channelLabel}>
              <span className={styles.channelName}>Follow on YouTube</span>
              <span className={styles.channelHandle}>@thethousestudio</span>
            </span>
            <span aria-hidden="true" className={styles.channelArrow}>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
