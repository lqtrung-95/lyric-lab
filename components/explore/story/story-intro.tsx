"use client";

import Link from "next/link";
import { useState } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { currentObjective, objectiveProgress } from "@/lib/explore/story/objectives";
import { DIFFICULTY_LABEL, type StoryDef } from "@/lib/explore/story/story-types";
import { useStoryProgress } from "./use-story-progress";

/** Trang giới thiệu một vụ án: tóm tắt, mục tiêu hiện tại, nút bắt đầu/tiếp tục và chơi lại từ đầu (hỏi lại trước khi xóa tiến độ). */
export function StoryIntro({ story, basePath }: { story: Pick<StoryDef, "title" | "difficulty" | "intro" | "objectives" | "startScene" | "solvedFlag">; basePath: string }) {
  const { progress, ready, reset } = useStoryProgress();
  const [confirm, setConfirm] = useState(false);
  const objective = currentObjective(story.objectives, progress.flags);
  const { done, total } = objectiveProgress(story.objectives, progress.flags);
  const started = progress.flags.length > 0;
  const solved = progress.flags.includes(story.solvedFlag);
  const scene = objective?.sceneId ?? story.startScene;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <header>
        <h1 className="text-headline-lg">{story.title}</h1>
        <p className="mt-1"><span className="rounded-full border-2 border-ink bg-tertiary-container px-3 py-1 text-label-md font-extrabold text-on-tertiary-container">Độ khó: {DIFFICULTY_LABEL[story.difficulty]}</span></p>
        <p className="mt-1 text-body-lg">{story.intro}</p>
      </header>
      {ready && (
        <section aria-label="Tiến độ vụ án" className="card-ink p-space-md">
          <p className="text-label-md font-extrabold text-on-surface-variant">Tiến độ {done}/{total}</p>
          <p className="text-body-md font-bold">{solved ? "Vụ án đã được giải. Bạn có thể chơi lại từ đầu." : objective ? `Mục tiêu hiện tại: ${objective.text}` : "Chưa bắt đầu."}</p>
          <div className="mt-space-sm flex flex-wrap items-center gap-3">
            <Link href={`${basePath}/${scene}`} className="btn-3d btn-3d-bright">{started && !solved ? "Tiếp tục vụ án" : "Bắt đầu vụ án"}</Link>
            {started && !confirm && <button type="button" onClick={() => setConfirm(true)} className="min-h-11 text-label-md text-on-surface-variant underline">Chơi lại từ đầu</button>}
            {confirm && (
              <span className="flex items-center gap-2 text-label-md">
                Xóa tiến độ vụ án này?
                <Button3d variant="neutral" onClick={() => { reset(); setConfirm(false); }}>Xóa</Button3d>
                <button type="button" onClick={() => setConfirm(false)} className="min-h-11 px-2 font-extrabold text-primary hover:underline">Giữ lại</button>
              </span>
            )}
          </div>
        </section>
      )}
      <p className="text-body-md text-on-surface-variant">Bạn là thám tử Gấu Trúc. Đi quanh từng địa điểm, hỏi chuyện bằng tiếng Trung, đọc manh mối rồi tìm ra ai nói dối. Có pinyin và nghĩa tiếng Việt làm gợi ý; tắt đi nếu muốn thử thách.</p>
    </div>
  );
}
