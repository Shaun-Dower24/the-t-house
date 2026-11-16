"use client";

import { UserRoundIcon } from "lucide-react";
import { useState } from "react";
import {
  LivePreviewForm,
  PreviewValue,
  type LivePreviewField,
  type LivePreviewValues,
} from "@/components/ui/live-preview-form";

const fields: LivePreviewField[] = [
  { name: "guest", label: "Guest name", placeholder: "Who would you invite?" },
  { name: "reason", label: "Why invite them?", type: "textarea", placeholder: "What would you like to hear them talk about?" },
];

export default function LivePreviewFormDemo() {
  const [values, setValues] = useState<LivePreviewValues>({ guest: "", reason: "" });

  return (
    <section className="mx-auto grid w-full max-w-2xl gap-5 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Suggest a guest</h2>
        <p className="text-sm text-muted-foreground">Use a sample guest idea to try the preview in your browser.</p>
      </div>
      <LivePreviewForm
        fields={fields}
        values={values}
        onChange={(name, value) => setValues(previous => ({ ...previous, [name]: value }))}
        onSubmit={async () => {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 900));
        }}
        submitLabel="Try sample submission"
        submittingLabel="Preparing preview…"
        submittedLabel="Sample complete"
        previewLabel="Guest suggestion preview"
        renderPreview={() => (
          <div className="flex items-start gap-3">
            <UserRoundIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold"><PreviewValue name="guest" placeholder="Guest name" /></p>
              <p className="text-sm text-muted-foreground"><PreviewValue name="reason" placeholder="Reason for the invitation" /></p>
            </div>
          </div>
        )}
      />
    </section>
  );
}
