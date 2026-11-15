import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

export interface CtaProps extends VariantProps<typeof buttonVariants> {
  ctaEnabled?: boolean;
  text: string;
  link: string;
}

export function Cta({ cta }: { cta: CtaProps }) {
  const { ctaEnabled = true, text, link, variant, size } = cta;
  const href = link.trim();

  if (!ctaEnabled || !href) return null;

  return (
    <a className={buttonVariants({ variant, size })} href={href}>
      {text}
    </a>
  );
}
