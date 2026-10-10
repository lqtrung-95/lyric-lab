import type { ShadowAttempt } from "./use-shadowing-turn";
import type { VoiceFeedbackState } from "./use-voice-feedback";

const FEEDBACK_FAIL = {
  rate_limited: "Bạn đã nhờ AI nhận xét nhiều lần hôm nay, mai thử lại nhé.",
  unavailable: "Tính năng nhận xét giọng chưa bật.",
  error: "Chưa nhận xét được lúc này. Thử lại sau nhé.",
} as const;

const scoreClass = (score: number) => (score >= 0.85 ? "bg-primary/15 text-primary" : score >= 0.6 ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container");

/** Các lần nói gần nhất của một câu: điểm sơ bộ, nghe lại giọng mình, nghe "mẫu rồi mình", chữ nào nghe đúng/sai và chữ máy nghe được. */
export function ShadowingAttempts({ attempts, canRecognize, feedback, onPlayMine, onCompare, onFeedback }: {
  attempts: ShadowAttempt[]; canRecognize: boolean; feedback: Record<number, VoiceFeedbackState>;
  onPlayMine: (url: string) => void; onCompare: (url: string) => void; onFeedback: (attempt: ShadowAttempt) => void;
}) {
  if (attempts.length === 0) return null;
  return (
    <ol aria-label="Các lần nói gần đây" className="space-y-space-sm">
      {attempts.map((a, i) => (
        <li key={a.at} className={`rounded-2xl p-space-md ${i === 0 ? "bg-surface-container-low" : "bg-surface-container-lowest opacity-80"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span aria-label={a.result ? `Điểm ${Math.round(a.result.score * 100)}` : "Chưa có điểm"} className={`inline-flex min-h-8 min-w-12 items-center justify-center rounded-full px-3 text-label-md font-semibold ${a.result ? scoreClass(a.result.score) : "bg-surface-container-high text-on-surface-variant"}`}>
              {a.result ? Math.round(a.result.score * 100) : "–"}
            </span>
            <button type="button" onClick={() => onPlayMine(a.url)} className="min-h-11 rounded-full bg-surface-container-high px-4 text-label-md font-medium text-on-surface hover:bg-surface-container-highest">Nghe giọng mình</button>
            <button type="button" onClick={() => onCompare(a.url)} className="min-h-11 rounded-full px-4 text-label-md font-medium text-primary hover:bg-surface-container">Mẫu → mình</button>
            {feedback[a.at]?.status !== "ok" && (
              <button type="button" onClick={() => onFeedback(a)} disabled={feedback[a.at]?.status === "loading"} className="min-h-11 rounded-full border border-primary/40 px-4 text-label-md font-medium text-primary hover:bg-surface-container disabled:opacity-60">
                {feedback[a.at]?.status === "loading" ? "AI đang nghe…" : "Nhờ AI nhận xét"}
              </button>
            )}
          </div>
          <FeedbackView state={feedback[a.at]} />
          {a.result ? (
            <p lang="zh" className="mt-2 font-serif text-body-lg tracking-wide">
              {a.result.units.map((u, k) => <span key={k} className={u.status === "correct" ? "text-on-surface" : "text-error underline decoration-wavy"}>{u.expected}</span>)}
            </p>
          ) : canRecognize ? (
            <p className="mt-2 text-label-md text-on-surface-variant">Không nhận ra chữ nào. Thử nói to và rõ hơn nhé.</p>
          ) : null}
          {a.heard && <p lang="zh" className="mt-1 text-label-md text-on-surface-variant">Máy nghe được: {a.heard}</p>}
        </li>
      ))}
    </ol>
  );
}

function FeedbackView({ state }: { state?: VoiceFeedbackState }) {
  if (!state || state.status === "loading") return null;
  if (state.status === "error") return <p role="status" className="mt-2 text-label-md text-on-surface-variant">{FEEDBACK_FAIL[state.reason]}</p>;
  const { score, summary, issues, heard } = state.value;
  return (
    <div role="status" aria-label="Nhận xét của AI" className="mt-2 rounded-xl bg-surface-container p-3">
      <p className="text-label-md font-semibold text-on-surface">Nhận xét của AI · <span className={scoreClass(score / 100).split(" ")[1]}>{score}/100</span></p>
      <p className="mt-1 text-body-md text-on-surface">{summary}</p>
      {issues.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {issues.map((i, k) => (
            <li key={k} className="text-label-md text-on-surface-variant">
              <span lang="zh" className="font-serif font-semibold text-on-surface">{i.word}</span>{": "}{i.problem}{i.tip && <span className="text-primary"> → {i.tip}</span>}
            </li>
          ))}
        </ul>
      )}
      {heard && <p lang="zh" className="mt-2 text-label-md text-on-surface-variant">AI nghe được: {heard}</p>}
    </div>
  );
}
