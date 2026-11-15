import type { ReactNode } from "react";
import { BentoGrid } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import styles from "./contact-page.module.css";

export interface ContactPageProps {
  intro?: ReactNode;
  heading?: ReactNode;
  sectionId?: string;
  gridClassName?: string;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ContactPage({
  intro,
  heading = "Find us online",
  sectionId = "contact-grid",
  gridClassName,
  footer,
  className,
  children,
}: ContactPageProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <div data-slot="contact-page" className={className}>
      <div data-slot="contact-page-frame" className={cn("page-grid", styles.frame)}>
        {intro}
        <section id={sectionId} className={styles.section} aria-labelledby={headingId} tabIndex={-1}>
          <h2 id={headingId} className={styles.heading}>
            {heading}
          </h2>
          <BentoGrid className={gridClassName}>{children}</BentoGrid>
        </section>
        {footer}
      </div>
    </div>
  );
}
