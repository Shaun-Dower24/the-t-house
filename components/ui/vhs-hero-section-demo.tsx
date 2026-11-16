import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { VhsHeroSection } from "@/components/ui/vhs-hero-section";

export default function VhsHeroSectionDemo() {
  return (
    <VhsHeroSection>
      <div className="page-grid flex min-h-[28rem] flex-col items-start justify-center gap-6 py-16">
        <h1 className="script-title text-7xl sm:text-9xl">The T-House</h1>
        <Link className={buttonVariants({ size: "lg" })} href="/watch">Watch an episode</Link>
      </div>
    </VhsHeroSection>
  );
}
