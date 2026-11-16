"use client";

import { useState } from "react";
import Choicebox from "@/components/ui/choicebox";

const enquiryOptions = [
  { id: "general", title: "General enquiry" },
  { id: "guest", title: "Guest suggestion" },
  { id: "collaboration", title: "Collaboration" },
  { id: "studio", title: "Studio query" },
];

const videoOptions = [
  { id: "episodes", title: "Episodes", description: "Full releases from The T-House.", meta: "Full length" },
  { id: "clips", title: "Clips", description: "Short excerpts from a release.", meta: "Short form" },
  { id: "audio", title: "Audio", description: "Audio-only releases.", meta: "Unavailable", disabled: true },
];

export default function ChoiceboxDemo() {
  const [enquiry, setEnquiry] = useState("general");
  const [videoFormats, setVideoFormats] = useState<string[]>(["episodes"]);

  return (
    <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-2">
      <Choicebox legend="Enquiry type" options={enquiryOptions} value={enquiry} onChange={setEnquiry} />
      <Choicebox
        legend="Sample release formats"
        options={videoOptions}
        value={videoFormats}
        onChange={setVideoFormats}
        multiple
      />
    </div>
  );
}
