import { NearbyWalk } from "@/components/ui/nearby-walk-menu";

const places = [
  { id: "myeongdong", name: "Myeongdong", km: 0.8, walkMinutes: 12 },
  { id: "station", name: "Seoul Station", km: 0.9, walkMinutes: 15 },
  { id: "gate", name: "Sungnyemun Gate", km: 0.5, walkMinutes: 8 },
  { id: "palace", name: "Deoksugung Palace", km: 1, walkMinutes: 15 },
  { id: "tower", name: "N Seoul Tower", km: 1, walkMinutes: 25 },
];

export default function NearbyWalkDemo() {
  return (
    <NearbyWalk
      className="py-8 sm:py-12"
      origin="Example hotel"
      hint="Illustrated Seoul walk with sample distances and walking times."
      defaultTheme="night"
      places={places}
    >
      <p className="m-0 text-center text-sm text-[var(--nw-muted)]">
        Designed and built by{" "}
        <a
          href="https://aakashmehra.com/ref/nearbywalk"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--nw-ink)] underline underline-offset-4"
        >
          Aakash Mehra
        </a>
      </p>
    </NearbyWalk>
  );
}
