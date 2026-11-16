import { BookOpenIcon, ImageIcon, MessageSquareIcon, PlayIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import SegmentedControlTabs from "@/components/ui/segmented-control-tabs";
import { featuredVideo } from "@/content/studio";

const sections = [
  {
    value: "watch",
    label: "Watch",
    Icon: PlayIcon,
    title: featuredVideo.title,
    description: featuredVideo.description,
    href: featuredVideo.href,
    action: "Watch the episode",
  },
  {
    value: "artwork",
    label: "Artwork",
    Icon: ImageIcon,
    title: "Studio concept artwork",
    description: "Explore the house elevation and the studio artwork.",
    href: "/inside-the-house",
    action: "Inside the House",
  },
  {
    value: "story",
    label: "Story",
    Icon: BookOpenIcon,
    title: "About The T-House",
    description: "Read about the studio and its connection with producer SV on the Beat.",
    href: "/about",
    action: "Read the studio story",
  },
  {
    value: "contact",
    label: "Contact",
    Icon: MessageSquareIcon,
    title: "Get in touch",
    description: "Draft a message for the studio and send it on Instagram.",
    href: "/connect#message-draft",
    action: "Open the message draft",
  },
];

const items = sections.map(({ value, label, Icon, title, description, href, action }) => ({
  value,
  label,
  icon: <Icon className="size-4" aria-hidden="true" />,
  content: (
    <Card className="rounded-none shadow-none">
      <CardContent className="grid gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Link href={href} className="w-fit text-sm underline underline-offset-4">{action}</Link>
      </CardContent>
    </Card>
  ),
}));

export default function SegmentedControlTabsDemo() {
  return (
    <SegmentedControlTabs
      label="Explore The T-House"
      items={items}
      defaultValue="watch"
      className="mx-auto w-full max-w-md"
    />
  );
}
