import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HomeScenes } from "../components/home-scenes";
import { SiteFooter } from "../components/site-footer";
import { siteUrl } from "../content/site";
import { homeIntroBootstrap, homeIntroFailsafe } from "../components/ui/home-intro-bootstrap";
import "@fontsource/barlow/latin-400.css";
import "@fontsource/barlow/latin-500.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow/latin-700.css";
import "@fontsource/hurricane/latin-400.css";
import "@fontsource/sedgwick-ave-display/latin-400.css";
import "@fontsource/permanent-marker/latin-400.css";
import "@fontsource/barlow-condensed/latin-600.css";
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
    <html lang="en-GB" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/images/arrival-poster.jpg" />
        <style dangerouslySetInnerHTML={{ __html: homeIntroFailsafe }} />
        <script dangerouslySetInnerHTML={{ __html: homeIntroBootstrap }} />
      </head>
      <body>
        <svg className="absolute" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <filter id="graffiti-roughen" x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.035 0.12" numOctaves="2" seed="17" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="graffiti-spray-grain" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="8" result="grain" />
              <feComposite in="SourceGraphic" in2="grain" operator="in" />
            </filter>
            <filter id="graffiti-drip" x="-10%" y="-10%" width="120%" height="150%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="dilate" radius="0 2" result="ink" />
              <feOffset in="ink" dy="3" result="drip" />
              <feFlood floodColor="#C83838" result="red" />
              <feComposite in="red" in2="drip" operator="in" result="paint" />
              <feMerge><feMergeNode in="paint" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="text-antialiasing" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" />
            </filter>
          </defs>
        </svg>
        <HomeScenes footer={<SiteFooter />}>{children}</HomeScenes>
      </body>
    </html>
  );
}
