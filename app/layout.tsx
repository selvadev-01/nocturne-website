import type { Metadata, Viewport } from "next";
import { Anybody, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const anybody = Anybody({ subsets: ["latin"], axes: ["wdth"], variable: "--font-anybody", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex", display: "swap" });

const description = "Night trains across Europe. Fall asleep in one city, wake up in another. Book a seat, couchette or private sleeper.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3500"),
  title: "NOCTURNE | Night trains across Europe",
  description,
  openGraph: {
    title: "NOCTURNE | Night trains across Europe",
    description,
    images: [{ url: "/img/hero.webp", width: 1536, height: 864, alt: "A sleeper train waiting at a platform at dusk" }],
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0B1020" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anybody.variable} ${instrument.variable} ${plex.variable}`}>
      <body className="bg-night font-sans text-paper antialiased">
        <a href="#main" className="sr-only bg-lamp px-4 py-3 font-semibold text-night focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90]">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
