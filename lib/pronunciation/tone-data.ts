// Bốn thanh điệu của tiếng Trung phổ thông + thanh nhẹ, theo thang cao độ 1-5 của Triệu Nguyên Nhiệm (Chao): 5 là cao nhất, 1 thấp nhất.
export type ToneId = 1 | 2 | 3 | 4;

export interface Tone {
  id: ToneId;
  name: string;
  /** Mô tả đường cao độ theo thang 1-5, ví dụ "55". */
  chao: string;
  shape: string;
  /** So sánh với thanh tiếng Việt (gần đúng; chỉ về hình dáng đường cao độ, không phải cùng một thanh). */
  vietnamese: string;
  example: { pinyin: string; han: string };
}

export const TONES: Tone[] = [
  { id: 1, name: "Thanh 1", chao: "55", shape: "cao, bằng", vietnamese: "Gần như thanh ngang (không dấu) nhưng giữ giọng CAO và đều từ đầu đến cuối.", example: { pinyin: "mā", han: "妈" } },
  { id: 2, name: "Thanh 2", chao: "35", shape: "lên", vietnamese: "Gần dấu sắc: đi lên từ giữa lên cao, như khi hỏi lại 'hả?'.", example: { pinyin: "má", han: "麻" } },
  { id: 3, name: "Thanh 3", chao: "214", shape: "xuống rồi lên", vietnamese: "Gần dấu hỏi: xuống thấp rồi mới lên, kéo dài hơn các thanh khác.", example: { pinyin: "mǎ", han: "马" } },
  { id: 4, name: "Thanh 4", chao: "51", shape: "xuống mạnh", vietnamese: "Gần dấu huyền nhưng DỐC và dứt khoát hơn: từ cao xuống thấp như ra lệnh.", example: { pinyin: "mà", han: "骂" } },
];

/** Quy tắc đổi thanh thường gặp (viết cho người học, ví dụ lấy từ từ vựng cơ bản). */
export const TONE_RULES: { title: string; body: string; example: string }[] = [
  { title: "Hai thanh 3 liền nhau", body: "Thanh 3 đứng trước thanh 3 đọc thành thanh 2 (nhưng vẫn viết thanh 3).", example: "你好 nǐ hǎo → ní hǎo" },
  { title: "不 trước thanh 4", body: "不 bù đổi thành bú khi đứng trước âm tiết thanh 4.", example: "不是 bù shì → bú shì" },
  { title: "一 đổi theo thanh sau", body: "一 đọc yì trước thanh 1, 2, 3 và đọc yí trước thanh 4 (đứng một mình hoặc cuối câu giữ yī).", example: "一个 yī gè → yí gè" },
  { title: "Thanh nhẹ", body: "Âm tiết đọc ngắn, nhẹ, không có đường cao độ riêng (cao độ phụ thuộc thanh đứng trước).", example: "妈妈 mā ma, 吗 ma" },
];

/**
 * Đường cao độ mẫu của từng thanh (5 điểm cách đều theo thời gian), tính bằng nửa cung (semitone) so với trung vị của chính đường đó.
 * Dùng để nhận dạng thanh người học vừa đọc (`classifyTone`); số liệu rút ra từ thang Chao 55 / 35 / 214 / 51 với biên độ thường thấy ở giọng đọc từng âm tiết riêng lẻ.
 */
export const TONE_TEMPLATES: Record<ToneId, number[]> = {
  1: [0.5, 0.3, 0, -0.2, -0.4],
  2: [-3.5, -2.5, -0.5, 2, 3.5],
  3: [0.5, -2, -3.5, -1.5, 3],
  4: [4.5, 2.5, 0, -3, -5],
};

/** Âm tiết đơn quen thuộc cho từng thanh: dùng cho bài luyện đọc (nghe mẫu → đọc lại) và trò nghe đoán thanh. */
export const TONE_PRACTICE: Record<ToneId, { han: string; pinyin: string }[]> = {
  1: [{ han: "妈", pinyin: "mā" }, { han: "高", pinyin: "gāo" }, { han: "山", pinyin: "shān" }, { han: "他", pinyin: "tā" }],
  2: [{ han: "麻", pinyin: "má" }, { han: "人", pinyin: "rén" }, { han: "来", pinyin: "lái" }, { han: "学", pinyin: "xué" }],
  3: [{ han: "马", pinyin: "mǎ" }, { han: "我", pinyin: "wǒ" }, { han: "好", pinyin: "hǎo" }, { han: "水", pinyin: "shuǐ" }],
  4: [{ han: "骂", pinyin: "mà" }, { han: "大", pinyin: "dà" }, { han: "是", pinyin: "shì" }, { han: "去", pinyin: "qù" }],
};
