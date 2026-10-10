"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Toast } from "@/components/ui/toast";
import { computeMilestones, diffNewMilestones, nextMilestones, type MilestoneInput } from "@/lib/streak/milestones";

const SEEN_KEY = "lyric-lab-milestones-seen";

function readSeen(): string[] | null {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : null;
  } catch {
    return null;
  }
}

/**
 * Cột mốc học tập: mốc cao nhất đã đạt của mỗi nhóm (chuỗi ngày, từ đã ôn, câu học qua video) và mốc kế tiếp còn thiếu bao nhiêu. Mốc mới đạt được báo
 * bằng một thông báo nổi đúng một lần (danh sách đã báo nằm trong trình duyệt; lần đầu chỉ ghi nhận để người dùng cũ không bị báo dồn).
 */
export function MilestonesRow({ stats }: { stats: MilestoneInput }) {
  const { longest, learnedWords, videoLines } = stats;
  const milestones = useMemo(() => computeMilestones({ longest, learnedWords, videoLines }), [longest, learnedWords, videoLines]);
  const [seenAtLoad] = useState(readSeen);
  const { fresh, seen } = useMemo(() => diffNewMilestones(milestones, seenAtLoad), [milestones, seenAtLoad]);
  const [dismissed, setDismissed] = useState(false);
  const dismiss = useCallback(() => setDismissed(true), []);
  useEffect(() => {
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch { /* không lưu được: lần sau có thể báo lại, không sao */ }
  }, [seen]);

  const highest = (["streak", "words", "video"] as const).flatMap((g) => milestones.filter((m) => m.group === g && m.earned).slice(-1));
  const next = nextMilestones(milestones);
  return (
    <div aria-label="Thành tích" role="group" className="space-y-1.5">
      {highest.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {highest.map((m) => (
            <li key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-3 py-1 text-label-md font-medium text-on-tertiary-fixed">
              <Icon name="emoji_events" filled size={16} />{m.label}
            </li>
          ))}
        </ul>
      )}
      {next.length > 0 && (
        <p className="text-label-md text-on-surface-variant">
          Mốc kế tiếp: {next.map((n) => `${n.milestone.label} (còn ${n.remaining} ${n.unit})`).join(" · ")}
        </p>
      )}
      {fresh.length > 0 && !dismissed && <Toast message={`Mốc mới: ${fresh.map((m) => m.label).join(", ")}`} onDismiss={dismiss} />}
    </div>
  );
}
