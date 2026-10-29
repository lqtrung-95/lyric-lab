import type { EtymologyType } from "@/lib/tra-tu/parse-hanzi-dictionary";

export interface ForgeEty { type: EtymologyType; phonetic?: string; semantic?: string }
export interface PieceLabel { pinyin?: string; meaning?: string }

/** Nghĩa trong ngoặc; ngoặc có sẵn trong nghĩa ("bộ thủy (nước)") đổi thành dấu phẩy để không lồng ngoặc ("bộ thủy, nước"). */
const gloss = (l: PieceLabel | undefined) => (l?.meaning ? ` (${l.meaning.replace(/\s*\(([^)]*)\)/g, ", $1")})` : "");

/**
 * Câu tiếng Việt giải thích VÌ SAO hai mảnh ghép thành chữ này, dựng từ dữ kiện có cấu trúc (loại chữ, phần chỉ nghĩa, phần chỉ âm của Make Me a Hanzi) và nghĩa/pinyin từ điển, không qua AI.
 * Hình thanh: một mảnh chỉ nghĩa, một mảnh gợi âm đọc. Còn lại (hội ý hoặc không rõ): hai mảnh gộp ý nghĩa để gợi ra nghĩa của chữ mới.
 */
export function forgeWhy(a: string, b: string, out: string, label: (c: string) => PieceLabel | undefined, ety: ForgeEty | undefined): string {
  const o = label(out);
  if (ety?.type === "pictophonetic" && ety.semantic && ety.phonetic && [a, b].includes(ety.semantic) && [a, b].includes(ety.phonetic) && ety.semantic !== ety.phonetic) {
    const sound = label(ety.phonetic)?.pinyin;
    const read = o?.pinyin;
    return `Hình thanh: “${ety.semantic}”${gloss(label(ety.semantic))} chỉ phần nghĩa, “${ety.phonetic}” gợi âm đọc${sound && read ? ` (${sound} gần với ${read})` : ""}, ghép lại thành “${out}”${gloss(o)}.`;
  }
  return `Hội ý: ghép “${a}”${gloss(label(a))} với “${b}”${gloss(label(b))} để gợi ra “${out}”${gloss(o)}.`;
}
