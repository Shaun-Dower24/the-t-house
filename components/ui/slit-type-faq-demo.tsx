import SlitTypeFaq from "@/components/ui/slit-type-faq";
import { featuredVideo, studio } from "@/content/studio";

const items = [
  {
    id: "guest-suggestions",
    category: "Studio",
    question: "How can I suggest a guest?",
    answer: "Send the guest’s name and what you’d like to hear them discuss to The T-House on Instagram.",
  },
  {
    id: "studio-artwork",
    category: "Studio",
    question: "Where can I see the studio artwork?",
    answer: "The Inside the House page includes the house elevation and studio concept artwork.",
  },
  {
    id: "watch-episodes",
    category: "Episodes",
    question: "Where can I watch The T-House?",
    answer: "Browse the Watch page or visit The T-House Studio on YouTube.",
  },
  {
    id: "featured-episode",
    category: "Episodes",
    question: "Who appears in the first Fifa In The T episode?",
    answer: featuredVideo.description,
  },
] as const;

export default function SlitTypeFaqDemo() {
  return (
    <SlitTypeFaq
      headline="Studio FAQ"
      items={items}
      idPrefix="demo-faq-"
      defaultOpen="guest-suggestions"
      categories={["Studio", "Episodes"]}
      search
      copyLinks
      contact={{ prompt: "Have another question?", label: "Message the studio", href: studio.instagram }}
    />
  );
}
