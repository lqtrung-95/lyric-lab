"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatTimestamp } from "@/lib/preview/preview-format";
import { useYouTubePlayer } from "./use-youtube-player";

export interface SnippetRequest {
  /** Tăng mỗi lần bấm để phát lại cùng một đoạn. */
  nonce: number;
  label: string;
  start: number;
  end: number;
}

const HIDE_DELAY_MS = 900;

/**
 * Phát một đoạn ngắn của video rồi tự dừng (PV-07). Video luôn hiển thị (YouTube yêu cầu player nhìn thấy được,
 * tối thiểu 200×200 px) nên đây là khung nhỏ nổi ở góc/đáy, không phải thanh chỉ có âm thanh.
 * Player chỉ được tạo sau lần bấm ▶ đầu tiên để không tải iframe khi chưa cần.
 */
export function SnippetPlayer({ videoId, request }: { videoId: string; request: SnippetRequest }) {
  const { containerRef, controller, failed } = useYouTubePlayer(videoId);
  // Trạng thái gắn với nonce của lần bấm: bấm ▶ lần mới thì tự hiện lại và tính giờ từ đầu, không cần effect đặt lại.
  const [hiddenNonce, setHiddenNonce] = useState<number | null>(null);
  const [tick, setTick] = useState({ nonce: request.nonce, time: request.start });
  const visible = hiddenNonce !== request.nonce;
  const time = tick.nonce === request.nonce ? tick.time : request.start;

  useEffect(() => {
    if (!controller) return;
    controller.playRange(request.start, request.end);
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const poll = setInterval(() => {
      const t = controller.getCurrentTime();
      setTick({ nonce: request.nonce, time: t });
      if (t >= request.end) {
        controller.pause();
        clearInterval(poll);
        hideTimer = setTimeout(() => setHiddenNonce(request.nonce), HIDE_DELAY_MS);
      }
    }, 100);
    return () => {
      clearInterval(poll);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [controller, request]);

  const progress = Math.min(100, Math.max(0, ((time - request.start) / (request.end - request.start)) * 100));

  return (
    <section
      aria-label="Nghe thử đoạn"
      hidden={!visible}
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-surface-container-lowest p-3 shadow-[0_-4px_24px_rgba(30,26,22,0.15)] md:inset-x-auto md:bottom-4 md:right-4 md:w-[356px] md:rounded-2xl"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-label-md text-on-surface">
          <span className="text-on-surface-variant">Đoạn mẫu: </span>{request.label}
          <span className="ml-2 font-mono text-primary">{formatTimestamp(time)}</span>
        </p>
        <button type="button" aria-label="Đóng khung nghe thử" onClick={() => { controller?.pause(); setHiddenNonce(request.nonce); }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
          <Icon name="close" size={20} />
        </button>
      </div>
      <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-lg bg-inverse-surface [&_iframe]:h-full [&_iframe]:w-full" />
      {failed ? (
        <p role="alert" className="mt-2 text-label-md text-error">Không tải được video. Bạn thử mở lại sau nhé.</p>
      ) : (
        <div aria-hidden="true" className="mt-2 h-1 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full bg-primary-container transition-[width] duration-100" style={{ width: `${progress}%` }} />
        </div>
      )}
    </section>
  );
}
