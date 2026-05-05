import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import { Inter } from "next/font/google";
import { Manrope } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/components/providers/AppStateProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans-app",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display-app",
  display: "swap",
});

const exo2Logo = Exo_2({
  subsets: ["latin", "cyrillic"],
  variable: "--font-logo-app",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mat-hero.vercel.app"),
  title: "MatHero",
  description: "Mobile-first MVP for 7th grade math exam prep.",
  openGraph: {
    title: "MatHero",
    description: "Mobile-first MVP for 7th grade math exam prep.",
    url: "https://mat-hero.vercel.app",
    siteName: "MatHero",
    locale: "bg_BG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MatHero",
    description: "Mobile-first MVP for 7th grade math exam prep.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={`${inter.variable} ${manrope.variable} ${exo2Logo.variable}`}>
        <AppStateProvider>
          <AppShell>{children}</AppShell>
        </AppStateProvider>
      </body>
    </html>
  );
}
