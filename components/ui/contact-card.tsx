import { PlusIcon, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContactInfoProps extends Omit<ComponentProps<"div">, "children"> {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

export interface ContactCardProps extends Omit<ComponentProps<"div">, "title"> {
  title?: ReactNode;
  headingId?: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  details?: ReactNode;
  contactInfo?: readonly ContactInfoProps[];
  formSectionClassName?: string;
}

const corners = ["top-0 left-0", "top-0 left-full", "top-full left-0", "top-full left-full"];

export function ContactCard({
  title = "Get in touch", headingId, eyebrow, description, details, contactInfo,
  className, formSectionClassName, children, ...props
}: ContactCardProps) {
  return (
    <div
      data-slot="contact-card"
      className={cn(
        "relative grid min-w-0 w-full border border-border bg-card text-card-foreground lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
        className,
      )}
      {...props}
    >
      {corners.map(corner => (
        <PlusIcon
          key={corner}
          aria-hidden="true"
          focusable="false"
          data-slot="contact-card-corner"
          strokeWidth={1.25}
          className={cn("pointer-events-none absolute z-10 size-4 -translate-1/2 text-muted-foreground", corner)}
        />
      ))}
      <div data-slot="contact-card-header" className="min-w-0 p-5 sm:p-8">
        {eyebrow && <p className="mb-2 text-sm font-medium text-muted-foreground">{eyebrow}</p>}
        <h2 id={headingId} className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-prose text-base text-pretty text-muted-foreground">{description}</p>}
        {details && <div data-slot="contact-card-details" className="mt-5">{details}</div>}
        {contactInfo && contactInfo.length > 0 && (
          <dl className="mt-6 grid gap-4">
            {contactInfo.map(info => <ContactInfo key={`${info.label}-${info.value}`} {...info} />)}
          </dl>
        )}
      </div>
      <div
        data-slot="contact-card-panel"
        className={cn("min-w-0 border-t border-border bg-background p-5 sm:p-8 lg:border-s lg:border-t-0", formSectionClassName)}
      >
        {children}
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value, href, className, ...props }: ContactInfoProps) {
  return (
    <div className={cn("relative min-w-0 ps-7", className)} {...props}>
      <dt className="text-sm font-medium">
        <Icon aria-hidden="true" className="absolute start-0 top-0.5 size-4 text-muted-foreground" />
        {label}
      </dt>
      <dd className="mt-1 text-sm wrap-anywhere text-muted-foreground">
        {href ? <a href={href} className="underline underline-offset-4 hover:text-foreground">{value}</a> : value}
      </dd>
    </div>
  );
}
