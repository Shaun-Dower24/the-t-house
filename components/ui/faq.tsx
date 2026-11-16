import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

export interface FaqItem {
  /** The item's unique accordion value. Defaults to item-<index>. */
  id?: string;
  question: ReactNode;
  answer: ReactNode;
}

export interface FaqProps extends Omit<ComponentProps<"section">, "title" | "defaultValue"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  items?: readonly FaqItem[];
  layout?: "stacked" | "split";
  type?: "single" | "multiple";
  /** IDs of items open on first render. Use item-<index> for items without IDs. */
  defaultValue?: string | string[];
  footer?: ReactNode;
  /** Supply an existing question list in place of the default accordion. */
  children?: ReactNode;
}

export function Faq({
  className, eyebrow, title = "Frequently asked questions", description, items = [], layout = "split",
  type = "single", defaultValue, footer, children, ...props
}: FaqProps) {
  const titleId = useId();
  const split = layout === "split";
  const hasHeader = [eyebrow, title, description, footer].some((part) => part != null && part !== false);
  const listClassName = cn("w-full min-w-0", !split && "mx-auto max-w-3xl", !split && hasHeader && "mt-10");
  const entries = children == null && items.map(({ id, question, answer }, index) => {
    const value = id ?? `item-${index}`;
    return (
      <AccordionItem key={value} value={value} data-slot="faq-item">
        <AccordionTrigger data-slot="faq-question" className="text-base">{question}</AccordionTrigger>
        <AccordionContent data-slot="faq-answer" className="text-base text-muted-foreground">{answer}</AccordionContent>
      </AccordionItem>
    );
  });

  return (
    <section
      aria-labelledby={title != null && title !== false && props["aria-label"] == null ? titleId : undefined}
      data-slot="faq"
      data-layout={layout}
      className={cn("py-16 sm:py-24", className)}
      {...props}
    >
      <div
        data-slot="faq-container"
        className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", split && hasHeader && "grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]")}
      >
        {hasHeader && (
          <div data-slot="faq-header" className={cn("min-w-0 max-w-2xl", !split && "mx-auto text-center")}>
            {eyebrow != null && <p data-slot="faq-eyebrow" className="text-sm font-medium text-muted-foreground">{eyebrow}</p>}
            {title != null && (
              <h2 id={titleId} data-slot="faq-title" className={cn("text-3xl font-semibold text-balance tracking-tight sm:text-4xl", eyebrow != null && "mt-2")}>
                {title}
              </h2>
            )}
            {description != null && <div data-slot="faq-description" className="mt-4 text-lg text-pretty text-muted-foreground">{description}</div>}
            {footer != null && <div data-slot="faq-footer" className="mt-5 text-sm text-muted-foreground">{footer}</div>}
          </div>
        )}
        {children != null ? (
          <div data-slot="faq-list" className={listClassName}>{children}</div>
        ) : type === "multiple" ? (
          <Accordion
            type="multiple"
            defaultValue={typeof defaultValue === "string" ? [defaultValue] : defaultValue}
            data-slot="faq-list"
            className={listClassName}
          >
            {entries}
          </Accordion>
        ) : (
          <Accordion
            type="single"
            collapsible
            defaultValue={Array.isArray(defaultValue) ? defaultValue[0] : defaultValue}
            data-slot="faq-list"
            className={listClassName}
          >
            {entries}
          </Accordion>
        )}
      </div>
    </section>
  );
}

export default Faq;
