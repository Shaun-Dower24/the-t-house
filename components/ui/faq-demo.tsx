import Link from "next/link";
import Faq from "@/components/ui/faq";
import { featuredVideo, studio } from "@/content/studio";

const questions = [
  {
    id: "guest",
    question: "How do I suggest a guest?",
    answer: (
      <p>
        <a href={studio.instagram} className="underline underline-offset-4">Message The T-House on Instagram</a>{" "}
        with their name and what you’d like to hear them discuss.
      </p>
    ),
  },
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
    id: "featured-episode",
    question: "Who appears in the first Fifa In The T episode?",
    answer: featuredVideo.description,
  },
] as const;

export default function FaqDemo() {
  return (
    <Faq
      eyebrow="The T-House"
      title="Studio questions"
      description="Find episodes and ways to contact the studio."
      items={questions}
      layout="split"
      defaultValue="watch"
      footer={(
        <Link href="/connect#message-draft" className="underline underline-offset-4">Draft a message to the studio</Link>
      )}
    />
  );
}
