"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Slottable } from "@radix-ui/react-slot";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b border-border", className)} {...props} />;
}

export function AccordionTrigger({ children, className, asChild, ...props }: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        asChild={asChild}
        className={cn(
          "group/accordion-trigger flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 py-3 text-start font-medium text-foreground enabled:hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {asChild ? <Slottable>{children}</Slottable> : children}
        <ChevronDown
          aria-hidden="true"
          focusable="false"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion-trigger:rotate-180 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ children, className, asChild, ...props }: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      asChild={asChild}
      className={cn(
        "overflow-hidden text-sm data-[state=closed]:invisible motion-safe:data-[state=closed]:animate-accordion-up motion-safe:data-[state=open]:animate-accordion-down",
        className,
      )}
      {...props}
    >
      {asChild ? children : <div className="pb-4">{children}</div>}
    </AccordionPrimitive.Content>
  );
}
