"use client";

import FileImageIcon from "@hugeicons/core-free-icons/FileImageIcon";
import { EyeIcon, PencilIcon } from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatedLink } from "@/components/ui/animated-link";
import Contact01 from "@/components/ui/contact-01";
import { CopyButton } from "@/components/ui/copy-button";
import { FieldLabel } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { LivePreview } from "@/components/ui/live-preview-form";
import { SegmentedControlTabs } from "@/components/ui/segmented-control-tabs";
import { StrokeDrawType } from "@/components/ui/stroke-draw-type";
import { Textarea } from "@/components/ui/textarea";
import { useEnhancedControls } from "@/lib/use-enhanced-controls";
import styles from "./enquiry-draft.module.css";

const topics = [
  { label: "General enquiry", prompt: "What would you like to ask The T-House?" },
  { label: "Guest suggestion", prompt: "Who would you like to see on the show, and why?" },
  { label: "Collaboration", prompt: "Tell us what you have in mind and how we could work together." },
  { label: "Studio query", prompt: "What would you like to know about the studio?" },
] as const;

const imageFileTypes = [{ label: "Image", icon: FileImageIcon }];

function selectForManualCopy(field: HTMLInputElement | HTMLTextAreaElement | null) {
  field?.focus();
  field?.select();
}

export function CopyStudioHandle({ handle }: { handle: string }) {
  const enhanced = useEnhancedControls();
  const field = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.handleRow}>
      <input ref={field} className={styles.handle} aria-label="Studio handle" value={handle} size={handle.length} readOnly />
      {enhanced && (
        <CopyButton
          className={styles.copyHandle}
          content={handle}
          label="Copy handle"
          messages={{ copied: "Handle copied.", error: "Handle selected. Copy it manually." }}
          onCopyError={() => selectForManualCopy(field.current)}
          toast
        />
      )}
    </div>
  );
}

export function EnquiryDraft({ instagramUrl }: { instagramUrl: string }) {
  const enhanced = useEnhancedControls();
  const id = useId();
  const [topic, setTopic] = useState<(typeof topics)[number]>(topics[0]);
  const [message, setMessage] = useState("");
  const [panel, setPanel] = useState("write");
  const [expanded, setExpanded] = useState(false);
  const composer = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const selectPreview = useRef(false);
  const body = message.trim();
  const draft = body ? `${topic.label}\n\n${body}` : "";

  useLayoutEffect(() => {
    if (!enhanced || !composer.current) return;
    const element = composer.current;
    const measure = () => {
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const fitsBoth = element.getBoundingClientRect().width >= 40 * rem;
      const focused = document.activeElement;
      if (fitsBoth && focused instanceof HTMLElement && element.contains(focused) && focused.dataset.slot === "segmented-tab") {
        (focused.dataset.value === "preview" ? field.current : editor.current)?.focus({ preventScroll: true });
      }
      setExpanded(fitsBoth);
    };

    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    if (!observer) window.addEventListener("resize", measure);
    const frame = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enhanced]);

  useLayoutEffect(() => {
    if (!selectPreview.current || panel !== "preview") return;
    selectPreview.current = false;
    selectForManualCopy(field.current);
  }, [panel]);

  function handleCopyError() {
    if (field.current?.closest("[inert], [hidden]")) {
      selectPreview.current = true;
      setPanel("preview");
    } else {
      selectForManualCopy(field.current);
    }
  }

  const instagramLink = (
    <AnimatedLink href={instagramUrl} className={styles.instagram} variant="center">
      Open Instagram
    </AnimatedLink>
  );

  const writePanel = (
    <div className={styles.fields}>
      <FieldLabel htmlFor={`${id}-message`}>Message</FieldLabel>
      <p id={`${id}-prompt`} className={styles.prompt}>{topic.prompt}</p>
      <Textarea
        id={`${id}-message`}
        ref={editor}
        className={styles.message}
        aria-describedby={`${id}-prompt`}
        rows={4}
        value={message}
        onChange={(event) => setMessage(event.currentTarget.value)}
        onFocus={() => setPanel("write")}
      />
    </div>
  );

  const previewPanel = (
    <LivePreview complete={Boolean(draft)} className={styles.previewPanel}>
      <FieldLabel htmlFor={`${id}-preview`}>Message preview</FieldLabel>
      <Textarea
        id={`${id}-preview`}
        ref={field}
        className={styles.preview}
        rows={4}
        value={draft}
        placeholder="Your message will appear here."
        tabIndex={draft ? undefined : -1}
        onFocus={() => setPanel("preview")}
        readOnly
      />
    </LivePreview>
  );

  return (
    <Contact01
      id="message-draft"
      className={styles.draft}
      options={enhanced ? topics : []}
      selectedOption={topic}
      onOptionChange={setTopic}
      title={
        <StrokeDrawType
          text="Draft a message"
          className={styles.draftHeading}
          fontSize="inherit"
          fontWeight={700}
          letterSpacing={0}
          strokeWidth={0.72}
          duration={0.72}
          stagger={0.028}
          delay={0.04}
          drainOnHover={false}
        />
      }
      description={enhanced ? "Write your message here, then copy and send it on Instagram." : null}
    >
      {enhanced ? (
        <div ref={composer} className={styles.layout} data-expanded={expanded || undefined}>
          <SegmentedControlTabs
            label="Message draft"
            value={panel}
            onValueChange={setPanel}
            expanded={expanded}
            items={[
              { value: "write", label: "Write", icon: <PencilIcon />, content: writePanel },
              { value: "preview", label: "Preview", icon: <EyeIcon />, content: previewPanel },
            ]}
          />
          <div className={styles.actions}>
            <CopyButton
              className={styles.copyMessage}
              content={draft}
              resetKey={message}
              label="Copy message"
              statusClassName={styles.status}
              messages={{
                copied: "Message copied. Paste it into your Instagram DM.",
                error: "Message selected. Copy it manually.",
              }}
              onCopyError={handleCopyError}
            />
            {instagramLink}
          </div>
          <details className={styles.attachmentPreview}>
            <summary>Preview images</summary>
            <p>Images stay in this browser. To include one, select the original in Instagram.</p>
            <FileUpload
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              acceptedFileTypes={imageFileTypes}
              title="Choose or drop images"
              description="PNG or JPG"
              browseLabel="Browse images"
            />
          </details>
        </div>
      ) : (
        instagramLink
      )}
    </Contact01>
  );
}
