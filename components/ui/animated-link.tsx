import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimatedLinkVariant = "left" | "right" | "center";

const underlineVariants: Record<AnimatedLinkVariant, string> = {
  left: "before:origin-right hover:before:origin-left focus-visible:before:origin-left",
  right: "before:origin-left hover:before:origin-right focus-visible:before:origin-right",
  center: "before:origin-center",
};

const artworkOrigins: Record<AnimatedLinkVariant, string> = {
  left: "origin-right group-hover/animated-link:origin-left group-focus-visible/animated-link:origin-left",
  right: "origin-left group-hover/animated-link:origin-right group-focus-visible/animated-link:origin-right",
  center: "origin-center",
};

export interface AnimatedLinkProps extends ComponentPropsWithRef<"a"> {
  /** Direction the underline reveals from. */
  variant?: AnimatedLinkVariant;
  /** Show the arrow beside the label. */
  showArrow?: boolean;
  /** Optional artwork to display in place of the line. */
  underline?: ReactNode;
  /** Optional artwork to display in place of the diagonal arrow. */
  arrow?: ReactNode;
}

function AnimatedLink({
  variant = "left",
  showArrow = true,
  underline,
  arrow,
  className,
  children,
  ...props
}: AnimatedLinkProps) {
  const hasArtwork = underline != null;

  return (
    <a
      className={cn(
        "group/animated-link relative inline-flex w-fit items-center text-foreground",
        !hasArtwork && [
          "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
          "before:scale-x-0 hover:before:scale-x-100 focus-visible:before:scale-x-100",
          "before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:before:transition-none",
          underlineVariants[variant],
        ],
        className,
      )}
      {...props}
    >
      {hasArtwork ? (
        <span className="relative">
          {children}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-full mt-[0.12em] block scale-x-0",
              "group-hover/animated-link:scale-x-100 group-focus-visible/animated-link:scale-x-100",
              "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
              artworkOrigins[variant],
            )}
          >
            {underline}
          </span>
        </span>
      ) : children}
      {showArrow && (arrow ?? (
        <svg
          className="ml-[0.3em] size-[0.55em] shrink-0 transition-transform duration-300 group-hover/animated-link:-translate-y-px group-focus-visible/animated-link:-translate-y-px motion-reduce:transition-none"
          fill="none"
          viewBox="0 0 10 10"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="[stroke-dasharray:32] [@media(hover:hover)_and_(pointer:fine)]:[stroke-dashoffset:32] group-hover/animated-link:[stroke-dashoffset:0] group-focus-visible/animated-link:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          />
        </svg>
      ))}
    </a>
  );
}

export { AnimatedLink };
export default AnimatedLink;
