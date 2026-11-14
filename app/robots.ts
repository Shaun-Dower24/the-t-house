import type { MetadataRoute } from "next";
import { siteUrl } from "../content/site";

export default function robots(): MetadataRoute.Robots {
  return siteUrl
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: new URL("/sitemap.xml", siteUrl).href }
    : { rules: { userAgent: "*", disallow: "/" } };
}
