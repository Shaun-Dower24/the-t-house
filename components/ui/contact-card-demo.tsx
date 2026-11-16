"use client";

import { MessageSquareIcon, VideoIcon } from "lucide-react";
import ContactForm from "@/components/ui/contact-form";
import { studio } from "@/content/studio";

const contactInfo = [
  {
    icon: MessageSquareIcon,
    label: "Instagram",
    value: "Message the studio",
    href: studio.instagram,
  },
  {
    icon: VideoIcon,
    label: "YouTube",
    value: "Watch studio videos",
    href: studio.youtube,
  },
];

export default function ContactCardDemo() {
  return (
    <ContactForm
      eyebrow="Preview"
      title="Contact card"
      description="Use sample details to try submitting the form. This preview runs in your browser."
      contactInfo={contactInfo}
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
