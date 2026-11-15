import { BorderBeam } from "@/components/ui/border-beam";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BorderBeamRevealOnInteraction() {
  return (
    <div className="border-beam-demo flex flex-wrap items-center justify-center gap-8">
      <BorderBeam
        revealOn="hover"
        showOnTouch
        pressScale
        className="rounded-full"
      >
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "rounded-full",
          )}
        >
          Hover me
        </button>
      </BorderBeam>
      <BorderBeam revealOn="press" pressScale className="rounded-full">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "rounded-full",
          )}
        >
          Press me
        </button>
      </BorderBeam>
    </div>
  );
}
