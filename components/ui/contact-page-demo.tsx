import { InstagramLogoIcon, PlayIcon } from "@radix-ui/react-icons";
import { BentoCard } from "@/components/ui/bento-grid";
import { ContactPage } from "@/components/ui/contact-page";
import { studio } from "@/content/studio";

export default function ContactPageDemo() {
  return (
    <ContactPage
      intro={(
        <div className="py-10 sm:py-14">
          <h1 className="script-title text-5xl sm:text-6xl">{studio.name}</h1>
        </div>
      )}
      gridClassName="sm:grid-cols-2 lg:grid-cols-2"
    >
      <BentoCard name="Instagram" href={studio.instagram} cta="Message the studio" Icon={InstagramLogoIcon} />
      <BentoCard name="YouTube" href={studio.youtube} cta="Watch studio videos" Icon={PlayIcon} />
    </ContactPage>
  );
}
