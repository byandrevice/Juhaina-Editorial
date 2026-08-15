import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource/anybody/400.css";
import "@fontsource/syne-mono/400.css";
import "@fontsource/syne-tactile/400.css";
import "@fontsource/newsreader/300.css";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/500.css";
import "@fontsource/newsreader/300-italic.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/libre-caslon-text/400.css";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/lora/400.css";
import "@fontsource/literata/400.css";
import "@fontsource/fraunces/400.css";
import "@fontsource/bodoni-moda/400.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/source-serif-4/400.css";
import "./globals.css";

const ppMori = localFont({
  src: [
    {
      path: "./fonts/PPMori-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PPMori-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-pp-mori",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const cardo = localFont({
  src: [
    {
      path: "./fonts/Cardo-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Cardo-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Cardo-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-cardo",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: "Second Viewing",
  description:
    "Films, moodboards, projections, and lists by an independent critic.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${ppMori.variable} ${cardo.variable}`}>
        {children}
      </body>
    </html>
  );
}
