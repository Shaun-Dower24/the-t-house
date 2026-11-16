import type { ReactNode } from "react";
import ImgStack from "../image-stack";

export interface ArtCollageProps {
  primaryImage: string;
  secondaryImage: string;
  primaryAlt?: string;
  secondaryAlt?: string;
  caption?: ReactNode;
  texture?: ReactNode;
  monochrome?: boolean;
  interactive?: boolean;
  className?: string;
}

export function ArtCollage({
  primaryImage,
  secondaryImage,
  primaryAlt = "",
  secondaryAlt = "",
  caption,
  texture,
  monochrome = false,
  interactive = false,
  className,
}: ArtCollageProps) {
  return (
    <ImgStack
      images={[
        { src: primaryImage, alt: primaryAlt, objectPosition: "72% center" },
        { src: secondaryImage, alt: secondaryAlt },
      ]}
      layout="collage"
      backdrop={texture}
      caption={caption}
      monochrome={monochrome}
      interactive={interactive}
      className={className}
    />
  );
}
