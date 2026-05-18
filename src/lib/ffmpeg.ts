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

export function escapeSubtitlesPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/:/g, "\\:");
}

export function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("end", () => resolve())
      .on("error", reject)
      .save(audioPath);
  });
}

export function burnSubtitles(
  videoPath: string,
  srtPath: string,
  outputPath: string
): Promise<void> {
  const escaped = escapeSubtitlesPath(srtPath);
  const subtitleFilter = `subtitles='${escaped}':force_style='FontSize=22,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=3,Outline=2,Shadow=0,MarginV=48,Alignment=2'`;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions(["-c:v", "libx264", "-preset", "fast", "-crf", "23", "-c:a", "aac", "-b:a", "128k"])
      .videoFilters(subtitleFilter)
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
