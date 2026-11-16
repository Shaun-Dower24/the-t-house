import { ShaderBackground } from "@/components/ui/paper-texture";

export default function ShaderBackgroundDemo() {
  return (
    <div className="relative h-svh w-full overflow-hidden bg-[var(--surface)]">
      <ShaderBackground className="absolute inset-0" />
    </div>
  );
}
