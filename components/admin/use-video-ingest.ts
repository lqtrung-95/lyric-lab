"use client";

import { useCallback, useRef, useState } from "react";
import type { SkipReason } from "@/lib/video/ingest-video";
import { MAX_BLOCKED_IN_ROW, RETRY_WAITS_MS, summarizeQueue, type QueueStatus } from "@/lib/video/ingest-queue";

export interface PlanVideo { videoId: string; title: string; durationSec: number; embeddable: boolean; exists: boolean }
export interface QueueItem { video: PlanVideo; status: QueueStatus }
interface Plan { channel: { id: string; title: string }; videos: PlanVideo[] }

type IngestResult =
  | { ok: true; outcome: { kind: "ingested"; lineCount: number; translatedLineCount: number } | { kind: "skipped"; reason: SkipReason } }
  | { ok: false; blocked: boolean };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const PAUSE_BETWEEN_MS = 2000;

async function ingestOne(videoId: string, owned: boolean): Promise<IngestResult> {
  try {
    const res = await fetch("/api/admin/videos/ingest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId, owned }) });
    if (res.ok) return { ok: true, outcome: await res.json() };
    return { ok: false, blocked: res.status === 503 };
  } catch {
    return { ok: false, blocked: false };
  }
}

/**
 * Hàng đợi nạp video từ một kênh qua API quản trị (chạy trên server, không phụ thuộc IP máy bạn): "Tìm video" lấy danh sách, "Nạp" gọi
 * lần lượt từng video chưa có. Video bị YouTube chặn tạm được nghỉ rồi thử lại; nhiều video liền bị chặn thì dừng và báo để chạy lại sau.
 */
export function useVideoIngest(onIngested: () => void) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [finding, setFinding] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const cancelled = useRef(false);

  const setStatus = useCallback((videoId: string, status: QueueStatus) => setItems((list) => list.map((i) => (i.video.videoId === videoId ? { ...i, status } : i))), []);

  const find = useCallback(async (handle: string) => {
    setFinding(true);
    setMessage(null);
    setPlan(null);
    setItems([]);
    try {
      const res = await fetch("/api/admin/videos/ingest/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handle }) });
      if (!res.ok) {
        const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
        setMessage(code === "invalid_handle" ? "Tên kênh chưa hợp lệ." : code === "channel_not_found" ? "Không tìm thấy kênh này." : "Chưa tìm được video, thử lại sau nhé.");
        return;
      }
      const p = (await res.json()) as Plan;
      setPlan(p);
      setItems(p.videos.filter((v) => !v.exists && v.embeddable).map((video) => ({ video, status: { state: "waiting" } })));
    } catch {
      setMessage("Chưa tìm được video, thử lại sau nhé.");
    } finally {
      setFinding(false);
    }
  }, []);

  const run = useCallback(async (owned: boolean, onlyFailed = false) => {
    cancelled.current = false;
    setRunning(true);
    setMessage(null);
    let blockedInRow = 0;
    const todo = items.filter((i) => (onlyFailed ? i.status.state === "failed" : i.status.state === "waiting"));
    for (const { video } of todo) {
      if (cancelled.current) break;
      let result: IngestResult = { ok: false, blocked: false };
      for (let attempt = 0; attempt <= RETRY_WAITS_MS.length; attempt++) {
        setStatus(video.videoId, { state: "running", note: attempt > 0 ? `Thử lại lần ${attempt}` : undefined });
        result = await ingestOne(video.videoId, owned);
        if (result.ok || !result.blocked || attempt === RETRY_WAITS_MS.length || cancelled.current) break;
        setStatus(video.videoId, { state: "running", note: `YouTube đang chặn tạm, nghỉ ${RETRY_WAITS_MS[attempt] / 1000}s rồi thử lại` });
        await sleep(RETRY_WAITS_MS[attempt]);
      }
      if (result.ok) {
        blockedInRow = 0;
        const o = result.outcome;
        setStatus(video.videoId, o.kind === "ingested" ? { state: "done", lineCount: o.lineCount, translatedLineCount: o.translatedLineCount } : { state: "skipped", reason: o.reason });
        if (o.kind === "ingested") onIngested();
      } else {
        setStatus(video.videoId, { state: "failed", blocked: result.blocked });
        if (result.blocked && ++blockedInRow >= MAX_BLOCKED_IN_ROW) {
          setMessage("YouTube vẫn đang chặn tạm việc tải phụ đề nên đã dừng. Chờ ít phút rồi bấm \"Thử lại video lỗi\".");
          break;
        }
      }
      await sleep(PAUSE_BETWEEN_MS);
    }
    setRunning(false);
  }, [items, onIngested, setStatus]);

  const stop = useCallback(() => { cancelled.current = true; }, []);
  return { plan, items, finding, running, message, summary: summarizeQueue(items), find, run, stop };
}
