# 视频字幕 · Next.js

极简 Web 应用：上传视频 → FFmpeg 提取音频 → Whisper 自动字幕 → FFmpeg 烧录字幕 → 导出 MP4。

## 技术栈

- **Next.js 15**（App Router + API Route）
- **Tailwind CSS**
- **FFmpeg**（`fluent-ffmpeg` + `ffmpeg-static`）
- **OpenAI Whisper**（语音识别）

## 快速开始

```bash
cd video-caption-app
npm install
cp .env.example .env.local
# 编辑 .env.local，填入 OPENAI_API_KEY
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 环境变量

| 变量 | 说明 |
|------|------|
| `OPENAI_API_KEY` | 必填，用于 Whisper 语音转文字 |

## API

`POST /api/process`

- **Body**: `multipart/form-data`，字段名 `video`
- **成功**: 返回带字幕的 `video/mp4` 文件流
- **失败**: JSON `{ "error": "..." }`

## 处理流程

1. 保存上传视频到 `tmp/`
2. FFmpeg 提取 WAV 音频
3. OpenAI Whisper 生成带时间轴的字幕
4. 写入 SRT，FFmpeg `subtitles` 滤镜烧录到画面
5. 返回 MP4，并清理临时文件

## 注意事项

- 首次处理耗时取决于视频长度与网络（Whisper API）
- 建议视频小于 200MB；本地开发大文件需自行调整 Next.js 请求体限制
- `ffmpeg-static` 已内置二进制，无需单独安装 FFmpeg（生产环境也可改用系统 FFmpeg）
