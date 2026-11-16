"use client";

import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { createContext, useContext, useId, useRef, useState, type ChangeEvent, type ComponentProps, type ReactNode, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEnhancedControls } from "@/lib/use-enhanced-controls";
import { cn } from "@/lib/utils";
import styles from "./live-preview-form.module.css";

export type LivePreviewField = {
  name: string;
  label: ReactNode;
  type?: "text" | "email" | "tel" | "url" | "textarea";
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
};

export type LivePreviewValues = Record<string, string>;

export type LivePreviewFormProps = {
  fields: readonly LivePreviewField[];
  values: LivePreviewValues;
  onChange: (name: string, value: string) => void;
  renderPreview: (values: LivePreviewValues) => ReactNode;
  onSubmit?: (values: LivePreviewValues) => unknown;
  layout?: "auto" | "side" | "stack";
  submitLabel?: ReactNode;
  submittingLabel?: ReactNode;
  submittedLabel?: ReactNode;
  errorLabel?: ReactNode;
  previewLabel?: ReactNode;
  className?: string;
  ref?: ComponentProps<"form">["ref"];
};

const PreviewContext = createContext<LivePreviewValues>({});

export function LivePreview({ values, complete, children, className }: {
  values?: LivePreviewValues;
  complete: boolean;
  children: ReactNode;
  className?: string;
}) {
  const content = (
    <div data-slot="live-preview-card" data-preview-card="" data-complete={complete} className={cn(styles.frame, className)}>
      {children}
    </div>
  );

  return values ? <PreviewContext.Provider value={values}>{content}</PreviewContext.Provider> : content;
}

export function PreviewValue({ name, placeholder, className, transform }: {
  name: string;
  placeholder: ReactNode;
  className?: string;
  transform?: (value: string) => string;
}) {
  const raw = useContext(PreviewContext)[name] ?? "";
  const value = raw && transform ? transform(raw) : raw;
  // Keep multiline text, long values and combined characters as continuous text.
  const animateCharacters = value.length > 0 && value.length <= 80 && /^[\x20-\x7e]+$/.test(value);

  return (
    <span data-preview={name} data-empty={!value} className={cn(styles.value, className)}>
      {animateCharacters ? (
        <>
          <span className="sr-only">{value}</span>
          <span aria-hidden="true">
            {Array.from(value, (char, index) => <span className={styles.char} data-char="" key={`${index}-${char}`}>{char}</span>)}
          </span>
        </>
      ) : value || placeholder}
    </span>
  );
}

type Submission = { status: "idle" | "submitting" | "done" | "error"; snapshot: string };

export function LivePreviewForm({
  fields, values, onChange, renderPreview, onSubmit, layout = "auto", submitLabel = "Create",
  submittingLabel = "Saving…", submittedLabel = "Saved", errorLabel = "Couldn’t save the preview. Try again.",
  previewLabel = "Preview", className, ref,
}: LivePreviewFormProps) {
  const enhanced = useEnhancedControls();
  const baseId = useId();
  const inFlight = useRef(false);
  const [submission, setSubmission] = useState<Submission>({ status: "idle", snapshot: "" });
  const snapshot = JSON.stringify(values);
  const status = submission.status === "submitting" || submission.snapshot === snapshot ? submission.status : "idle";
  const pending = status === "submitting";
  const required = fields.filter(field => field.required !== false);
  const filled = required.filter(field => (values[field.name] ?? "").trim()).length;
  const complete = filled === required.length;

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSubmit || !enhanced || !complete || inFlight.current || status === "done") return;

    inFlight.current = true;
    setSubmission({ status: "submitting", snapshot });
    try {
      await onSubmit({ ...values });
      setSubmission({ status: "done", snapshot });
    } catch {
      setSubmission({ status: "error", snapshot });
    } finally {
      inFlight.current = false;
    }
  }

  const content = (
    <div className={styles.layout} data-layout={layout}>
      <div className="grid min-w-0 gap-4">
        {fields.map(({ name, label, type = "text", ...field }) => {
          const id = `${baseId}-${name}`;
          const controlProps = {
            id,
            name,
            value: values[name] ?? "",
            placeholder: field.placeholder,
            autoComplete: field.autoComplete,
            required: field.required !== false,
            disabled: Boolean(onSubmit) && (!enhanced || pending),
            onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(name, event.currentTarget.value),
          };
          return (
            <Field key={name}>
              <FieldLabel htmlFor={id}>{label}</FieldLabel>
              {type === "textarea" ? <Textarea {...controlProps} rows={4} /> : <Input {...controlProps} type={type} />}
            </Field>
          );
        })}
        {onSubmit && (
          <div>
            <Button type="submit" disabled={!enhanced || !complete || pending || status === "done"} className="min-h-11 w-full">
              {pending && <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {status === "done" && <CheckIcon aria-hidden="true" />}
              {pending ? submittingLabel : status === "done" ? submittedLabel : submitLabel}
            </Button>
            <p role="status" className="sr-only">{pending ? submittingLabel : status === "done" ? submittedLabel : null}</p>
            <p role="alert" className="mt-2 text-sm text-destructive empty:mt-0">{status === "error" ? errorLabel : null}</p>
          </div>
        )}
      </div>
      <div className="min-w-0" role={previewLabel ? "region" : undefined} aria-labelledby={previewLabel ? `${baseId}-preview` : undefined}>
        {previewLabel && <p id={`${baseId}-preview`} className="mb-2 text-sm font-semibold">{previewLabel}</p>}
        <LivePreview values={values} complete={complete} className={styles.card}>
          {renderPreview(values)}
        </LivePreview>
      </div>
    </div>
  );

  const host = {
    "data-slot": "live-preview-form",
    "data-complete": complete,
    "data-filled": filled,
    "data-status": status,
    className: cn(styles.host, className),
  };

  return onSubmit ? (
    <form {...host} ref={ref} method="post" onSubmit={submit} aria-busy={pending || undefined}>{content}</form>
  ) : <div {...host}>{content}</div>;
}

export default LivePreviewForm;
