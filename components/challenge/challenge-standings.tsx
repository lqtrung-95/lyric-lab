import type { ChallengeStanding } from "@/lib/challenges/challenge-types";
import { ReportPlayerButton } from "./report-player-button";

/** Bảng điểm của một thử thách (những người đã chơi xong, cao nhất trước). */
export function ChallengeStandings({ code, standings }: { code: string; standings: ChallengeStanding[] }) {
  if (standings.length === 0) return <p className="rounded-xl bg-surface-container-low p-space-md text-body-md text-on-surface-variant">Chưa ai chơi xong. Bạn có thể là người đầu tiên đặt điểm chuẩn.</p>;
  return (
    <ol aria-label="Bảng điểm thử thách" className="divide-y divide-outline-variant rounded-2xl bg-surface-container-lowest shadow-sm">
      {standings.map((s, i) => (
        <li key={`${s.name}-${i}`} className={`flex items-center gap-3 px-space-md py-2 ${s.isMe ? "bg-primary/5" : ""}`}>
          <span className="w-6 text-center font-serif text-headline-md text-on-surface-variant">{i + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body-md font-medium text-on-surface">{s.name}{s.isMe && " (bạn)"}</span>
            <span className="block text-label-sm text-on-surface-variant">{s.correct} câu đúng{s.isCreator && " · người tạo thử thách"}</span>
          </span>
          <span className="font-serif text-headline-md text-primary">{s.points}</span>
          {!s.isMe && <ReportPlayerButton context="challenge" code={code} name={s.name} />}
        </li>
      ))}
    </ol>
  );
}
