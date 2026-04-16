import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstantReport",
  description: "Internal help desk for issue intake, tracking, and resolution."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
