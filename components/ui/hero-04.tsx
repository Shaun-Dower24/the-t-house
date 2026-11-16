import Image from "next/image";
import type { ReactNode } from "react";
import Balancer from "react-wrap-balancer";
import { cn } from "@/lib/utils";
import { ArtCollage, type ArtCollageProps } from "./hero-04-utils/art-collage";
import { Cta, type CtaProps } from "./hero-04-utils/cta";
import InkHeadline from "./ink-headline";
import styles from "./hero-04.module.css";

type HeroClassNames = Partial<Record<"grid" | "intro" | "title" | "description", string>>;

export interface Hero04Props extends Omit<ArtCollageProps, "className"> {
  title: string;
  titleLine2?: string;
  inkTitle?: boolean;
  description: string;
  washImage?: string;
  animation?: "none" | "subtle";
  primaryCTA?: CtaProps;
  secondaryCTA?: CtaProps;
  variant?: "standard" | "compact";
  actions?: ReactNode;
  classNames?: HeroClassNames;
}

const variantStyles = {
  standard: {
    grid: "gap-12 py-20 sm:py-28 lg:gap-16",
    intro: "gap-5",
    title: "text-3xl sm:text-4xl md:text-5xl",
    description: "max-w-md text-sm sm:text-base",
  },
  compact: {
    grid: "gap-10 py-14 sm:py-20 lg:gap-12",
    intro: "gap-4",
    title: "text-2xl sm:text-3xl md:text-4xl",
    description: "max-w-sm text-sm",
  },
} as const;

export function Hero04({
  title,
  titleLine2,
  inkTitle = false,
  description,
  washImage,
  animation = "none",
  primaryCTA,
  secondaryCTA,
  variant = "standard",
  actions,
  classNames = {},
  ...collage
}: Hero04Props) {
  const variantStyle = variantStyles[variant];
  const gridClassName = classNames.grid ?? cn(
    "mx-auto grid max-w-6xl grid-cols-1 items-center px-6 lg:grid-cols-2",
    variantStyle.grid,
  );
  const titleClassName = classNames.title ?? cn(
    "text-balance font-serif font-normal tracking-tight text-foreground",
    variantStyle.title,
  );
  const showPrimary = primaryCTA && primaryCTA.ctaEnabled !== false && primaryCTA.link.trim() !== "";
  const showSecondary = secondaryCTA && secondaryCTA.ctaEnabled !== false && secondaryCTA.link.trim() !== "";

  return (
    <header className={styles.root} data-slot="hero-04" data-animation={animation}>
      {washImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-clip mask-radial-[75%_100%] mask-radial-from-45% mask-radial-to-75% mask-radial-at-top opacity-75 blur-xl dark:opacity-5"
        >
          <Image
            src={washImage}
            alt=""
            fill
            sizes="100vw"
            unoptimized={/^(?:https?:)?\/\//i.test(washImage)}
            className="object-cover object-top"
          />
        </div>
      )}

      <div className={gridClassName}>
        <div className={cn(styles.intro, classNames.intro ?? cn("flex flex-col items-start", variantStyle.intro))}>
          {inkTitle ? (
            <InkHeadline as="h1" className={titleClassName} duration={1450}>
              {[title, titleLine2].filter(Boolean).join("\n")}
            </InkHeadline>
          ) : (
            <h1 className={titleClassName}>
              <Balancer>{title}</Balancer>
              {titleLine2 && <><br /><Balancer>{titleLine2}</Balancer></>}
            </h1>
          )}
          <p className={classNames.description ?? cn("text-muted-foreground", variantStyle.description)}>
            <Balancer>{description}</Balancer>
          </p>
          {actions ?? ((showPrimary || showSecondary) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-3">
              {showPrimary && <Cta cta={primaryCTA} />}
              {showSecondary && <Cta cta={{ ...secondaryCTA, variant: secondaryCTA.variant ?? "link" }} />}
            </div>
          ))}
        </div>

        <ArtCollage {...collage} className={styles.art} />
      </div>
    </header>
  );
}

export default Hero04;
