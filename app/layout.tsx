import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Виктор Острецов | Видеомонтаж",
  description:
    "Портфолио видеомонтажёра Виктора Острецова. Reels, Shorts, рекламные ролики, субтитры и саунд-дизайн.",
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
