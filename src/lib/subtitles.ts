import { createReadStream } from "fs";
import OpenAI from "openai";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export function segmentsToSrt(segments: TranscriptSegment[]): string {
  return segments
    .filter((seg) => seg.text.trim())
    .map((seg, index) => {
      const start = formatSrtTime(seg.start);
      const end = formatSrtTime(seg.end);
      return `${index + 1}\n${start} --> ${end}\n${seg.text.trim()}\n`;
    })
    .join("\n");
}

export async function transcribeAudio(audioPath: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("请设置环境变量 OPENAI_API_KEY 以启用自动字幕（Whisper）");
  }

  const openai = new OpenAI({ apiKey });
  const result = await openai.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments = result.segments ?? [];
  if (segments.length === 0 && result.text) {
    return [{ start: 0, end: Math.max(result.duration ?? 30, 1), text: result.text }];
  }

  return segments.map((seg) => ({
    start: seg.start,
    end: seg.end,
    text: seg.text,
  }));
}
