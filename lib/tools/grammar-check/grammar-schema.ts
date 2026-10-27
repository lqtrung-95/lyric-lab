import { z } from "zod";

const HAN = /\p{Script=Han}/u;
const hasHan = (s: string) => HAN.test(s);
const noHan = (s: string) => !HAN.test(s);
const zh = (max: number) => z.string().trim().min(1).max(max).refine(hasHan, "phải là tiếng Trung");
const vi = (max: number) => z.string().trim().min(1).max(max).refine((s) => !isMostlyHan(s), "phải viết bằng tiếng Việt");

/** Quá nửa ký tự chữ là chữ Hán: model đáp bằng tiếng Trung thay vì tiếng Việt. */
export function isMostlyHan(text: string): boolean {
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  return letters > 0 && (text.match(/\p{Script=Han}/gu)?.length ?? 0) / letters > 0.5;
}

export const MAX_GRAMMAR_CHARS = 120;

/**
 * Kết quả kiểm tra một câu tiếng Trung của người học.
 * `ok`: đúng và tự nhiên; `awkward`: đúng ngữ pháp nhưng chưa tự nhiên; `wrong`: có lỗi ngữ pháp hoặc dùng từ sai.
 */
export const grammarOutputSchema = z.object({
  verdict: z.enum(["ok", "awkward", "wrong"]),
  /** Câu sửa ít nhất có thể (chỉ sửa đúng chỗ sai); bỏ trống khi câu đã đúng. */
  minimalFix: zh(MAX_GRAMMAR_CHARS * 2).optional(),
  /** Cách người bản ngữ thường nói ý đó. */
  natural: zh(MAX_GRAMMAR_CHARS * 2),
  /** Tóm tắt một hai câu bằng tiếng Việt. */
  summary: vi(240),
  /** Từng lỗi hoặc chỗ chưa tự nhiên: đoạn trong câu gốc, vấn đề (tiếng Việt) và cách sửa. */
  issues: z.array(z.object({ snippet: zh(40), problem: vi(220), fix: zh(60).optional() })).max(4).default([]),
});
export type GrammarOutput = z.infer<typeof grammarOutputSchema>;

export { noHan };
