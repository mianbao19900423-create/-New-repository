import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "视频字幕",
  description: "上传视频，自动添加字幕并导出 MP4",
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
