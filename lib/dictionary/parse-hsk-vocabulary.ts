// Đọc `complete.json` của drkameleon/complete-hsk-vocabulary (MIT). Dùng bộ `new-*` = HSK 3.0 chuẩn 2021:
// cấp 1–6 rõ ràng; `new-7` là nhóm 7–9 gộp chung (danh sách không tách được 7, 8, 9) → lưu là cấp 7.
export interface HskWord {
  simplified: string;
  traditional: string;
  pinyin: string;
  meanings: string[];
  /** 1–6, hoặc 7 = nhóm 7–9 của HSK 3.0. */
  level: number;
  frequency: number | null;
}

interface RawWord {
  simplified: string;
  level: string[];
  frequency?: number;
  forms: { traditional: string; transcriptions: { pinyin: string }; meanings: string[] }[];
}

export function parseHskVocabulary(raw: RawWord[]): HskWord[] {
  const words: HskWord[] = [];
  for (const w of raw) {
    const levels = w.level
      .filter((l) => l.startsWith("new-"))
      .map((l) => Number(l.slice(4)))
      .filter((n) => n >= 1 && n <= 7);
    const form = w.forms[0];
    if (levels.length === 0 || !form) continue;
    words.push({
      simplified: w.simplified,
      traditional: form.traditional,
      pinyin: form.transcriptions.pinyin,
      meanings: form.meanings,
      level: Math.min(...levels),
      frequency: w.frequency ?? null,
    });
  }
  return words;
}
