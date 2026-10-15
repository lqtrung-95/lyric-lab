import type { AssessmentResult } from "@/lib/pronunciation/assessment-normalize";
import { tipForSyllable } from "@/lib/pronunciation/syllable-tips";

/** Ngưỡng màu theo điểm từng chữ; cố ý khoan dung vì điểm Azure dao động nhẹ giữa các lần đọc. */
const tier = (score: number) => (score >= 80 ? "good" : score >= 60 ? "ok" : "weak");
const TIER_STYLE = { good: "border-primary bg-primary-container text-on-primary-container", ok: "border-tertiary bg-tertiary-container text-on-tertiary-container", weak: "border-error bg-error-container text-on-error-container" } as const;
const TIER_LABEL = { good: "tốt", ok: "tạm được", weak: "cần luyện" } as const;
const MAX_TIPS = 3;

/** Kết quả chấm từng chữ: màu + chữ ghi mức (không chỉ dựa vào màu), điểm chung và mẹo sửa cho tối đa 3 chữ yếu nhất. */
export function AssessmentResultView({ result }: { result: AssessmentResult }) {
  const weak = result.syllables.filter((s) => s.error === "omission" || s.score < 60).sort((a, b) => a.score - b.score);
  const tips = weak.flatMap((s) => { const t = tipForSyllable(s.base); return t ? [{ s, ...t }] : []; }).slice(0, MAX_TIPS);
  const omitted = result.syllables.filter((s) => s.error === "omission").map((s) => s.han).join("");
  return (
    <div className="space-y-space-md" data-testid="assess-result">
      <p className="font-serif text-headline-lg" aria-label={`Điểm chung ${result.overall} trên 100`}>{result.overall}<span className="text-body-lg text-on-surface-variant">/100</span></p>
      <ul className="flex flex-wrap gap-2" aria-label="Điểm từng chữ">
        {result.syllables.map((s, i) => (
          <li key={i} className={`min-w-14 rounded-xl border px-3 py-2 text-center ${TIER_STYLE[tier(s.score)]}`}>
            <span lang="zh-Hans" className="block font-serif text-2xl leading-none">{s.han}</span>
            <span className="block text-body-sm">{s.pinyin || " "}</span>
            <span className="block text-body-sm font-medium">{s.error === "omission" ? "thiếu" : `${s.score} · ${TIER_LABEL[tier(s.score)]}`}</span>
          </li>
        ))}
      </ul>
      {omitted && <p className="text-body-md text-on-surface-variant">Chưa nghe thấy: <span lang="zh-Hans" className="font-serif">{omitted}</span>. Hãy đọc đủ cả câu.</p>}
      {tips.length > 0 && (
        <div>
          <h3 className="text-body-lg font-medium">Gợi ý sửa</h3>
          <ul className="mt-1 space-y-1">
            {tips.map(({ s, symbol, tip }) => (
              <li key={s.han + s.pinyin} className="text-body-md text-on-surface-variant"><strong lang="zh-Hans" className="text-on-surface">{s.han} ({s.pinyin || s.base})</strong> · âm <strong>{symbol}</strong>: {tip}</li>
            ))}
          </ul>
          <p className="mt-1 text-body-sm text-on-surface-variant">Gợi ý lấy từ bảng pinyin, chỉ là hướng thử vì hệ thống chấm không cho biết sai ở phụ âm, vần hay thanh.</p>
        </div>
      )}
    </div>
  );
}
