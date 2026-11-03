"use client";

import { useEffect, useState } from "react";

interface Source { id: string; channelId: string; title: string; owned: boolean; licenseNote: string | null; watching: boolean; videoCount: number }
type Patch = { watching?: boolean; licenseNote?: string | null };
type Loaded = Source[] | "migration_missing" | "error" | null;

async function patchSource(id: string, patch: Patch): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/video-sources", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Danh sách kênh nguồn (VD-04): bật "Theo dõi" cho kênh nào cần quét video mới, ghi chú giấy phép. Nút tìm video mới gom video chưa có của mọi
 * kênh đang theo dõi vào hàng đợi nạp ở cha. Kênh xuất hiện ở đây sau lần nạp đầu tiên của nó.
 */
export function VideoSourcesPanel({ busy, reloadKey, onRunWatched }: { busy: boolean; reloadKey: number; onRunWatched: () => void }) {
  const [sources, setSources] = useState<Loaded>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const done = (value: Loaded) => { if (!cancelled) setSources(value); };
    fetch("/api/admin/video-sources", { cache: "no-store" })
      .then(async (res) => (res.status === 409 ? done("migration_missing") : done(res.ok ? ((await res.json()) as { sources: Source[] }).sources : "error")))
      .catch(() => done("error"));
    return () => { cancelled = true; };
  }, [reloadKey]);

  const update = async (s: Source, patch: Patch) => {
    setError(null);
    if (!(await patchSource(s.id, patch))) return setError("Chưa lưu được, thử lại nhé.");
    setSources((list) => (Array.isArray(list) ? list.map((x) => (x.id === s.id ? { ...x, ...patch } : x)) : list));
  };

  const watched = Array.isArray(sources) ? sources.filter((s) => s.watching).length : 0;
  return (
    <div className="mt-space-md border-t border-outline-variant pt-space-sm">
      <h3 className="text-label-lg font-semibold text-on-surface">Kênh nguồn</h3>
      {sources === null && <p role="status" className="text-label-md text-on-surface-variant">Đang tải…</p>}
      {sources === "error" && <p role="alert" className="text-label-md text-error">Chưa tải được danh sách kênh.</p>}
      {sources === "migration_missing" && (
        <p role="alert" className="text-label-md text-error">Chưa chạy migration <code>20261101000001_video_sources_watching.sql</code> nên chưa dùng được danh sách theo dõi.</p>
      )}
      {Array.isArray(sources) && (
        <>
          <p className="text-label-md text-on-surface-variant">{sources.length === 0 ? "Chưa có kênh nào. Kênh hiện ở đây sau lần nạp đầu tiên." : "Bật “Theo dõi” cho kênh muốn quét video mới."}</p>
          {error && <p role="alert" className="text-label-md text-error">{error}</p>}
          <ul className="mt-1 divide-y divide-outline-variant">
            {sources.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                <label className="inline-flex min-h-11 items-center gap-2 text-label-md text-on-surface">
                  <input type="checkbox" checked={s.watching} onChange={(e) => void update(s, { watching: e.target.checked })} className="h-5 w-5 accent-primary" />
                  <span className="sr-only">Theo dõi </span><span lang="zh">{s.title}</span>
                </label>
                <span className="text-label-sm text-on-surface-variant">{s.videoCount} video{s.owned ? " · kênh của tôi" : ""}</span>
                <label className="min-w-40 flex-1">
                  <span className="sr-only">Ghi chú giấy phép của {s.title}</span>
                  <input defaultValue={s.licenseNote ?? ""} maxLength={300} placeholder="Ghi chú giấy phép (CC BY, đã xin phép…)" autoComplete="off"
                    onBlur={(e) => { const v = e.target.value.trim(); if (v !== (s.licenseNote ?? "")) void update(s, { licenseNote: v === "" ? null : v }); }}
                    className="min-h-11 w-full rounded-full bg-surface-container-high px-4 text-label-md text-on-surface outline-none ring-2 ring-transparent focus:ring-primary" />
                </label>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onRunWatched} disabled={busy || watched === 0} className="mt-1 min-h-11 rounded-full bg-surface-container-high px-5 text-label-md font-semibold text-on-surface disabled:opacity-50">
            Tìm video mới của {watched} kênh đang theo dõi
          </button>
        </>
      )}
    </div>
  );
}
