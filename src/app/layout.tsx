import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HYPONOVA – Digitaler Hypothekenvergleich Schweiz",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
