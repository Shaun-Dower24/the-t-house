import HoverExpandGallery, { type HoverExpandGalleryProps } from "@/components/ui/hover-expand-gallery";

type InteractiveImageAccordionProps = Omit<HoverExpandGalleryProps, "variant">;

export function LandingAccordionItem({
  height = "clamp(17rem, 58cqw, 28rem)",
  railWidth = 60,
  maxOpenWidth = 640,
  mobileImageHeight = 360,
  duration = 620,
  ...props
}: InteractiveImageAccordionProps) {
  return (
    <HoverExpandGallery
      {...props}
      variant="image-panels"
      height={height}
      railWidth={railWidth}
      maxOpenWidth={maxOpenWidth}
      mobileImageHeight={mobileImageHeight}
      duration={duration}
    />
  );
}

export default LandingAccordionItem;
