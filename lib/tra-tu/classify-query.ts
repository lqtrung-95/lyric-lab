import { foldVietnamese } from "./fold-vietnamese";
import { plainPinyinQuery } from "./pinyin-plain";

export interface ClassifiedQuery {
  raw: string;
  /** Chữ Hán trong truy vấn (giữ thứ tự, bỏ ký tự khác); null nếu không có chữ Hán. */
  han: string | null;
  /** Dạng chữ Latin đã gập dấu ("thanh thi"); null nếu truy vấn có chữ Hán hoặc rỗng. */
  folded: string | null;
  /** Pinyin phẳng của truy vấn Latin ("xihuan"); null nếu không dùng được làm pinyin. */
  plainPinyin: string | null;
}

const MAX_LENGTH = 40;

/** Phân loại truy vấn gõ vào ô tìm: có chữ Hán thì tìm theo chữ; còn lại chạy mọi nguồn Latin (pinyin, Hán Việt, nghĩa) rồi xếp hạng chung. */
export function classifyQuery(input: string): ClassifiedQuery {
  const raw = input.normalize("NFC").trim().slice(0, MAX_LENGTH);
  const han = [...raw].filter((c) => /\p{Script=Han}/u.test(c)).join("");
  if (han) return { raw, han, folded: null, plainPinyin: null };
  const folded = foldVietnamese(raw);
  if (!folded || !/[a-z0-9]/.test(folded)) return { raw, han: null, folded: null, plainPinyin: null };
  const plain = plainPinyinQuery(raw);
  return { raw, han: null, folded, plainPinyin: plain.length >= 1 && plain.length <= 30 ? plain : null };
}
