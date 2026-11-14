import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource-variable/dm-sans/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "The T-House Studio | Leyton, East London",
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
      <body>{children}</body>
    </html>
  );
}
