"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { MAX_ADDED_VIDEO_SECONDS, MAX_VIDEOS_PER_USER_PER_DAY } from "@/lib/video/add-video-limits";
import { decodeBookmarkletHash } from "@/lib/video/bookmarklet";
import { BookmarkletInstall } from "./bookmarklet-install";

const noop = () => () => undefined;
const readHash = () => window.location.hash;

const ERRORS: Record<string, string> = {
  invalid_video: "Link chưa đúng. Dán link video YouTube, ví dụ https://www.youtube.com/watch?v=...",
  invalid_captions: "Chưa đọc được phụ đề đã dán. Cần có mốc thời gian (file SRT/VTT, hoặc văn bản copy từ \"Hiện bản chép lời\" của YouTube).",
  video_not_found: "Không tìm thấy video này (có thể riêng tư hoặc đã bị xóa).",
  too_long: `Video dài quá ${MAX_ADDED_VIDEO_SECONDS / 60} phút, hiện chưa hỗ trợ.`,
  too_short: "Video quá ngắn để luyện (dưới 30 giây).",
  unavailable: "Video này hiện không có trong thư viện.",
  not_chinese: "Phụ đề này không phải tiếng Trung (YouTube hay mặc định sang ngôn ngữ của bạn). Đổi ngôn ngữ của bản chép lời sang tiếng Trung rồi gửi lại.",
  captions_required: "Cần có phụ đề tiếng Trung của video. Dán phụ đề vào ô bên dưới hoặc dùng dấu trang trên máy tính.",
  no_chinese_captions: "Video này không có phụ đề tiếng Trung. Dán phụ đề vào ô bên dưới nếu bạn có.",
  fetch_unavailable: "Chưa lấy tự động được phụ đề lúc này. Dán phụ đề vào ô bên dưới nhé.",
  user_limit: `Hôm nay bạn đã thêm đủ ${MAX_VIDEOS_PER_USER_PER_DAY} video. Quay lại vào ngày mai nhé.`,
  global_limit: "Hôm nay mọi người đã thêm rất nhiều video, hãy quay lại vào ngày mai nhé.",
  unauthorized: "Cần mở lại trang để có phiên đăng nhập, rồi thử lại.",
  server_error: "Có lỗi ở máy chủ. Thử lại sau nhé.",
};
const skipMessage = (reason: string) => (reason === "not_embeddable" ? "Chủ video không cho nhúng, nên không thêm được." : "Chưa tạo được bài từ phụ đề này.");

/**
 * Thêm video tiếng Trung (podcast, vlog...) để chép chính tả và shadowing. Chỉ cần dán link là máy chủ tự lấy phụ đề (nếu có cấu hình dịch vụ lấy phụ đề);
 * ô dán phụ đề và hướng dẫn dấu trang luôn hiện sẵn cho người cần. Dấu trang gửi bản chép lời sang qua phần `#` của địa chỉ và trang tự gửi luôn
 * (người dùng đã chủ động bấm dấu trang, không cần bấm thêm). Video thêm xong dùng chung cho mọi người.
 */
export function AddVideoScreen() {
  const router = useRouter();
  const hash = useSyncExternalStore(noop, readHash, () => "");
  const received = useMemo(() => decodeBookmarkletHash(hash), [hash]);
  const [video, setVideo] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const videoValue = video ?? received?.v ?? "";
  const captionsValue = captions ?? received?.t ?? "";
  const canSubmit = !busy && videoValue.trim().length > 0;

  async function send(video: string, captionText: string, viText?: string) {
    setBusy(true);
    setMessage(null);
    const body = { video, ...(captionText.trim() ? { captions: captionText } : {}), ...(viText ? { viCaptions: viText } : {}) };
    // Trang này chưa tự tạo phiên như các màn khác; người mở thẳng từ dấu trang có thể chưa có phiên nên bảo đảm có trước khi gửi (và thử lại một lần khi 401).
    const post = () => fetch("/api/videos/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    try {
      await ensureAnonymousSession();
      let res = await post();
      if (res.status === 401 && (await ensureAnonymousSession())) res = await post();
      const data = (await res.json().catch(() => ({}))) as { kind?: string; videoId?: string; reason?: string; error?: string };
      if (res.ok && (data.kind === "added" || data.kind === "exists") && data.videoId) { router.push(`/video/${data.videoId}`); return; }
      setMessage(res.ok ? skipMessage(data.reason ?? "") : (ERRORS[data.error ?? ""] ?? ERRORS.server_error));
    } catch {
      setMessage(ERRORS.server_error);
    }
    setBusy(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Phụ đề tiếng Việt của dấu trang chỉ khớp với bản tiếng Trung đi cùng; người dùng sửa ô tiếng Trung thì bỏ nó, để AI dịch.
    if (canSubmit) void send(videoValue, captionsValue, captions === null ? received?.vt : undefined);
  }

  // Bản chép lời đến từ dấu trang: gửi luôn một lần, hẹn bằng timer để không đặt state ngay trong effect.
  const sendRef = useRef(send);
  useEffect(() => { sendRef.current = send; });
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!received || autoStarted.current) return;
    autoStarted.current = true;
    const timer = setTimeout(() => void sendRef.current(received.v, received.t, received.vt), 0);
    return () => clearTimeout(timer);
  }, [received]);

  return (
    <div className="mx-auto max-w-2xl space-y-space-md">
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Thêm video của bạn</h1>
        <p className="mt-1 text-body-lg text-on-surface-variant">Dán link video tiếng Trung (podcast, vlog...) để luyện chép chính tả và nói theo. Video thêm vào sẽ hiện cho mọi người trong mục Video. Mỗi người thêm tối đa {MAX_VIDEOS_PER_USER_PER_DAY} video mỗi ngày, mỗi video dài tối đa {MAX_ADDED_VIDEO_SECONDS / 60} phút.</p>
      </header>
      <form onSubmit={submit} className="space-y-space-md">
        <label className="block space-y-1">
          <span className="text-label-md font-semibold text-on-surface">Link video YouTube</span>
          <input type="text" inputMode="url" autoComplete="off" value={videoValue} onChange={(e) => setVideo(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
            className="min-h-11 w-full rounded-full bg-surface-container-high px-4 text-body-md text-on-surface" />
        </label>
        <label className="block space-y-1">
          <span className="text-label-md font-semibold text-on-surface">Phụ đề tiếng Trung <span className="font-normal text-on-surface-variant">(bỏ trống nếu muốn thử lấy tự động)</span></span>
          {received && <p role="status" className="text-label-md text-primary">Đã nhận bản chép lời từ YouTube{received.vt ? " (kèm phụ đề tiếng Việt)" : ""}.</p>}
          <textarea value={captionsValue} onChange={(e) => setCaptions(e.target.value)} rows={6} placeholder={"Dán file SRT/VTT, hoặc văn bản copy từ \"Hiện bản chép lời\" của YouTube:\n0:00\n大家好\n0:05\n欢迎收听..."}
            className="w-full rounded-2xl bg-surface-container-high p-3 text-body-md text-on-surface" />
        </label>
        {busy && <p role="status" className="text-label-md text-on-surface-variant">Đang xử lý video, bạn đừng đóng trang này nhé.</p>}
        {message && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{message}</p>}
        <button type="submit" disabled={!canSubmit} className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">
          {busy ? <><Spinner size={16} className="mr-2" />Đang đọc phụ đề và dịch, có thể mất tới một phút…</> : "Thêm video"}
        </button>
      </form>
      <BookmarkletInstall />
    </div>
  );
}
