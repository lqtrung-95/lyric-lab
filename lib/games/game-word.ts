/** Một từ dùng trong các game giải trí: chữ Hán, pinyin có dấu (từ từ điển) và nghĩa nếu có. */
export interface GameWord { han: string; pinyin: string; meaning?: string }

/** Chữ cái pinyin không thanh để gõ phím (ü → u): "péng yǒu" → "pengyou". */
export function typingLetters(pinyin: string): string {
  return pinyin.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[üv]/gi, "u").toLowerCase().replace(/[^a-z]/g, "");
}
