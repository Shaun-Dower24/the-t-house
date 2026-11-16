import ImgStack from "@/components/ui/image-stack";

const studioArtwork = [
  {
    src: "/images/house-installation.webp",
    alt: "An illuminated house outline standing on a dark floor",
  },
  {
    src: "/images/threshold-detail.webp",
    alt: "A doorway framed by a row of illuminated rooflines",
  },
];

export default function ImageStackDemo() {
  return (
    <div className="flex w-full items-center justify-center px-6 py-10">
      <ImgStack images={studioArtwork} />
    </div>
  );
}
