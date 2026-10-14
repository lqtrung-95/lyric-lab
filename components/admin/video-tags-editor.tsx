"use client";

import { useState } from "react";
import { MAX_TAGS_PER_VIDEO, VIDEO_TAGS, type VideoTagId } from "@/lib/video/video-tags";

/** Admin chọn tối đa 3 thẻ chủ đề cho video (AI đã gán sẵn lúc nạp; sửa khi gán chưa đúng). Lưu qua PATCH `set_tags`. */
export function VideoTagsEditor({ videoId, initial }: { videoId: string; initial: VideoTagId[] }) {
  const [tags, setTags] = useState<VideoTagId[]>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function toggle(id: VideoTagId) {
    setState("idle");
    setTags((cur) => (cur.includes(id) ? cur.filter((t) => t !== id) : cur.length >= MAX_TAGS_PER_VIDEO ? cur : [...cur, id]));
  }
  async function save() {
    setState("saving");
    try {
      const res = await fetch(`/api/admin/videos/${videoId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set_tags", tags }) });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <section aria-label="Thẻ chủ đề" className="space-y-2 rounded-xl bg-surface-container-low p-3">
      <p className="text-label-md font-semibold text-on-surface">Thẻ chủ đề <span className="font-normal text-on-surface-variant">(tối đa {MAX_TAGS_PER_VIDEO}, dùng để lọc ở trang Video)</span></p>
      <div role="group" aria-label="Chọn thẻ" className="flex flex-wrap gap-2">
        {VIDEO_TAGS.map((t) => (
          <button key={t.id} type="button" aria-pressed={tags.includes(t.id)} onClick={() => toggle(t.id)}
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-label-md font-medium ${tags.includes(t.id) ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}>{t.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={state === "saving"} onClick={() => void save()} className="min-h-11 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">{state === "saving" ? "Đang lưu…" : "Lưu thẻ"}</button>
        <p role="status" className={`text-label-sm ${state === "error" ? "text-error" : "text-on-surface-variant"}`}>
          {state === "saved" ? "Đã lưu." : state === "error" ? "Chưa lưu được (đã chạy migration cột tags chưa?)." : ""}
        </p>
      </div>
    </section>
  );
}
