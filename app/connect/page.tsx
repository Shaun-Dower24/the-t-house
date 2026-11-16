import Image from "next/image";
import { AnimatedLink } from "@/components/ui/animated-link";
import { BentoCard } from "@/components/ui/bento-grid";
import { BorderBeam } from "@/components/ui/border-beam";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { ContactPage } from "@/components/ui/contact-page";
import { Hero04 } from "@/components/ui/hero-04";
import { MagneticButton } from "@/components/ui/magnetic-button";
import OldTelevisionShader from "@/components/ui/old-television-shader";
import { ShaderBackground } from "@/components/ui/paper-texture";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { Waveform } from "@/components/ui/waveform";
import { GraffitiArrow, GraffitiSpray } from "../../components/ui/graffiti-arrow";
import { routeMetadata } from "../../content/site";
import { featuredVideo, studio } from "../../content/studio";
import { ConnectFaq } from "./connect-faq";
import { CopyStudioHandle, EnquiryDraft } from "./enquiry-draft";
import styles from "./connect.module.css";

// A graphic motif for the frame, independent of the episode soundtrack.
const episodeWave = [0.16, 0.25, 0.45, 0.83, 0.52, 0.27, 0.39, 0.67, 1, 0.53, 0.31, 0.42, 0.75, 0.86, 0.5, 0.24, 0.37, 0.59, 0.26, 0.12];

export const metadata = routeMetadata(
  "/connect",
  "Connect",
  "Suggest a guest, pitch a collaboration or contact The T-House Studio on Instagram. Find the studio’s videos on YouTube.",
);

type SocialPlatform = "instagram" | "youtube";

function ChannelLink({ platform, label }: { platform: SocialPlatform; label: string }) {
  const isInstagram = platform === "instagram";
  const link = (
    <AnimatedLink
      className={styles.channel}
      data-platform={platform}
      href={studio[platform]}
      aria-label={label}
      title={label}
      variant="center"
      showArrow={false}
      underline={<GraffitiSpray className={styles.channelSpray} stretch />}
    >
      <span className={styles.channelLogo}>
        {isInstagram ? (
          <>
            <Image className={styles.instagramGlyph} src="/images/instagram-gradient.webp" width={160} height={160} alt="" unoptimized />
            <Image className={styles.instagramWordmark} src="/images/instagram-wordmark.svg" width={600} height={150} alt="" unoptimized />
          </>
        ) : (
          <Image className={styles.youtubeWordmark} src="/images/youtube-logo.png" width={600} height={134} alt="" unoptimized />
        )}
      </span>
    </AnimatedLink>
  );

  return isInstagram ? (
    <MagneticButton asChild strength={0.045}>{link}</MagneticButton>
  ) : (
    <BorderBeam color="var(--signature-red)" revealOn={["hover", "press"]} className={styles.channelBeam}>
      {link}
    </BorderBeam>
  );
}

const contactSectionId = "connect-grid";

function ConnectIntro() {
  return (
    <OldTelevisionShader>
      <Hero04
        title="Connect"
        inkTitle
        description="Have a guest suggestion, a collaboration idea or a studio question? Get in touch on Instagram."
        primaryImage="/images/house-installation.webp"
        secondaryImage="/images/threshold-detail.webp"
        primaryAlt="An illuminated house outline standing on a dark floor"
        secondaryAlt="A doorway framed by a row of illuminated rooflines"
        caption="T-House concept artwork"
        texture={<ShaderBackground />}
        animation="subtle"
        monochrome
        interactive
        classNames={{
          grid: styles.hero,
          intro: styles.intro,
          title: `script-title ${styles.title}`,
          description: styles.lead,
        }}
        actions={(
          <>
            <a className={styles.gridJump} href={`#${contactSectionId}`}>
              Find us online
              <span aria-hidden="true"><GraffitiArrow direction="right" showSpray={false} /></span>
            </a>
            <CopyStudioHandle handle="@thethousestudio" />
          </>
        )}
      />
    </OldTelevisionShader>
  );
}

export default function ConnectPage() {
  return (
    <ContactPage
      className={styles.connect}
      sectionId={contactSectionId}
      intro={<ConnectIntro />}
      heading={(
        <VerticalCutReveal inView staggerDuration={0.055} transition={{ duration: 0.42, ease: "easeOut" }}>
          Watch and get in touch
        </VerticalCutReveal>
      )}
      gridClassName={styles.contactDetails}
      footer={<ConnectFaq />}
    >
      <CardSpotlight
        className={styles.episodeSpotlight}
        color="color-mix(in srgb, var(--signature-red) 22%, transparent)"
        colors={[[200, 56, 56]]}
      >
        <BentoCard
          name={featuredVideo.title}
          href={featuredVideo.href}
          cta="Watch episode"
          className={styles.episode}
          arrow={<GraffitiArrow direction="right" />}
          background={(
            <div className={styles.poster}>
              <Image
                src={featuredVideo.thumbnail}
                alt=""
                fill
                sizes="(min-width: 90rem) 51rem, (min-width: 36rem) 56vw, 90vw"
              />
              <div className={styles.posterWave} aria-hidden="true">
                <Waveform peaks={episodeWave} active={false} />
              </div>
              <span className={styles.play} aria-hidden="true" />
              <span className={styles.duration}>{featuredVideo.duration}</span>
            </div>
          )}
        />
      </CardSpotlight>
      <ChannelLink platform="instagram" label="Message on Instagram" />
      <ChannelLink platform="youtube" label="Follow on YouTube" />
      <EnquiryDraft instagramUrl={studio.instagram} />
    </ContactPage>
  );
}
