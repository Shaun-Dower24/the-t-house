import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./bento-grid.module.css";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  name: string;
  href: string;
  cta: string;
  description?: string;
  background?: ReactNode;
  Icon?: ComponentType<Pick<SVGProps<SVGSVGElement>, "className" | "aria-hidden">>;
  className?: string;
  arrow?: ReactNode;
  headingLevel?: 2 | 3;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div data-slot="bento-grid" className={cn("grid w-full grid-cols-1 gap-4 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  href,
  cta,
  description,
  background,
  Icon,
  className,
  arrow,
  headingLevel = 3,
}: BentoCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link href={href} data-slot="bento-card" className={cn("group", styles.card, className)}>
      {background}
      <div className={styles.content}>
        <div className={styles.copy}>
          {Icon && <Icon className={styles.icon} aria-hidden="true" />}
          <Heading className={styles.title}>{name}</Heading>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <span className={cn(buttonVariants({ variant: "ghost", size: "sm" }), styles.cta)}>
          {cta}
          <span className={styles.arrow} aria-hidden="true">{arrow ?? <ArrowRightIcon />}</span>
        </span>
      </div>
    </Link>
  );
}
