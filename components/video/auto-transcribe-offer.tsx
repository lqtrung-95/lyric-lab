"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import { MAX_ASR_VIDEO_SECONDS } from "@/lib/video/asr/asr-chunks";
import { collectChunks } from "@/lib/video/asr/collect-chunks";

const ERRORS: Record<string, string> = {
  ai_unavailable: "AI chưa nghe được video này lúc này (quá tải hoặc video không cho đọc). Thử lại sau ít phút, hoặc dán phụ đề vào ô trên.",
  user_limit: "Hôm nay bạn đã dùng hết lượt nhờ AI nghe video. Quay lại vào ngày mai nhé.",
  global_limit: "Hôm nay mọi người đã nhờ AI nghe video rất nhiều, hãy quay lại vào ngày mai nhé.",
  too_long: `Nhận dạng giọng nói chỉ hỗ trợ video dài tối đa ${MAX_ASR_VIDEO_SECONDS / 60} phút.`,
  too_short: "Video quá ngắn để luyện (dưới 30 giây).",
  not_embeddable: "Chủ video không cho nhúng, nên không thêm được.",
  not_found: "Không tìm thấy video này (có thể riêng tư hoặc đã bị xóa).",
  unauthorized: "Cần mở lại trang để có phiên đăng nhập, rồi thử lại.",
};

class ChunkError extends Error { constructor(readonly code: string) { super(code); } }
const RETRYABLE = new Set(["ai_unavailable", "server_error", "network"]);

async function fetchChunk(video: string, chunk: number) {
  let res: Response;
  try {
    res = await fetch("/api/videos/transcribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ video, chunk }) });
  } catch {
    throw new ChunkError("network");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; lines?: CaptionLine[]; chunkCount?: number };
  if (!res.ok || !data.lines || !data.chunkCount) throw new ChunkError(data.error ?? "server_error");
  return { lines: data.lines, chunkCount: data.chunkCount };
}

/**
 * Gợi ý hiện khi video không có phụ đề tiếng Trung: nhờ AI nghe video (Gemini đọc thẳng link YouTube, máy chủ ta không tải gì) rồi chép lời kèm mốc giờ.
 * Chia video thành các đoạn ~2 phút, gọi từng đoạn (mỗi lượt gọi nằm trong 60 giây của máy chủ). Xong thì trao các dòng cho nơi gọi để gửi sang /api/videos/add.
 */
export function AutoTranscribeOffer({ video, disabled, onLines, onExists }: { video: string; disabled: boolean; onLines: (lines: CaptionLine[]) => void; onExists: () => void }) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = progress !== null;

  async function start() {
    setError(null);
    setProgress({ done: 0, total: 1 });
    try {
      const lines = await collectChunks((i) => fetchChunk(video, i), (done, total) => setProgress({ done, total }), {
        concurrency: 3, isRetryable: (e) => !(e instanceof ChunkError) || RETRYABLE.has(e.code),
      });
      if (lines.length === 0) { setError("AI không nghe thấy lời nói tiếng Trung nào trong video này."); setProgress(null); return; }
      onLines(lines);
    } catch (e) {
      const code = e instanceof ChunkError ? e.code : "server_error";
      if (code === "exists") { onExists(); return; }
      setError(ERRORS[code] ?? "Có lỗi ở máy chủ. Thử lại sau nhé.");
    }
    setProgress(null);
  }

  return (
    <section aria-label="Nhận dạng giọng nói bằng AI" className="space-y-2 rounded-2xl bg-surface-container-low p-4">
      <p className="text-label-md font-semibold text-on-surface">Video chưa có phụ đề? Nhờ AI nghe và chép lại</p>
      <p className="text-label-md text-on-surface-variant">AI nghe giọng nói rồi tạo phụ đề tiếng Trung kèm mốc giờ (video tối đa {MAX_ASR_VIDEO_SECONDS / 60} phút, mất vài phút). Bản chép có thể sai chữ hoặc lệch vài giây và sẽ được gắn nhãn &quot;nhận dạng tự động&quot;.</p>
      {running && <p role="status" className="text-label-md text-primary">AI đang nghe video… đã xong {progress.done}/{progress.total} đoạn. Bạn đừng đóng trang này nhé.</p>}
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      <button type="button" onClick={() => void start()} disabled={disabled || running}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-outline px-6 text-label-md font-semibold text-primary hover:bg-surface-container disabled:opacity-50">
        {running ? <><Spinner size={16} className="mr-2" />Đang nghe video…</> : "Nhờ AI nghe và tạo phụ đề"}
      </button>
    </section>
  );
}
