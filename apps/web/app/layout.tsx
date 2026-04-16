import type { Metadata } from "next";

import { getCurrentLocale } from "@/lib/i18n-server";

import "./globals.css";

export const metadata: Metadata = {
  title: "InstantReport",
  description: "Internal help desk for issue intake, tracking, and resolution."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
