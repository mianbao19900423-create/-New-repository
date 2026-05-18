"use client";

import { useCallback, useRef, useState } from "react";

type Status = "idle" | "uploading" | "done" | "error";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("output.mp4");

  const reset = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setError(null);
    setStatus("idle");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [downloadUrl]);

  const onFileChange = (selected: File | null) => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setError(null);
    setStatus("idle");
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("请先选择视频");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `处理失败 (${res.status})`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
      const name = match?.[1] ? decodeURIComponent(match[1]) : "export.mp4";

      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(name);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "未知错误");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-2xl font-medium tracking-tight">视频转 MP4</h1>
        <p className="mt-2 text-sm text-neutral-500">上传视频 → FFmpeg 转码 → 导出 MP4</p>
      </header>

      <section className="space-y-6">
        <label
          htmlFor="video"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-14 transition hover:border-neutral-400"
        >
          <span className="text-sm text-neutral-600">
            {file ? file.name : "点击或拖拽选择视频"}
          </span>
          <span className="mt-1 text-xs text-neutral-400">MP4 · MOV · WebM · 最大建议 200MB</span>
          <input
            ref={inputRef}
            id="video"
            type="file"
            accept="video/*"
            className="sr-only"
            disabled={status === "uploading"}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || status === "uploading"}
            className="flex-1 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "uploading" ? "处理中…" : "导出 MP4"}
          </button>
          {(file || status === "done" || status === "error") && status !== "uploading" && (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-600 transition hover:bg-neutral-100"
            >
              重置
            </button>
          )}
        </div>

        {status === "uploading" && (
          <p className="text-center text-xs text-neutral-500">
            正在处理视频，请稍候…
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</p>
        )}

        {status === "done" && downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadName}
            className="block rounded-lg border border-neutral-200 bg-white py-3 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            下载 {downloadName}
          </a>
        )}
      </section>

      <footer className="mt-16 text-center text-xs text-neutral-400">后端 API Route · FFmpeg</footer>
    </main>
  );
}
