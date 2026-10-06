"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import type { AdminLessonDetail } from "@/lib/video/video-repo";
import type { LessonLine, LessonStatus } from "@/lib/video/video-lesson-types";
import { STATUS_LABEL, patchVideo } from "./video-admin-actions";
import { VideoStatusButtons } from "./video-status-buttons";

function LineRow({ videoId, line, onSaved }: { videoId: string; line: LessonLine; onSaved: (idx: number, translation: string | null) => void }) {
  const [value, setValue] = useState(line.translation ?? "");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const changed = value.trim() !== (line.translation ?? "");

  async function save() {
    setState("saving");
    const ok = await patchVideo(videoId, { action: "edit_translation", idx: line.idx, translation: value });
    if (!ok) return setState("error");
    setState("idle");
    onSaved(line.idx, value.trim() === "" ? null : value.replace(/\s+/g, " ").trim());
  }

  return (
    <li className={`rounded-xl p-space-sm ${line.translation ? "bg-surface-container-lowest" : "bg-error-container/30"}`}>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-label-sm font-semibold text-on-surface-variant">{String(line.idx + 1).padStart(2, "0")} · {line.start.toFixed(1)}s</span>
        <span lang="zh" className="font-serif text-body-lg text-on-surface">{line.text}</span>
      </div>
      <p className="text-label-md text-on-surface-variant">{line.pinyin}</p>
      <label className="mt-1 block">
        <span className="sr-only">Bản dịch dòng {line.idx + 1}</span>
        <textarea
          value={value} onChange={(e) => setValue(e.target.value)} rows={2} maxLength={500} placeholder="Chưa có bản dịch"
          className="w-full rounded-lg bg-surface-container-high px-3 py-2 text-body-md text-on-surface outline-none ring-2 ring-transparent focus:ring-primary"
        />
      </label>
      <div className="mt-1 flex items-center gap-2">
        <button type="button" disabled={!changed || state === "saving"} onClick={() => void save()} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary disabled:opacity-50">
          <Icon name="check" size={18} />{state === "saving" ? "Đang lưu…" : "Lưu bản dịch"}
        </button>
        {state === "error" && <span role="alert" className="text-label-md text-error">Chưa lưu được.</span>}
      </div>
    </li>
  );
}

/** Xem trước bản chép của một video (mọi trạng thái), rà và sửa bản dịch từng dòng, duyệt/ẩn/xóa. */
export function VideoAdminDetailScreen({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<AdminLessonDetail | null | "missing">(null);
  const [onlyMissing, setOnlyMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/videos/${videoId}`, { cache: "no-store" })
      .then(async (r): Promise<AdminLessonDetail | "missing"> => (r.ok ? ((await r.json()) as AdminLessonDetail) : "missing"))
      .then((v) => { if (!cancelled) setLesson(v); })
      .catch(() => { if (!cancelled) setLesson("missing"); });
    return () => { cancelled = true; };
  }, [videoId]);

  const missing = useMemo(() => (lesson && lesson !== "missing" ? lesson.lines.filter((l) => !l.translation).length : 0), [lesson]);

  if (lesson === null) return <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tải…</p>;
  if (lesson === "missing") return <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">Không tìm thấy video này.</p>;

  const setStatus = (status: LessonStatus) => setLesson({ ...lesson, status });
  const onSaved = (idx: number, translation: string | null) =>
    setLesson({ ...lesson, lines: lesson.lines.map((l) => (l.idx === idx ? { ...l, translation } : l)) });
  const shown = onlyMissing ? lesson.lines.filter((l) => !l.translation) : lesson.lines;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-md">
      <Link href="/admin/videos" className="inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline"><Icon name="arrow_back" size={18} />Quản lý video</Link>
      <div>
        <h1 lang="zh" className="font-serif text-headline-md">{lesson.title}</h1>
        <p className="text-label-md text-on-surface-variant">{lesson.channelTitle} · {STATUS_LABEL[lesson.status]} · {lesson.lines.length} dòng · {missing} dòng thiếu bản dịch</p>
      </div>
      <VideoStatusButtons videoId={videoId} status={lesson.status} onStatus={setStatus} onDeleted={() => router.replace("/admin/videos")} />
      {lesson.status === "listed" && <Link href={`/video/${videoId}`} className="text-label-md font-medium text-primary hover:underline">Mở trang xem như người dùng</Link>}
      <label className="inline-flex min-h-11 items-center gap-2 text-label-md text-on-surface">
        <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} className="h-5 w-5 accent-primary" />
        Chỉ hiện dòng thiếu bản dịch
      </label>
      <ul className="flex flex-col gap-space-sm">
        {shown.map((l) => <LineRow key={l.idx} videoId={videoId} line={l} onSaved={onSaved} />)}
      </ul>
    </div>
  );
}
