import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import { Inter } from "next/font/google";
import { Manrope } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/components/providers/AppStateProvider";
import { TopBarProgressProvider } from "@/components/providers/TopBarProgressProvider";
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
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
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
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${inter.variable} ${manrope.variable} ${exo2Logo.variable}`}>
        <AppStateProvider>
          <TopBarProgressProvider>
            <AppShell>{children}</AppShell>
          </TopBarProgressProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
