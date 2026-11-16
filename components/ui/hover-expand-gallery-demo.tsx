import HoverExpandGallery, { type HoverExpandItem } from "@/components/ui/hover-expand-gallery";

const studioArtwork: HoverExpandItem[] = [
  {
    title: "House installation",
    meta: "Concept artwork",
    src: "/images/house-installation.webp",
    alt: "An illuminated house outline standing on a dark floor",
  },
  {
    title: "Illuminated threshold",
    meta: "Concept artwork",
    src: "/images/threshold-detail.webp",
    alt: "A doorway framed by a row of illuminated rooflines",
  },
];

const settings = {
  railWidth: 64,
  maxOpenWidth: 520,
  duration: 620,
};

export default function HoverExpandGalleryDemo(props: Partial<typeof settings>) {
  return <HoverExpandGallery items={studioArtwork} {...settings} {...props} />;
}
