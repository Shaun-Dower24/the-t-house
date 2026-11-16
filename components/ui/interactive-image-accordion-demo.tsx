import InteractiveImageAccordion from "@/components/ui/interactive-image-accordion";

const settings = {
  height: "28rem",
  railWidth: 60,
  maxOpenWidth: 400,
  mobileImageHeight: 340,
  duration: 700,
};

export default function InteractiveImageAccordionDemo(props: Partial<typeof settings> = {}) {
  return <InteractiveImageAccordion {...settings} {...props} />;
}
