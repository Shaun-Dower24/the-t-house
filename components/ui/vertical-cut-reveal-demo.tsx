import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";

const spring = { type: "spring", stiffness: 200, damping: 21 } as const;

export default function VerticalCutRevealDemo() {
  return (
    <div className="flex min-h-[25rem] w-full flex-col items-start justify-center bg-[var(--canvas)] px-6 py-12 text-2xl font-bold uppercase tracking-wide text-[var(--sign-white)] sm:px-10 sm:text-4xl md:px-16 md:text-5xl">
      <VerticalCutReveal
        splitBy="characters"
        staggerDuration={0.025}
        staggerFrom="first"
        transition={spring}
        containerClassName="text-[var(--signature-red)]"
      >
        HI 👋, FRIEND!
      </VerticalCutReveal>
      <VerticalCutReveal
        splitBy="characters"
        staggerDuration={0.025}
        staggerFrom="last"
        reverse
        transition={{ ...spring, delay: 0.5 }}
      >
        🌤️ IT IS NICE ⇗ TO
      </VerticalCutReveal>
      <VerticalCutReveal
        splitBy="characters"
        staggerDuration={0.025}
        staggerFrom="center"
        transition={{ ...spring, delay: 1.1 }}
      >
        MEET 😊 YOU.
      </VerticalCutReveal>
    </div>
  );
}
