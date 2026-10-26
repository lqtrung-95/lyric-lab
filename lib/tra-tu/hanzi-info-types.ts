import type { EtymologyType } from "./parse-hanzi-dictionary";

export interface ComponentRef { char: string; sinoViet: string | null }

/** Chiết tự một chữ: mọi trường có cấu trúc đều từ Make Me a Hanzi + bảng Hán Việt (không qua LLM). */
export interface HanziInfoView {
  hanzi: string;
  /** Âm Hán Việt của chính chữ này (có thể nhiều âm). */
  sinoViet: string[];
  radical: ComponentRef;
  layout: string | null;
  layoutLabel: string | null;
  components: ComponentRef[];
  etymology: { type: EtymologyType; hint?: string; phonetic?: ComponentRef; semantic?: ComponentRef } | null;
  /** Nghĩa tiếng Anh của chữ (Make Me a Hanzi). */
  definition: string | null;
}

/** Chuỗi AI viết về chiết tự một chữ: cách chữ được dựng + mẹo nhớ. Chữ Hán chỉ được nhắc tới những chữ có trong dữ kiện. */
export interface EtymologyNote { story: string; mnemonic?: string }
export interface StoredEtymologyNote { note: EtymologyNote; model: string }
