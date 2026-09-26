"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { AnalysisErrorCode } from "@/lib/analysis/analysis-error-codes";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";
import { AnalysisErrorView } from "./analysis-error-view";
import { PROGRESS_LABELS, activeStepIndex, initialProgress, progressReducer } from "./analysis-progress-state";

/** Màn S3: mở luồng SSE `/api/analyze/[videoId]`, hiện 3 bước; xong thì tải lại trang để hiện bản xem trước. */
export function AnalyzingScreen({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [state, dispatch] = useReducer(progressReducer, initialProgress);

  useEffect(() => {
    let cancelled = false;
    let source: EventSource | null = null;

    // Server cần phiên (ẩn danh cũng được) để tính hạn mức theo tài khoản: mở phiên xong mới mở luồng.
    ensureAnonymousSession().then((hasSession) => {
      if (cancelled) return;
      if (!hasSession) return dispatch({ type: "error", code: "auth_required" });

      const es = new EventSource(`/api/analyze/${videoId}`);
      source = es;
      let finished = false;
      const on = <T,>(event: string, handler: (data: T) => void) =>
        es.addEventListener(event, (e) => handler(JSON.parse((e as MessageEvent).data)));

      on<{ title: string; channelTitle: string }>("meta", (d) => dispatch({ type: "meta", ...d }));
      on<{ step: "lyrics" | "analysis" }>("step", (d) => dispatch({ type: "step", step: d.step }));
      on("done", () => {
        finished = true;
        es.close();
        dispatch({ type: "done" });
        router.refresh();
      });
      on<{ code: AnalysisErrorCode }>("error", (d) => {
        finished = true;
        es.close();
        dispatch({ type: "error", code: d.code });
      });
      // Mất kết nối trước khi có kết quả: báo lỗi chung (EventSource sẽ tự nối lại nếu không đóng).
      es.onerror = () => {
        if (finished) return;
        finished = true;
        es.close();
        dispatch({ type: "error", code: "server_error" });
      };
    });

    return () => {
      cancelled = true;
      source?.close();
    };
  }, [videoId, attempt, router]);

  const active = activeStepIndex(state.step);

  return (
    <div className="mx-auto max-w-xl py-space-lg text-center">
      <div className="relative mx-auto aspect-video w-full max-w-sm overflow-hidden rounded-2xl bg-surface-container-high">
        <Image src={videoThumbnailUrl(videoId)} alt="" fill sizes="384px" className="object-cover" priority />
      </div>
      <h1 className="mt-space-md font-serif text-headline-md text-on-surface">{state.meta?.title ?? "Đang mở bài hát…"}</h1>
      {state.meta && <p className="mt-1 text-label-md text-on-surface-variant">{state.meta.channelTitle}</p>}

      {state.error ? (
        <AnalysisErrorView
          code={state.error}
          onRetry={() => {
            dispatch({ type: "step", step: "lyrics" });
            setAttempt((n) => n + 1);
          }}
        />
      ) : (
        <>
          <ol aria-live="polite" className="mx-auto mt-space-lg max-w-sm space-y-space-sm text-left">
            {PROGRESS_LABELS.map((label, i) => {
              const done = active > i;
              const current = active === i;
              return (
                <li key={label} className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                  <span className={done ? "text-secondary" : current ? "text-primary" : "text-outline"}>
                    <Icon name={done ? "check_circle" : "hourglass_top"} filled={done} size={22} />
                  </span>
                  <span className={`text-body-md ${current || done ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
                  <span className="sr-only">{done ? "(xong)" : current ? "(đang chạy)" : "(chờ)"}</span>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            onClick={() => router.push("/app")}
            className="mt-space-lg min-h-11 rounded-full px-6 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high"
          >
            Hủy
          </button>
        </>
      )}
    </div>
  );
}
