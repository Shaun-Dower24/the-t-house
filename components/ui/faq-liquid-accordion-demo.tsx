import Link from "next/link";
import { FaqLiquidAccordion } from "@/components/ui/faq-liquid-accordion";
import { featuredVideo, studio } from "@/content/studio";

const questions = [
  {
    id: "watch",
    question: "Where can I watch the episodes?",
    answer: (
      <p>
        Browse the <Link href="/watch" className="underline underline-offset-4">Watch page</Link> or visit{" "}
        <a href={studio.youtube} className="underline underline-offset-4">The T-House on YouTube</a>.
      </p>
    ),
  },
  {
    id: "guest",
    question: "How can I suggest a guest?",
    answer: (
      <p>
        <a href={studio.instagram} className="underline underline-offset-4">Message The T-House on Instagram</a>{" "}
        with their name and what you’d like to hear them discuss.
      </p>
    ),
  },
  {
    id: "featured-episode",
    question: "Who appears in the first Fifa In The T episode?",
    answer: featuredVideo.description,
  },
  {
    id: "artwork",
    question: "Where can I see the studio artwork?",
    answer: (
      <p>
        <Link href="/inside-the-house" className="underline underline-offset-4">Inside the House</Link>{" "}
        includes the house elevation and studio concept artwork.
      </p>
    ),
  },
] as const;

export default function FaqLiquidAccordionDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <FaqLiquidAccordion
        items={questions}
        title="Studio questions"
        subtitle="Search for a question about the studio or its episodes."
        defaultOpenId="watch"
      />
    </div>
  );
}
