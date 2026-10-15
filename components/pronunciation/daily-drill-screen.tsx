"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { buildDailyDrill } from "@/lib/pronunciation/daily-drill";
import { markDay, streakOf, todayKey } from "@/lib/pronunciation/learning-progress";
import { ReadAloudPractice } from "./read-aloud-practice";
import { ToneQuizGame } from "./tone-quiz-game";
import { usePronunciationProgress } from "./use-pronunciation-progress";

type Step = "tones" | "sentence" | "twister" | "done";
const STEPS: { id: Exclude<Step, "done">; label: string }[] = [
  { id: "tones", label: "1. Nghe thanh" },
  { id: "sentence", label: "2. Đọc câu" },
  { id: "twister", label: "3. 绕口令" },
];

/** Bài tập khoảng 5 phút mỗi ngày: nghe đoán 4 thanh → đọc một câu → đọc một câu 绕口令. Xong thì cộng vào chuỗi ngày (lưu trên thiết bị). */
export function DailyDrillScreen() {
  const day = useMemo(() => todayKey(), []);
  const drill = useMemo(() => buildDailyDrill(day), [day]);
  const { progress, update } = usePronunciationProgress();
  const [step, setStep] = useState<Step>("tones");
  const streak = streakOf(progress, day);
  const doneToday = streak.studiedToday;

  function finish() { update((p) => markDay(p, day)); setStep("done"); }
  const next = (to: Step) => (
    <button type="button" onClick={() => (to === "done" ? finish() : setStep(to))} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary">
      {to === "done" ? "Hoàn thành hôm nay" : "Sang bước tiếp"} <Icon name="arrow_forward" size={20} />
    </button>
  );

  if (step === "done") {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-space-lg text-center" data-testid="drill-done">
        <Icon name="local_fire_department" size={48} filled className="text-primary" />
        <p className="mt-2 font-serif text-headline-lg">{streak.current} ngày liên tiếp</p>
        <p className="mt-1 text-body-lg text-on-surface-variant">Hôm nay bạn đã luyện xong. Mai quay lại để giữ chuỗi nhé!</p>
      </div>
    );
  }
  return (
    <div className="space-y-space-md">
      <p className="text-body-md text-on-surface-variant" aria-live="polite">
        {streak.current > 0 ? `Chuỗi hiện tại: ${streak.current} ngày. ` : ""}{doneToday ? "Hôm nay bạn đã hoàn thành, có thể luyện thêm." : "Hôm nay chưa luyện."}
      </p>
      <ol className="flex gap-1 rounded-full bg-surface-container p-1" aria-label="Các bước">
        {STEPS.map((s) => <li key={s.id} aria-current={step === s.id ? "step" : undefined} className={`flex-1 rounded-full px-2 py-2 text-center text-label-md ${step === s.id ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>{s.label}</li>)}
      </ol>
      {step === "tones" && (
        <div className="space-y-space-md">
          <ToneQuizGame key="tones" rounds={drill.toneRounds} onFinish={() => undefined} />
          <p className="text-body-sm text-on-surface-variant">Làm hết {drill.toneRounds} câu rồi sang bước tiếp.</p>
          {next("sentence")}
        </div>
      )}
      {step === "sentence" && (
        <div className="space-y-space-md">
          <ReadAloudPractice key="sentence" sentences={[drill.sentence]} allowCustom={false} />
          {next("twister")}
        </div>
      )}
      {step === "twister" && (
        <div className="space-y-space-md">
          <p className="text-body-md text-on-surface-variant">Trọng tâm hôm nay: <strong>{drill.twister.focus}</strong>. Đọc chậm trước, trơn rồi mới nhanh dần.</p>
          <ReadAloudPractice key="twister" sentences={[drill.twister]} allowCustom={false} />
          {next("done")}
        </div>
      )}
    </div>
  );
}
