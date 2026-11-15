import { AnimatedLink } from "@/components/ui/animated-link";

export default function DemoOne() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 py-16 text-lg">
      <AnimatedLink href="#" variant="left">
        Hover over me
      </AnimatedLink>
      <AnimatedLink href="#" variant="right">
        Hover over me
      </AnimatedLink>
      <AnimatedLink href="#" variant="center">
        Hover over me
      </AnimatedLink>
    </div>
  );
}
