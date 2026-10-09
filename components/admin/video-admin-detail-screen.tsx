"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import type { AdminTranslationReport } from "@/lib/video/translation-report-repo";
import type { AdminLessonDetail } from "@/lib/video/video-repo";
import type { LessonLine, LessonStatus } from "@/lib/video/video-lesson-types";
import { STATUS_LABEL, patchVideo } from "./video-admin-actions";
import { VideoStatusButtons } from "./video-status-buttons";

type AdminDetail = AdminLessonDetail & { reports?: AdminTranslationReport[] };

const BADGE = "rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant";

/** Khôi phục bản dịch cũ của một báo cáo "AI đã dịch lại". 409 nghĩa là dòng đã được sửa/khôi phục trước đó. */
async function restoreFromReport(videoId: string, reportId: number): Promise<"ok" | "unchanged" | "error"> {
  try {
    const res = await fetch(`/api/admin/videos/${videoId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restore_translation", reportId }) });
    return res.ok ? "ok" : res.status === 409 ? "unchanged" : "error";
  } catch {
    return "error";
  }
}

function LineRow({ videoId, line, reports, onSaved, onRestored }: {
  videoId: string; line: LessonLine; reports: AdminTranslationReport[];
  onSaved: (idx: number, translation: string | null) => void; onRestored: (idx: number, translation: string) => void;
}) {
  const [value, setValue] = useState(line.translation ?? "");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [restoreState, setRestoreState] = useState<"idle" | "saving" | "unchanged" | "error">("idle");
  // Báo cáo "AI đã dịch lại" mới nhất còn bản cũ: chỉ khôi phục được khi dòng vẫn đang là bản AI.
  const restorable = line.translationBy === "ai" ? reports.find((r) => r.outcome === "retranslated" && r.oldTranslation) : undefined;
  const changed = value.trim() !== (line.translation ?? "");

  async function save() {
    setState("saving");
    const ok = await patchVideo(videoId, { action: "edit_translation", idx: line.idx, translation: value });
    if (!ok) return setState("error");
    setState("idle");
    onSaved(line.idx, value.trim() === "" ? null : value.replace(/\s+/g, " ").trim());
  }

  async function restore() {
    if (!restorable) return;
    setRestoreState("saving");
    const result = await restoreFromReport(videoId, restorable.id);
    if (result === "ok") { setRestoreState("idle"); setValue(restorable.oldTranslation!); onRestored(line.idx, restorable.oldTranslation!); return; }
    setRestoreState(result);
  }

  return (
    <li className={`rounded-xl p-space-sm ${line.translation ? "bg-surface-container-lowest" : "bg-error-container/30"}`}>
      {(reports.length > 0 || line.translationBy) && (
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          {reports.length > 0 && <span className={`${BADGE} font-semibold text-error`}>Bị báo {reports.length} lần</span>}
          {line.translationBy === "ai" && <span className={BADGE}>AI đã dịch lại</span>}
          {line.translationBy === "admin" && <span className={BADGE}>Admin đã xác nhận</span>}
        </div>
      )}
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
      {restorable && (
        <div className="mt-2 rounded-lg bg-surface-container p-space-sm">
          <p className="text-label-sm text-on-surface-variant">Bản dịch trước khi AI dịch lại:</p>
          <p className="text-body-md text-on-surface">{restorable.oldTranslation}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button type="button" disabled={restoreState === "saving"} onClick={() => void restore()} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-surface-container-high px-4 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest disabled:opacity-50">
              <Icon name="undo" size={18} />{restoreState === "saving" ? "Đang khôi phục…" : "Khôi phục bản cũ"}
            </button>
            {restoreState === "unchanged" && <span role="alert" className="text-label-md text-error">Dòng này đã được sửa trước đó, hãy tải lại trang.</span>}
            {restoreState === "error" && <span role="alert" className="text-label-md text-error">Chưa khôi phục được.</span>}
          </div>
        </div>
      )}
    </li>
  );
}

/** Xem trước bản chép của một video (mọi trạng thái), rà và sửa bản dịch từng dòng, duyệt/ẩn/xóa. */
export function VideoAdminDetailScreen({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<AdminDetail | null | "missing">(null);
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [onlyReported, setOnlyReported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/videos/${videoId}`, { cache: "no-store" })
      .then(async (r): Promise<AdminDetail | "missing"> => (r.ok ? ((await r.json()) as AdminDetail) : "missing"))
      .then((v) => { if (!cancelled) setLesson(v); })
      .catch(() => { if (!cancelled) setLesson("missing"); });
    return () => { cancelled = true; };
  }, [videoId]);

  const missing = useMemo(() => (lesson && lesson !== "missing" ? lesson.lines.filter((l) => !l.translation).length : 0), [lesson]);
  // Báo cáo gom theo dòng để mỗi dòng biết mình bị báo mấy lần và có bản cũ nào để khôi phục.
  const reportsByLine = useMemo(() => {
    const map = new Map<number, AdminTranslationReport[]>();
    if (lesson && lesson !== "missing") for (const r of lesson.reports ?? []) map.set(r.lineIdx, [...(map.get(r.lineIdx) ?? []), r]);
    return map;
  }, [lesson]);

  if (lesson === null) return <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tải…</p>;
  if (lesson === "missing") return <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">Không tìm thấy video này.</p>;

  const setStatus = (status: LessonStatus) => setLesson({ ...lesson, status });
  const onSaved = (idx: number, translation: string | null) =>
    setLesson({ ...lesson, lines: lesson.lines.map((l) => (l.idx === idx ? { ...l, translation, translationBy: translation ? ("admin" as const) : undefined } : l)) });
  const onRestored = (idx: number, translation: string) =>
    setLesson({ ...lesson, lines: lesson.lines.map((l) => (l.idx === idx ? { ...l, translation, translationBy: "admin" as const } : l)) });
  const shown = lesson.lines.filter((l) => (!onlyMissing || !l.translation) && (!onlyReported || reportsByLine.has(l.idx)));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-md">
      <Link href="/admin/videos" className="inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline"><Icon name="arrow_back" size={18} />Quản lý video</Link>
      <div>
        <h1 lang="zh" className="font-serif text-headline-md">{lesson.title}</h1>
        <p className="text-label-md text-on-surface-variant">{lesson.channelTitle} · {STATUS_LABEL[lesson.status]} · {lesson.lines.length} dòng · {missing} dòng thiếu bản dịch{reportsByLine.size > 0 ? ` · ${reportsByLine.size} dòng bị báo sai` : ""}</p>
      </div>
      <VideoStatusButtons videoId={videoId} status={lesson.status} onStatus={setStatus} onDeleted={() => router.replace("/admin/videos")} />
      {lesson.status === "listed" && <Link href={`/video/${videoId}`} className="text-label-md font-medium text-primary hover:underline">Mở trang xem như người dùng</Link>}
      <label className="inline-flex min-h-11 items-center gap-2 text-label-md text-on-surface">
        <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} className="h-5 w-5 accent-primary" />
        Chỉ hiện dòng thiếu bản dịch
      </label>
      {reportsByLine.size > 0 && (
        <label className="inline-flex min-h-11 items-center gap-2 text-label-md text-on-surface">
          <input type="checkbox" checked={onlyReported} onChange={(e) => setOnlyReported(e.target.checked)} className="h-5 w-5 accent-primary" />
          Chỉ hiện dòng bị báo sai
        </label>
      )}
      <ul className="flex flex-col gap-space-sm">
        {shown.map((l) => <LineRow key={l.idx} videoId={videoId} line={l} reports={reportsByLine.get(l.idx) ?? []} onSaved={onSaved} onRestored={onRestored} />)}
      </ul>
    </div>
  );
}
