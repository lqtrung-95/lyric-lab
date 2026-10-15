"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { LEARNING_PATH } from "@/lib/pronunciation/learning-path";
import { toggleLesson } from "@/lib/pronunciation/learning-progress";
import { usePronunciationProgress } from "./use-pronunciation-progress";

/** Lộ trình 6 bước theo thứ tự; người học tự đánh dấu bước đã xong (lưu trên thiết bị). */
export function LearningPathList() {
  const { progress, update } = usePronunciationProgress();
  const done = LEARNING_PATH.filter((l) => progress.lessons.includes(l.id)).length;
  return (
    <div className="space-y-space-md">
      <p role="status" className="text-body-lg">Đã xong <strong>{done}/{LEARNING_PATH.length}</strong> bước</p>
      <ol className="space-y-space-sm">
        {LEARNING_PATH.map((l, i) => {
          const isDone = progress.lessons.includes(l.id);
          return (
            <li key={l.id} className={`rounded-2xl border p-space-md ${isDone ? "border-primary bg-primary-container/40" : "border-outline-variant bg-surface-container-low"}`}>
              <div className="flex items-start gap-space-sm">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-label-md font-medium">{isDone ? <Icon name="check" size={20} /> : i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-body-lg font-medium">{l.title}</h3>
                  <p className="text-body-md text-on-surface-variant">{l.goal}</p>
                  <div className="mt-space-sm flex flex-wrap gap-2">
                    <Link href={l.href} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-label-md font-medium text-on-primary">Luyện ngay <Icon name="arrow_forward" size={18} /></Link>
                    <button type="button" aria-pressed={isDone} onClick={() => update((p) => toggleLesson(p, l.id))} className="inline-flex min-h-11 items-center rounded-full border border-outline-variant px-4 text-label-md font-medium hover:bg-surface-container">
                      {isDone ? "Bỏ đánh dấu xong" : "Đánh dấu đã xong"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
