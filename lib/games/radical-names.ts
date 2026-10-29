/**
 * Bộ thủ và mảnh chữ KHÔNG phải từ độc lập nên từ điển không có mục (亻 扌 艹 氵...): bảng nhỏ viết tay gồm tên gọi pinyin của bộ và nghĩa tiếng Việt.
 * Chỉ dùng làm nhãn cho mảnh ghép khi từ điển không có; chữ có trong từ điển thì luôn lấy pinyin từ từ điển (quy tắc 2).
 */
export interface RadicalName { pinyin: string; meaning: string }

export const RADICAL_NAMES: Record<string, RadicalName> = {
  "亻": { pinyin: "rén", meaning: "bộ nhân đứng (người)" }, "扌": { pinyin: "shǒu", meaning: "bộ thủ (tay)" }, "艹": { pinyin: "cǎo", meaning: "bộ thảo (cỏ)" },
  "氵": { pinyin: "shuǐ", meaning: "bộ thủy (nước)" }, "讠": { pinyin: "yán", meaning: "bộ ngôn (lời nói)" }, "辶": { pinyin: "chuò", meaning: "bộ sước (đi)" },
  "彳": { pinyin: "chì", meaning: "bộ xích (bước chân)" }, "冫": { pinyin: "bīng", meaning: "bộ băng (đá lạnh)" }, "灬": { pinyin: "huǒ", meaning: "bộ hỏa (lửa)" },
  "忄": { pinyin: "xīn", meaning: "bộ tâm đứng (tim)" }, "犭": { pinyin: "quǎn", meaning: "bộ khuyển (chó, thú)" }, "阝": { pinyin: "fù", meaning: "bộ phụ / ấp (gò, thành)" },
  "礻": { pinyin: "shì", meaning: "bộ thị (thần, tế)" }, "衤": { pinyin: "yī", meaning: "bộ y (áo)" }, "丶": { pinyin: "zhǔ", meaning: "nét chấm" },
  "丿": { pinyin: "piě", meaning: "nét phẩy" }, "乛": { pinyin: "zhé", meaning: "nét gập" }, "乚": { pinyin: "yǐn", meaning: "nét móc (biến thể của 乙)" },
  "刂": { pinyin: "dāo", meaning: "bộ đao đứng (dao)" }, "宀": { pinyin: "mián", meaning: "bộ miên (mái nhà)" }, "冖": { pinyin: "mì", meaning: "bộ mịch (cái khăn trùm)" },
  "匚": { pinyin: "fāng", meaning: "bộ phương (cái hòm)" }, "凵": { pinyin: "kǎn", meaning: "bộ khảm (há miệng)" }, "廴": { pinyin: "yǐn", meaning: "bộ dẫn (kéo dài bước)" },
  "疒": { pinyin: "nè", meaning: "bộ nạch (bệnh)" }, "罒": { pinyin: "wǎng", meaning: "bộ võng (lưới)" }, "钅": { pinyin: "jīn", meaning: "bộ kim (kim loại)" },
  "饣": { pinyin: "shí", meaning: "bộ thực (ăn)" }, "纟": { pinyin: "sī", meaning: "bộ mịch (sợi tơ)" }, "亠": { pinyin: "tóu", meaning: "bộ đầu (nắp)" },
  "冂": { pinyin: "jiōng", meaning: "bộ quynh (vùng biên giới)" }, "卩": { pinyin: "jié", meaning: "bộ tiết (đốt tre)" }, "勹": { pinyin: "bāo", meaning: "bộ bao (bọc)" },
  "夂": { pinyin: "zhǐ", meaning: "bộ trĩ (đi chậm)" }, "廾": { pinyin: "gǒng", meaning: "bộ củng (chắp tay)" }, "彡": { pinyin: "shān", meaning: "bộ sam (lông, tia)" },
  "攵": { pinyin: "pū", meaning: "bộ phộc (đánh nhẹ)" }, "爫": { pinyin: "zhǎo", meaning: "bộ trảo (móng vuốt)" }, "牜": { pinyin: "niú", meaning: "bộ ngưu (trâu bò)" },
  "耂": { pinyin: "lǎo", meaning: "bộ lão (già)" }, "虍": { pinyin: "hū", meaning: "bộ hô (vằn hổ)" }, "⺈": { pinyin: "dāo", meaning: "biến thể của bộ đao (dao)" },
  "厶": { pinyin: "sī", meaning: "bộ tư (riêng tư)" }, "匕": { pinyin: "bǐ", meaning: "bộ tỷ (cái thìa)" }, "月": { pinyin: "yuè", meaning: "trăng, tháng (cũng là bộ nhục: thịt)" },
  "门": { pinyin: "mén", meaning: "cửa" },
  "⺼": { pinyin: "ròu", meaning: "bộ nhục (thịt)" },
};
