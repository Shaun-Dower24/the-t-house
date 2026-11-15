import type { ReactNode } from "react";
import { VhsHeroSection } from "./vhs-hero-section";

export default function OldTelevisionShader({ children }: { children?: ReactNode }) {
  return (
    <VhsHeroSection signal="old-television" className={children == null ? "min-h-svh" : undefined}>
      {children}
    </VhsHeroSection>
  );
}
