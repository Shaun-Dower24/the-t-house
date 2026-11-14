import Image from "next/image";

export function StudioMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/t-house-neon-mark.jpg"
      alt=""
      aria-hidden="true"
      className={className}
      width={150}
      height={150}
      unoptimized
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 11%, #000 88%, transparent), linear-gradient(to bottom, transparent, #000 21%, #000 86%, transparent)",
        maskComposite: "intersect",
      }}
    />
  );
}
