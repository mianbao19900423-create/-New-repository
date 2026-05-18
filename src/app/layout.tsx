import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "视频转 MP4",
  description: "上传视频，使用 FFmpeg 导出 MP4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
