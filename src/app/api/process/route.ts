import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { cleanupFiles, ensureTmpDir, exportVideoToMp4, TMP_DIR } from "@/lib/ffmpeg";

export const runtime = "nodejs";
export const maxDuration = 300;

const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
]);

export async function POST(request: NextRequest) {
  const id = randomUUID();
  const outputPath = path.join(TMP_DIR, `${id}-out.mp4`);
  let videoPath = "";

  try {
    await ensureTmpDir();

    const formData = await request.formData();
    const file = formData.get("video");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "请上传视频文件" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "视频文件为空" }, { status: 400 });
    }

    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "不支持的视频格式，请上传 MP4 / MOV / WebM 等常见格式" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || ".mp4";
    videoPath = path.join(TMP_DIR, `${id}-input${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(videoPath, buffer);

    await exportVideoToMp4(videoPath, outputPath);

    const outputBuffer = await readFile(outputPath);
    const base = path.parse(file.name).name || "video";
    const downloadName = `${base}-export.mp4`;

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "处理失败";
    console.error("[process]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await cleanupFiles([videoPath, outputPath].filter(Boolean));
  }
}
