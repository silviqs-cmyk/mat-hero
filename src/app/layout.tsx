import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/components/providers/AppStateProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatHero",
  description: "Mobile-first MVP for 7th grade math exam prep.",
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
