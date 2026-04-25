import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/components/providers/AppStateProvider";
import "./globals.css";

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
      <body>
        <AppStateProvider>
          <AppShell>{children}</AppShell>
        </AppStateProvider>
      </body>
    </html>
  );
}
