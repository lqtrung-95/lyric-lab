import type { MatchKind } from "@/lib/tra-tu/types";

/** Nhãn ngắn cho biết kết quả khớp theo cách nào (giúp hiểu vì sao từ này xuất hiện). */
export const MATCH_LABEL: Record<MatchKind, string> = {
  exact: "Khớp chữ",
  "han-prefix": "Bắt đầu bằng chữ này",
  "han-contains": "Chứa chữ này",
  pinyin: "Khớp pinyin",
  "sino-viet": "Khớp Hán Việt",
  "vi-gloss": "Khớp nghĩa tiếng Việt",
  english: "Khớp nghĩa tiếng Anh",
};
