import type { AnalyzedLine, PreviewItem, SongAnalysis } from "@/lib/analysis/analysis-types";

// Dữ liệu mẫu hư cấu (docs/design-brief.md mục 6): bài "夜车" do nhóm sản phẩm tự viết, không phải bài hát thật.
// Dùng cho trang /dev/preview-fixture và test E2E. videoId chỉ để nhúng player khi thử.

const line = (index: number, text: string, pinyin: string, translation: string, tokens: AnalyzedLine["tokens"]): AnalyzedLine => ({
  index, text, pinyin, translation, start: index * 5, end: index * 5 + 5, tokens,
});

const lines: AnalyzedLine[] = [
  line(0, "窗外的城市慢慢睡了", "chuāng wài de chéngshì mànmàn shuì le", "Thành phố ngoài cửa sổ dần chìm vào giấc ngủ",
    [{ text: "窗外" }, { text: "的" }, { text: "城市", itemId: "vocab:城市" }, { text: "慢慢" }, { text: "睡" }, { text: "了" }]),
  line(1, "我从来没想过会离开", "wǒ cónglái méi xiǎng guò huì líkāi", "Anh chưa từng nghĩ mình sẽ rời đi",
    [{ text: "我" }, { text: "从来", itemId: "vocab:从来" }, { text: "没想" }, { text: "过" }, { text: "会" }, { text: "离开", itemId: "vocab:离开" }]),
  line(2, "你的笑比星光还亮", "nǐ de xiào bǐ xīngguāng hái liàng", "Nụ cười em còn sáng hơn cả ánh sao",
    [{ text: "你" }, { text: "的" }, { text: "笑" }, { text: "比" }, { text: "星光", itemId: "vocab:星光" }, { text: "还" }, { text: "亮" }]),
  line(3, "就算路再远我也不怕", "jiùsuàn lù zài yuǎn wǒ yě bú pà", "Dù đường có xa mấy, anh cũng chẳng sợ",
    [{ text: "就算" }, { text: "路" }, { text: "再" }, { text: "远" }, { text: "我" }, { text: "也" }, { text: "不怕" }]),
  line(4, "把回忆放进口袋里", "bǎ huíyì fàng jìn kǒudài lǐ", "Cất những ký ức vào trong túi áo",
    [{ text: "把" }, { text: "回忆", itemId: "vocab:回忆" }, { text: "放进" }, { text: "口袋", itemId: "vocab:口袋" }, { text: "里" }]),
  line(5, "等天亮了我们再出发", "děng tiānliàng le wǒmen zài chūfā", "Đợi trời sáng rồi mình lại lên đường",
    [{ text: "等" }, { text: "天亮", itemId: "vocab:天亮" }, { text: "了" }, { text: "我们" }, { text: "再" }, { text: "出发", itemId: "vocab:出发" }]),
];

const occ = (i: number) => [{ lineIndex: i, start: i * 5 }];
const vocab = (term: string, reading: string, sinoViet: string, level: number, meaning: string, note: string, lineIndex: number, priority: number): PreviewItem => ({
  id: `vocab:${term}`, type: "vocab", term, reading, sinoViet, level, meaningInContext: meaning, explanation: note, occurrences: occ(lineIndex), priority,
});

const items: PreviewItem[] = [
  vocab("城市", "chéng shì", "thành thị", 3, "thành phố", "Bối cảnh mở đầu: thành phố về đêm", 0, 60),
  vocab("从来", "cóng lái", "tòng lai", 4, "xưa nay, từ trước đến giờ", "Thường đi với 没 / 不", 1, 85),
  vocab("离开", "lí kāi", "ly khai", 3, "rời đi, rời khỏi", "Rời thành phố, rời người thương", 1, 90),
  vocab("星光", "xīng guāng", "tinh quang", 5, "ánh sao", "Vật so sánh cho nụ cười", 2, 70),
  vocab("回忆", "huí yì", "hồi ức", 5, "ký ức, kỷ niệm", "Cũng dùng làm động từ “hồi tưởng”", 4, 80),
  vocab("口袋", "kǒu dài", "khẩu đại", 4, "túi áo, túi quần", "Ẩn dụ mang kỷ niệm theo bên mình", 4, 65),
  vocab("天亮", "tiān liàng", "thiên lượng", 5, "trời sáng, rạng đông", "Tượng trưng khởi đầu mới", 5, 75),
  vocab("出发", "chū fā", "xuất phát", 2, "khởi hành, lên đường", "Khép lại bài bằng ý bắt đầu lại", 5, 55),
  {
    id: "grammar:0", type: "grammar", term: "从来没 + V + 过", level: 4, priority: 88, occurrences: occ(1),
    meaningInContext: "Chưa từng bao giờ làm gì",
    example: { zh: "我从来没去过北京。", vi: "Tôi chưa từng đến Bắc Kinh." },
    commonMistake: "Hay quên 过 ở cuối câu.",
  },
  {
    id: "grammar:1", type: "grammar", term: "A 比 B 还 + tính từ", level: 4, priority: 72, occurrences: occ(2),
    meaningInContext: "A còn … hơn cả B",
    example: { zh: "今天比昨天还冷。", vi: "Hôm nay còn lạnh hơn cả hôm qua." },
    commonMistake: "Dùng 很 sau 比: ✗ 他比我很高.",
  },
  {
    id: "grammar:2", type: "grammar", term: "就算 … 也 …", level: 5, priority: 68, occurrences: occ(3),
    meaningInContext: "Cho dù … thì vẫn …",
    example: { zh: "就算下雨，我也要去。", vi: "Cho dù trời mưa, tôi vẫn đi." },
    commonMistake: "Bỏ 也 vì tiếng Việt lược được “thì/vẫn”.",
  },
];

export const yeCheAnalysis: SongAnalysis = {
  videoId: "dQw4w9WgXcQ",
  track: { title: "夜车", artist: "歌手示例" },
  lyricsSource: "lrclib",
  summary: "Bài ballad kể về một chuyến tàu đêm: người hát rời thành phố, mang theo kỷ niệm và hẹn bắt đầu lại khi trời sáng.",
  moods: ["Hoài niệm", "Hy vọng"],
  lines, items, promptVersion: "v1", model: "fixture",
};

export const yeCheSong = { title: "夜车 (bản mẫu)", channelTitle: "Kênh mẫu", durationSec: 30 };
