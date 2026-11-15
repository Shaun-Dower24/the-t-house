import { LocationMap } from "@/components/ui/expand-map";

export default function ExpandMapDemo() {
  return (
    <figure className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-4 py-8 sm:px-6">
      <figcaption className="text-sm text-muted-foreground">Illustrated map example</figcaption>
      <LocationMap location="San Francisco, CA" coordinates="37.7749° N, 122.4194° W" />
    </figure>
  );
}
