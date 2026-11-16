import { StrokeDrawType } from "@/components/ui/stroke-draw-type";

export default function StrokeDrawTypeDemo() {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center bg-[var(--charcoal)] px-6">
      <StrokeDrawType
        text="Signature"
        trigger="in-view"
        strokeWidth={1.6}
        duration={1.5}
        stagger={0.11}
        color="var(--sign-white)"
        fillColor="var(--sign-white)"
        accentColor="var(--signature-red)"
        fontFamily="var(--font-sans)"
        drainOnHover
      />
    </div>
  );
}
