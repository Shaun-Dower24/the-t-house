import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HomeScenes } from "../components/home-scenes";
import { SiteFooter } from "../components/site-footer";
import { siteUrl } from "../content/site";
import "@fontsource/barlow/latin-400.css";
import "@fontsource/barlow/latin-500.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow/latin-700.css";
import "@fontsource/explora/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "The T-House Studio | Leyton, East London", template: "%s | The T-House" },
  metadataBase: siteUrl,
  robots: siteUrl ? { index: true, follow: true } : { index: false, follow: true },
  description:
    "Enter The T-House, a creative music studio in Leyton, East London. Explore the studio and follow The T-House on YouTube and Instagram.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "The T-House Studio",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body><HomeScenes footer={<SiteFooter />}>{children}</HomeScenes></body>
    </html>
  );
}
