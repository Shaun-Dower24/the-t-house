import Link from "next/link";
import { DrawRandomUnderlineLink } from "@/components/ui/draw-random-underline";
import { Faq } from "@/components/ui/faq";
import { FaqLiquidAccordion, type FaqItem } from "@/components/ui/faq-liquid-accordion";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { studio } from "../../content/studio";
import styles from "./connect-faq.module.css";

const questions: FaqItem[] = [
  {
    id: "suggest-a-guest",
    question: "How do I suggest a guest?",
    answerText: "Message The T-House on Instagram with the guest’s name and why you’d like to see them featured.",
    answer: (
      <p>
        <DrawRandomUnderlineLink href={studio.instagram}>Message The T-House on Instagram</DrawRandomUnderlineLink>{" "}
        with the guest’s name and why you’d like to see them featured.
      </p>
    ),
  },
  {
    id: "pitch-a-collaboration",
    question: "How do I pitch a collaboration?",
    answerText: "Send your idea on Instagram. Say who you are and what you’d like to make together.",
    answer: (
      <p>
        <DrawRandomUnderlineLink href={studio.instagram}>Send your idea on Instagram</DrawRandomUnderlineLink>.
        Say who you are and what you’d like to make together.
      </p>
    ),
  },
  {
    id: "watch-the-t-house",
    question: "Where can I watch The T-House?",
    answerText: "Browse the Watch page or visit The T-House on YouTube.",
    answer: (
      <p>
        Browse the <Link href="/watch">Watch page</Link> or visit{" "}
        <DrawRandomUnderlineLink href={studio.youtube}>The T-House on YouTube</DrawRandomUnderlineLink>.
      </p>
    ),
  },
];

export function ConnectFaq() {
  return (
    <Faq
      id="faq"
      className={styles.faq}
      title={(
        <VerticalCutReveal splitBy="characters" inView staggerDuration={0.018} transition={{ duration: 0.42, ease: "easeOut" }}>
          Frequently asked questions
        </VerticalCutReveal>
      )}
      footer={<a href="#message-draft">Draft a message</a>}
    >
      <FaqLiquidAccordion embedded items={questions} idPrefix="connect-faq-" />
    </Faq>
  );
}
