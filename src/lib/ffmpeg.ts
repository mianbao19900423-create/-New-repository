import { mkdir, unlink } from "fs/promises";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
if (ffprobe.path) {
  ffmpeg.setFfprobePath(ffprobe.path);
}

export const TMP_DIR = path.join(process.cwd(), "tmp");

export async function ensureTmpDir(): Promise<string> {
  await mkdir(TMP_DIR, { recursive: true });
  return TMP_DIR;
}

/** Re-encode to H.264 + AAC MP4. */
export function exportVideoToMp4(videoPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
      ])
      .on("end", () => resolve())
      .on("error", reject)
      .save(outputPath);
  });
}

export async function cleanupFiles(paths: string[]): Promise<void> {
  await Promise.all(
    paths.map((file) =>
      unlink(file).catch(() => {
        /* ignore missing temp files */
      })
    )
  );
}
