export const studio = {
  name: "The T-House Studio",
  location: "Leyton, East London",
  youtube: "https://www.youtube.com/@thethousestudio",
  instagram: "https://www.instagram.com/thethousestudio/",
} as const;

type Video = {
  slug: string;
  href: `/watch/${string}`;
  title: string;
  description: string;
  url: string;
  id: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  publishedAt: string;
  kind: "episode" | "clip" | "studio" | "music";
  status: "published" | "archived" | "draft";
  embedAllowed: boolean;
  relatedSlugs?: readonly string[];
};

const episodeId = "9adqs1vgcMA";
const episodeSlug = "fifa-in-the-t-ep-1";

export const featuredVideo: Video = {
  slug: episodeSlug,
  href: `/watch/${episodeSlug}`,
  title: "Fifa In The T EP 1: SV Vs Kojo Funds",
  description: "SV takes on Kojo Funds in FIFA in the first episode of Fifa In The T.",
  url: `https://www.youtube.com/watch?v=${episodeId}`,
  id: episodeId,
  thumbnail: `https://i.ytimg.com/vi/${episodeId}/maxresdefault.jpg`,
  duration: "3:43",
  durationSeconds: 223,
  publishedAt: "2026-01-20T16:55:14-08:00",
  kind: "episode",
  status: "published",
  embedAllowed: true,
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/London",
});

export function formatVideoDate(publishedAt: string) {
  return dateFormatter.format(new Date(publishedAt));
}

const videos: readonly Video[] = [featuredVideo];
export const publishedVideos = videos.filter((video) => video.status === "published");

export const videoKindLabels = {
  episode: "Episode",
  clip: "Clip",
  studio: "Studio",
  music: "Music",
} as const;

export function getEmbedUrl(id: string, parameters?: Record<string, string | number>) {
  const query = parameters && new URLSearchParams(Object.entries(parameters).map(([key, value]) => [key, String(value)]));
  return `https://www.youtube-nocookie.com/embed/${id}${query ? `?${query}` : ""}`;
}
