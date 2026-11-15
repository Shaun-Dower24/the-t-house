import { MagneticButton } from "@/components/ui/magnetic-button";

export default function MagneticButtonDemo() {
  return (
    <div className="magnetic-button-demo flex h-screen w-full items-center justify-center bg-background text-foreground">
      <MagneticButton>Hover Me</MagneticButton>
    </div>
  );
}
