"use client";

import ContactForm from "@/components/ui/contact-form";

export default function ContactFormDemo() {
  return (
    <ContactForm
      eyebrow="Preview"
      title="Contact form"
      description="Use sample details to try submitting the form. This preview runs in your browser."
      details={null}
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
