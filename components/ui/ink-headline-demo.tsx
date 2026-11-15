"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import InkHeadline from "@/components/ui/ink-headline";

export default function InkHeadlineDemo() {
  const [take, setTake] = useState(0);

  return (
    <div className="page-grid flex min-h-[80svh] flex-col items-start justify-center gap-8 py-16">
      <InkHeadline key={take} as="h1" className="script-title text-6xl sm:text-8xl">
        {"Written in ink,\nword by word."}
      </InkHeadline>
      <Button type="button" variant="outline" onClick={() => setTake((previous) => previous + 1)}>
        Ink it again
      </Button>
    </div>
  );
}
