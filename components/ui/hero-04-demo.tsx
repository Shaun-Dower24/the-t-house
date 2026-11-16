import { Hero04, type Hero04Props } from "@/components/ui/hero-04";

const values = {
  title: "The T-House",
  titleLine2: "Studio artwork",
  description: "Explore the studio and watch the latest episode.",
  washImage: "/images/house-installation.webp",
  primaryImage: "/images/house-installation.webp",
  secondaryImage: "/images/threshold-detail.webp",
  primaryAlt: "An illuminated house outline standing on a dark floor",
  secondaryAlt: "A doorway framed by a row of illuminated rooflines",
  animation: "subtle",
  primaryCTA: { text: "Inside the House", link: "/inside-the-house" },
  secondaryCTA: { text: "Watch an episode", link: "/watch" },
} satisfies Hero04Props;

export default function Hero04Demo() {
  return <Hero04 {...values} />;
}
