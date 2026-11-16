"use client";

import { useState } from "react";
import Contact01 from "@/components/ui/contact-01";

const options = [
  { label: "General enquiry" },
  { label: "Guest suggestion" },
  { label: "Collaboration" },
  { label: "Studio query" },
] as const;

export default function Contact01Demo() {
  const [selectedOption, setSelectedOption] = useState<(typeof options)[number]>(options[0]);

  return (
    <Contact01
      eyebrow="Preview"
      title="Studio enquiry form"
      description="Choose an enquiry type and use sample details to try the form in your browser."
      options={options}
      selectedOption={selectedOption}
      onOptionChange={setSelectedOption}
      labels={{
        submit: "Try submission",
        pending: "Preparing preview…",
        success: "Preview complete. The form has reset.",
      }}
      onSubmit={async () => {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 1200));
      }}
    />
  );
}
