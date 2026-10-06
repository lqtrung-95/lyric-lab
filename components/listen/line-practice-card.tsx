"use client";

import { useState } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";
import { useLineRecorder } from "./use-line-recorder";

const PHASES = ["listen", "echo", "speak", "play"] as const;
type Phase = (typeof PHASES)[number];

// "song" = hát theo bài hát; "speech" = nói theo lời thoại của video.
const PHASE_LABEL: Record<"song" | "speech", Record<Phase, string>> = {
  song: { listen: "Nghe", echo: "Nghĩ", speak: "Hát", play: "Nghe lại" },
  speech: { listen: "Nghe", echo: "Nghĩ", speak: "Nói", play: "Nghe lại" },
};
const PHASE_ICON: Record<Phase, IconName> = { listen: "headphones", echo: "psychology", speak: "mic", play: "play_circle" };

const FAIL_TEXT = {
  denied: "Chưa ghi âm được — kiểm tra bạn đã cho phép dùng micro chưa.",
  unsupported: "Trình duyệt này chưa hỗ trợ ghi âm.",
} as const;

interface LinePracticeCardProps {
  line: AnalyzedLine;
  /** Phát lại câu này từ bản gốc (tua tới đầu câu + play). */
  onListenLine: () => void;
  /** Tạm dừng bài hát trước khi bắt đầu ghi âm, để không lẫn tiếng nhạc vào bản ghi. */
  onPauseSong: () => void;
  /** Mặc định luyện hát theo bài hát; "speech" đổi chữ "hát" thành "nói" cho video lời thoại. */
  variant?: "song" | "speech";
}

/**
 * Luyện phát âm theo 4 bước kiểu Miraa: Nghe bản gốc → Nghĩ nghĩa (xem lại bản dịch) → Hát (ghi âm, tự tạm dừng
 * bài hát) → Nghe lại bản ghi của mình. Mỗi bước phải hoàn thành mới mở khóa bước sau, không chấm điểm tự động.
 */
export function LinePracticeCard({ line, onListenLine, onPauseSong, variant = "song" }: LinePracticeCardProps) {
  const verb = variant === "speech" ? "nói" : "hát";
  const labels = PHASE_LABEL[variant];
  const [active, setActive] = useState<Phase>("listen");
  const [unlocked, setUnlocked] = useState<Phase[]>(["listen"]);
  const unlock = (phase: Phase) => setUnlocked((u) => (u.includes(phase) ? u : [...u, phase]));
  const recorder = useLineRecorder(() => { unlock("play"); setActive("play"); });
  const goTo = (phase: Phase) => { if (unlocked.includes(phase)) setActive(phase); };
  const handleListen = () => { onListenLine(); unlock("echo"); };
  const handleRecordStart = () => { onPauseSong(); void recorder.start(); };

  return (
    <div>
      <p className="text-label-md text-on-surface-variant">Nghe câu gốc, nhớ nghĩa, rồi {verb} lại và tự nghe so sánh.</p>

      <div role="tablist" aria-label="Bước luyện phát âm" className="mt-3 grid grid-cols-4 gap-1 rounded-full bg-surface-container-low p-1">
        {PHASES.map((phase) => {
          const isUnlocked = unlocked.includes(phase);
          const isActive = active === phase;
          return (
            <button
              key={phase} type="button" role="tab" aria-selected={isActive} disabled={!isUnlocked}
              onClick={() => goTo(phase)}
              className={`flex min-h-9 items-center justify-center gap-1 rounded-full px-1 text-label-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon name={PHASE_ICON[phase]} size={16} />
              {labels[phase]}
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        {active === "listen" && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleListen}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary hover:bg-primary-container">
              <Icon name="headphones" size={18} />Nghe bản gốc
            </button>
            <p className="text-label-md text-on-surface-variant">Nghe kỹ cách phát âm trước khi {verb} theo.</p>
          </div>
        )}

        {active === "echo" && (
          <div>
            <p className="text-body-md text-on-surface-variant">{line.translation ?? "Câu này chưa có bản dịch."}</p>
            <button type="button" onClick={() => { unlock("speak"); setActive("speak"); }}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary hover:bg-primary-container">
              Đã nhớ nghĩa, {verb} thôi
            </button>
          </div>
        )}

        {active === "speak" && (
          <div className="flex flex-col gap-2">
            {recorder.state === "recording" ? (
              <button type="button" onClick={recorder.stop} aria-label="Dừng ghi âm"
                className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-error px-4 text-label-md font-semibold text-on-error">
                <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-on-error" />
                Đang ghi… bấm để dừng
              </button>
            ) : recorder.state === "requesting" ? (
              <p role="status" className="text-label-md text-on-surface-variant">Đang xin quyền dùng micro…</p>
            ) : (
              <button type="button" onClick={handleRecordStart}
                className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary hover:bg-primary-container">
                <Icon name="mic" size={18} />Bắt đầu ghi âm
              </button>
            )}
            <p className="text-label-md text-on-surface-variant">Bấm ghi âm sẽ tự tạm dừng {variant === "speech" ? "video" : "bài hát"} để khỏi lẫn tiếng {variant === "speech" ? "gốc" : "nhạc"}.</p>
            {(recorder.state === "denied" || recorder.state === "unsupported") && (
              <p role="alert" className="text-label-md text-error">{FAIL_TEXT[recorder.state]}</p>
            )}
          </div>
        )}

        {active === "play" && (
          <div className="flex items-center gap-2">
            {recorder.audioUrl ? (
              <audio controls src={recorder.audioUrl} className="h-11 max-w-full flex-1" />
            ) : (
              <p className="text-label-md text-on-surface-variant">Chưa có bản ghi — quay lại bước {labels.speak} để ghi âm.</p>
            )}
            <button type="button" onClick={() => { recorder.reset(); unlock("speak"); setActive("speak"); }}
              aria-label="Ghi âm lại" title="Ghi âm lại"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high">
              <Icon name="mic" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
