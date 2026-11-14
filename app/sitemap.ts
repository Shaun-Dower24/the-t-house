import type { MetadataRoute } from "next";
import { siteUrl } from "../content/site";
import { publishedVideos } from "../content/studio";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return ["/", "/watch", "/inside-the-house", "/about", "/connect", ...publishedVideos.map((video) => video.href)]
    .map((path) => ({ url: new URL(path, siteUrl).href }));
}
