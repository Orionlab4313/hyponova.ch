import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Providers from "@/components/Providers";
import CookieBanner from "@/components/layout/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HYPONOVA - Digitaler Hypothekenvergleich Schweiz",
  description:
    "Ihr unabhängiger Hypothekenpartner in der Schweiz. Vergleichen Sie Hypotheken von Banken, Versicherungen und Pensionskassen. Digital, transparent und kostenlos.",
  keywords: [
    "Hypothek Schweiz",
    "Hypothekenvergleich",
    "Hypothekenrechner",
    "Hypothek aufnehmen",
    "Hypothek verlängern",
    "Tragbarkeit berechnen",
  ],
  icons: {
    icon: [
      { url: "/icon-light.png", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/icon-dark.png", media: "(prefers-color-scheme: dark)", type: "image/png" },
      { url: "/icon-light.png", type: "image/png" }, // Fallback fuer Browser ohne media-Support
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
