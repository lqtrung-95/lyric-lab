"use client";

import { useEffect, useRef, useState } from "react";
import { useChatAccount } from "@/components/chat/use-chat-account";
import { Spinner } from "@/components/ui/spinner";
import { signInGoogle } from "@/lib/auth/account-client";
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
  account_required: "Cần đăng nhập Google để nhờ AI nghe video.",
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
 * Hiện khi video không có phụ đề tiếng Trung: nhờ AI nghe video (Gemini đọc thẳng link YouTube, máy chủ ta không tải gì) rồi chép lời kèm mốc giờ.
 * Chia video thành các đoạn ~2 phút, gọi từng đoạn (mỗi lượt gọi nằm trong 60 giây của máy chủ). Xong thì trao các dòng cho nơi gọi để gửi sang /api/videos/add.
 * `autoStart`: tự chạy ngay khi đã biết người dùng đăng nhập Google (người dùng chỉ dán link, không phải tìm nút); chưa đăng nhập thì mời đăng nhập.
 */
export function AutoTranscribeOffer({ video, disabled, autoStart, onLines, onExists }: { video: string; disabled: boolean; autoStart: boolean; onLines: (lines: CaptionLine[]) => void; onExists: () => void }) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = progress !== null;
  const registered = useChatAccount();
  const [signingIn, setSigningIn] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signIn() {
    setSigningIn(true);
    setError(await signInGoogle());
    setSigningIn(false);
  }

  async function start() {
    setError(null);
    setFailed(false);
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
      setFailed(true);
    }
    setProgress(null);
  }

  // Hẹn bằng timer để không đặt state ngay trong effect; `start` đọc props mới nhất qua ref.
  const startRef = useRef(start);
  useEffect(() => { startRef.current = start; });
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoStart || registered !== true || autoStarted.current) return;
    autoStarted.current = true;
    const timer = setTimeout(() => void startRef.current(), 0);
    return () => clearTimeout(timer);
  }, [autoStart, registered]);

  return (
    <section aria-label="Nhận dạng giọng nói bằng AI" className="space-y-2 rounded-2xl bg-surface-container-low p-4">
      <p className="text-label-md font-semibold text-on-surface">Video này chưa có phụ đề tiếng Trung</p>
      <p className="text-label-md text-on-surface-variant">{autoStart ? "Chúng tôi sẽ nhờ AI nghe giọng nói và tạo phụ đề" : "Bạn có thể nhờ AI nghe giọng nói và tạo phụ đề"}: việc này mất thời gian hơn (vài phút), có thể không chính xác, và bản chép sẽ gắn nhãn &quot;nhận dạng tự động&quot;. Video dài tối đa {MAX_ASR_VIDEO_SECONDS / 60} phút.</p>
      {running && <p role="status" className="flex items-center text-label-md text-primary"><Spinner size={16} className="mr-2 shrink-0" /><span>AI đang nghe video… đã xong {progress.done}/{progress.total} đoạn. Bạn đừng đóng trang này nhé.</span></p>}
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      {registered === false ? (
        <>
          <p className="text-label-md text-on-surface-variant">Việc này tốn tài nguyên AI nên chỉ dành cho tài khoản đăng nhập Google (thẻ ôn và tiến độ học của bạn được giữ nguyên).</p>
          <button type="button" onClick={() => void signIn()} disabled={signingIn} className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-60">
            {signingIn ? "Đang chuyển sang Google…" : "Đăng nhập Google để dùng"}
          </button>
        </>
      ) : (
        // Đang tự chạy thì không cần nút; chỉ hiện nút khi chạy tay (chưa bấm) hoặc để thử lại sau lỗi.
        (!autoStart || failed) && !running && (
          <button type="button" onClick={() => void start()} disabled={disabled || registered === undefined}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-outline px-6 text-label-md font-semibold text-primary hover:bg-surface-container disabled:opacity-50">
            {failed ? "Thử lại" : "Nhờ AI nghe và tạo phụ đề"}
          </button>
        )
      )}
    </section>
  );
}
