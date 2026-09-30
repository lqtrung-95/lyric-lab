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
    if (levels.length === 0 || w.forms.length === 0) continue;
    // Chữ nhiều âm (多音字, vd. 都/还/说/着): nguồn liệt kê MỖI cách đọc là một phần tử riêng trong `forms`, thường
    // xếp cách đọc hiếm/họ người trước (vd. 都 → "Dū: surname Du" đứng trước "dōu: all"). Lấy hết mọi form thay vì
    // chỉ forms[0], nếu không cấp HSK sẽ gắn nhầm vào cách đọc hiếm, khiến tra từ điển chọn sai âm phổ biến.
    for (const form of w.forms) {
      words.push({
        simplified: w.simplified,
        traditional: form.traditional,
        pinyin: form.transcriptions.pinyin,
        meanings: form.meanings,
        level: Math.min(...levels),
        frequency: w.frequency ?? null,
      });
    }
  }
  return words;
}
