import type { Metadata } from "next";
import { siteContent } from "./portfolio-content";
import "./globals.css";

export const metadata: Metadata = {
  title: siteContent.metadataTitle,
  description: siteContent.metadataDescription,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
