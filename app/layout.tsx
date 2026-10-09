import type { Metadata,Viewport } from "next";
import "./globals.css";

export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover"};

export const metadata: Metadata = {
  title: "Jatlas · 당신의 속도로 만나는 일본",
  description: "일본의 풍경, 마을, 음식. 사진으로 발견하고 지도에서 이어지는 여행.",
  icons: {
    icon: [
      { url: "./favicon.svg?v=20261010", type: "image/svg+xml", sizes: "any" },
      { url: "./images/common/branding/favicon-32.png?v=20261010", sizes: "32x32", type: "image/png" },
      { url: "./favicon.ico?v=20261010", sizes: "any" },
    ],
    shortcut: "./favicon.ico?v=20261010",
    apple: "./images/common/branding/apple-touch-icon.png",
  },
  manifest: "./site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
