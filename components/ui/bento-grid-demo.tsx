import Image from "next/image";
import { ChatBubbleIcon, CubeIcon, HomeIcon, PersonIcon, PlayIcon } from "@radix-ui/react-icons";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const destinations = [
  {
    Icon: PlayIcon,
    name: "Watch",
    description: "Browse videos from The T-House.",
    href: "/watch",
    cta: "Browse videos",
    className: "lg:col-start-1 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: CubeIcon,
    name: "Inside the House",
    description: "Explore the studio and its illuminated house concept.",
    href: "/inside-the-house",
    cta: "Explore the studio",
    background: (
      <Image
        src="/images/house-installation.webp"
        alt=""
        fill
        sizes="(min-width: 64rem) 33vw, 100vw"
        className="object-cover opacity-20 grayscale"
      />
    ),
    className: "lg:col-start-2 lg:row-start-1 lg:row-end-4",
  },
  {
    Icon: PersonIcon,
    name: "About",
    description: "Meet The T-House and learn about SV on the Beat.",
    href: "/about",
    cta: "About the studio",
    className: "lg:col-start-3 lg:row-start-1",
  },
  {
    Icon: ChatBubbleIcon,
    name: "Connect",
    description: "Suggest a guest, pitch a collaboration or ask a studio question.",
    href: "/connect",
    cta: "Get in touch",
    className: "lg:col-start-3 lg:row-start-2 lg:row-end-4",
  },
  {
    Icon: HomeIcon,
    name: "Home",
    href: "/",
    cta: "Back to the homepage",
    className: "lg:col-start-1 lg:row-start-3",
  },
];

export function BentoDemo() {
  return (
    <BentoGrid className="lg:grid-rows-3">
      {destinations.map((destination) => (
        <BentoCard key={destination.href} {...destination} />
      ))}
    </BentoGrid>
  );
}

export default BentoDemo;
