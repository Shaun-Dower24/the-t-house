import type { Metadata } from "next";

function publicSiteUrl(value: string | undefined): URL | undefined {
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password) {
      return new URL(url.origin);
    }
  } catch {
    return;
  }
}

export const siteUrl = publicSiteUrl(process.env.SITE_URL);

export function routeMetadata(path: string, title: string, description: string): Metadata {
  const absoluteTitle = path === "/" ? title : `${title} | The T-House`;
  const shareImage = siteUrl ? new URL("/images/house-installation.webp", siteUrl).href : undefined;
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    ...(siteUrl && { alternates: { canonical: path } }),
    openGraph: {
      type: "website",
      title: absoluteTitle,
      description,
      locale: "en_GB",
      siteName: "The T-House Studio",
      ...(siteUrl && { url: new URL(path, siteUrl).href }),
      ...(shareImage && { images: [{ url: shareImage, width: 1672, height: 941, alt: "The T-House illuminated house concept" }] }),
    },
    twitter: { card: "summary_large_image", title: absoluteTitle, description, ...(shareImage && { images: [shareImage] }) },
  };
}
