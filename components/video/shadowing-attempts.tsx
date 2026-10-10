import type { ShadowAttempt } from "./use-shadowing-turn";

const scoreClass = (score: number) => (score >= 0.85 ? "bg-primary/15 text-primary" : score >= 0.6 ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container");

/** Các lần nói gần nhất của một câu: điểm sơ bộ, nghe lại giọng mình, nghe "mẫu rồi mình", chữ nào nghe đúng/sai và chữ máy nghe được. */
export function ShadowingAttempts({ attempts, canRecognize, onPlayMine, onCompare }: {
  attempts: ShadowAttempt[]; canRecognize: boolean; onPlayMine: (url: string) => void; onCompare: (url: string) => void;
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
          </div>
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
