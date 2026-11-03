"use client";

import { useCallback, useRef, useState } from "react";
import type { SkipReason } from "@/lib/video/ingest-video";
import { MAX_BLOCKED_IN_ROW, RETRY_WAITS_MS, summarizeQueue, type QueueStatus } from "@/lib/video/ingest-queue";
import type { PlanVideo } from "@/lib/video/plan-videos";
import type { SearchDuration } from "@/lib/video/video-discovery";

export type { PlanVideo };
export interface QueueItem { video: PlanVideo; status: QueueStatus }
/** Danh sách chờ nạp: `label` là nguồn của nó (tên kênh, từ khóa tìm, hoặc các kênh theo dõi). */
interface Plan { label: string; videos: PlanVideo[] }

const WATCHED_RECENT = 30;
const waiting = (videos: PlanVideo[]): QueueItem[] => videos.filter((v) => !v.exists && v.embeddable).map((video) => ({ video, status: { state: "waiting" } }));
const postJson = (url: string, body: unknown) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

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

  /** Chạy một bước lấy danh sách; lỗi thì hiện `onError(mã lỗi)`. */
  const load = useCallback(async (fetchPlan: () => Promise<Plan>) => {
    setFinding(true);
    setMessage(null);
    setPlan(null);
    setItems([]);
    try {
      const p = await fetchPlan();
      setPlan(p);
      setItems(waiting(p.videos));
    } catch (e) {
      setMessage((e as Error).message || "Chưa tìm được video, thử lại sau nhé.");
    } finally {
      setFinding(false);
    }
  }, []);

  const find = useCallback((handle: string) => load(async () => {
    const res = await postJson("/api/admin/videos/ingest/plan", { handle });
    if (!res.ok) {
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
      throw new Error(code === "invalid_handle" ? "Tên kênh chưa hợp lệ." : code === "channel_not_found" ? "Không tìm thấy kênh này." : "");
    }
    const p = (await res.json()) as { channel: { title: string }; videos: PlanVideo[] };
    return { label: p.channel.title, videos: p.videos };
  }), [load]);

  const search = useCallback((query: string, duration: SearchDuration) => load(async () => {
    const res = await postJson("/api/admin/videos/search", { query, duration });
    if (!res.ok) {
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
      throw new Error(code === "quota" ? "Đã hết hạn mức YouTube Data API hôm nay (mỗi lần tìm tốn 100 đơn vị). Thử lại vào ngày mai." : code === "invalid_query" ? "Từ khóa chưa hợp lệ." : "");
    }
    return { label: `Creative Commons, "${query}"`, videos: ((await res.json()) as { videos: PlanVideo[] }).videos };
  }), [load]);

  /** Gom video chưa nạp của mọi kênh đang theo dõi (mỗi kênh vài chục video gần nhất) vào một hàng đợi. */
  const findWatched = useCallback(() => load(async () => {
    const list = await fetch("/api/admin/video-sources", { cache: "no-store" });
    if (!list.ok) throw new Error("");
    const channels = ((await list.json()) as { sources: { channelId: string; watching: boolean }[] }).sources.filter((s) => s.watching);
    if (channels.length === 0) throw new Error("Chưa theo dõi kênh nào.");
    const videos = new Map<string, PlanVideo>();
    for (const c of channels) {
      const res = await postJson("/api/admin/videos/ingest/plan", { channelId: c.channelId, limit: WATCHED_RECENT });
      if (!res.ok) throw new Error("Chưa quét được hết các kênh, thử lại sau nhé.");
      for (const v of ((await res.json()) as { videos: PlanVideo[] }).videos) videos.set(v.videoId, v);
    }
    return { label: `${channels.length} kênh đang theo dõi`, videos: [...videos.values()] };
  }), [load]);

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
  return { plan, items, finding, running, message, summary: summarizeQueue(items), find, search, findWatched, run, stop };
}
