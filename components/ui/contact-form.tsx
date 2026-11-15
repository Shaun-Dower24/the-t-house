"use client";

import { useId, useRef, useState, type ComponentProps, type ReactNode, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { ContactCard, type ContactCardProps } from "@/components/ui/contact-card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEnhancedControls } from "@/lib/use-enhanced-controls";
import { cn } from "@/lib/utils";

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormLabels {
  name: ReactNode;
  email: ReactNode;
  message: ReactNode;
  submit: ReactNode;
  pending: ReactNode;
  success: ReactNode;
  error: ReactNode;
}

export type ContactFormStatus = "idle" | "pending" | "success" | "error";

const defaultLabels: ContactFormLabels = {
  name: "Name",
  email: "Email",
  message: "Message",
  submit: "Send message",
  pending: "Sending…",
  success: "Message sent.",
  error: "Your message could not be sent. Please try again.",
};

export interface ContactFormProps extends Omit<ComponentProps<"section">, "title" | "onSubmit"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  details?: ReactNode;
  contactInfo?: ContactCardProps["contactInfo"];
  labels?: Partial<ContactFormLabels>;
  /** Handles submission in the browser. A rejection keeps the values. */
  onSubmit?: (values: ContactFormValues) => void | Promise<void>;
  /** Supply an explicit action for native submission. The default method is POST. */
  formProps?: ComponentProps<"form">;
  /** Replaces the default form with a custom workflow inside the card. */
  children?: ReactNode;
}

export function ContactForm({
  eyebrow, title = "Get in touch", description, details, contactInfo, labels: labelsProp,
  onSubmit, formProps, className, children, ...props
}: ContactFormProps) {
  const id = useId();
  const enhanced = useEnhancedControls();
  const [status, setStatus] = useState<ContactFormStatus>("idle");
  const submitting = useRef(false);
  const labels = { ...defaultLabels, ...labelsProp };
  const { action, method, className: formClass, onSubmit: onNativeSubmit, ...formAttributes } = formProps ?? {};
  const nativeAction = onSubmit ? undefined : action;
  const hasNativeAction = typeof nativeAction === "function" || Boolean(nativeAction?.trim());
  const enabled = onSubmit ? enhanced : hasNativeAction;
  const pending = status === "pending";

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (!enabled || submitting.current) {
      event.preventDefault();
      return;
    }
    onNativeSubmit?.(event);
    if (!onSubmit || event.defaultPrevented) return;
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    submitting.current = true;
    setStatus("pending");
    try {
      await onSubmit({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      data-slot="contact-form"
      data-status={status}
      className={cn("px-4 py-12 sm:py-16", className)}
      {...props}
    >
      <ContactCard
        title={title}
        headingId={`${id}-heading`}
        eyebrow={eyebrow}
        description={description}
        details={details}
        contactInfo={contactInfo}
        className="mx-auto max-w-6xl"
      >
        {children ?? (
          <form
            {...formAttributes}
            action={nativeAction}
            method={typeof nativeAction === "function" ? undefined : method ?? "post"}
            onSubmit={handleSubmit}
            aria-busy={pending || undefined}
            data-slot="contact-form-form"
            data-status={status}
            className={cn("min-w-0", formClass)}
          >
            <fieldset disabled={!enabled || pending} className="grid min-w-0 gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`${id}-name`}>{labels.name}</FieldLabel>
                  <Input id={`${id}-name`} name="name" autoComplete="name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-email`}>{labels.email}</FieldLabel>
                  <Input id={`${id}-email`} name="email" type="email" autoComplete="email" required />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor={`${id}-message`}>{labels.message}</FieldLabel>
                <Textarea id={`${id}-message`} name="message" rows={5} required />
              </Field>
              <Button
                type="submit"
                data-slot="contact-form-submit"
                disabled={!enabled || pending}
                className="min-h-11 w-full sm:w-fit"
              >
                {pending ? labels.pending : labels.submit}
              </Button>
            </fieldset>
            <p role="status" data-slot="contact-form-success" className="mt-4 text-sm empty:mt-0">
              {status === "success" && labels.success}
            </p>
            <p role="alert" data-slot="contact-form-error" className="mt-4 text-sm text-destructive empty:mt-0">
              {status === "error" && labels.error}
            </p>
          </form>
        )}
      </ContactCard>
    </section>
  );
}

export default ContactForm;
