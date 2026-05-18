# 视频转 MP4 · Next.js

极简 Web 应用：上传视频 → FFmpeg 转码为 H.264 + AAC 的 MP4 并下载。

## 技术栈

- **Next.js 15**（App Router + API Route）
- **Tailwind CSS**
- **FFmpeg**（`fluent-ffmpeg` + `ffmpeg-static`）

## 快速开始

```bash
cd video-caption-app
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## API

`POST /api/process`

- **Body**: `multipart/form-data`，字段名 `video`
- **成功**: 返回 `video/mp4` 文件流
- **失败**: JSON `{ "error": "..." }`

## 处理流程

1. 保存上传视频到 `tmp/`
2. FFmpeg 转码为 MP4（`libx264` + `aac`）
3. 返回文件流并清理临时文件

## 注意事项

- 处理耗时主要取决于视频长度与机器性能
- 建议视频小于 200MB；大文件需自行调整 Next.js 请求体限制
- `ffmpeg-static` 已内置二进制，无需单独安装 FFmpeg（生产环境也可改用系统 FFmpeg）
