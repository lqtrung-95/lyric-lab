// Vị trí lưỡi và cách phát âm của từng nhóm âm pinyin (mô tả cắt dọc miệng, nhìn từ bên cạnh, môi ở bên trái). Tự viết theo các giáo trình ngữ âm phổ biến
// (đầu lưỡi/mặt lưỡi/cuống lưỡi, lợi, ngạc cứng, ngạc mềm), không sao chép chữ hay hình của nguồn nào.
export type DiagramKey =
  | "bilabial" | "labiodental" | "alveolar" | "velar" | "alveolopalatal" | "retroflex" | "dental"
  | "vowelA" | "vowelE" | "vowelI" | "vowelU" | "vowelV" | "vowelO" | "vowelEr";

export interface Articulation {
  diagram: DiagramKey;
  /** Chỗ đặt lưỡi / môi (một câu). */
  where: string;
  /** Cách phát âm các âm trong nhóm. */
  how: string[];
}

/** Theo id nhóm trong `pinyin-chart-data.ts`. */
export const GROUP_ARTICULATION: Record<string, Articulation> = {
  moi: {
    diagram: "bilabial",
    where: "Hai môi khép chặt; lưỡi nằm thả lỏng, thấp.",
    how: ["b, p: môi khép rồi bật mở cho hơi thoát ra. p thổi hơi mạnh, b thì không.", "m: môi khép, hơi thoát qua mũi và dây thanh rung."],
  },
  "dau-luoi": {
    diagram: "alveolar",
    where: "Đầu lưỡi chạm lợi trên, tức phần nướu ngay sau răng cửa trên.",
    how: ["d, t: đầu lưỡi chạm lợi rồi hạ nhanh cho hơi bật ra. t bật hơi mạnh, d thì không.", "n: giữ đầu lưỡi ở lợi, hơi thoát qua mũi.", "l: đầu lưỡi chạm lợi, hơi thoát ra hai bên lưỡi."],
  },
  "goc-luoi": {
    diagram: "velar",
    where: "Cuống lưỡi (phần sau lưỡi) nâng lên chạm ngạc mềm, tức vòm mềm phía sau miệng. Đầu lưỡi nằm thấp.",
    how: ["g, k: cuống lưỡi chạm ngạc mềm rồi buông ra cho hơi bật. k bật hơi mạnh, g thì không.", "h: cuống lưỡi nâng gần ngạc mềm nhưng không chạm, hơi cọ xát qua khe hẹp."],
  },
  "mat-luoi": {
    diagram: "alveolopalatal",
    where: "Đầu lưỡi hạ xuống sát mặt sau răng dưới; mặt lưỡi (phần giữa lưỡi) nâng áp sát ngạc cứng. Môi dẹt như đang cười.",
    how: ["j, q: mặt lưỡi áp ngạc cứng rồi nhả cho hơi cọ xát. q bật hơi mạnh, j thì không.", "x: mặt lưỡi sát ngạc cứng nhưng không chạm, hơi cọ xát qua khe."],
  },
  "uon-luoi": {
    diagram: "retroflex",
    where: "Đầu lưỡi nâng lên, hơi cuốn về phía sau, hướng tới ngạc cứng ngay sau lợi. Đầu lưỡi không chạm răng.",
    how: ["zh, ch: đầu lưỡi áp vòm rồi nhả cho hơi cọ xát. ch bật hơi mạnh, zh thì không.", "sh: đầu lưỡi gần vòm, hơi cọ xát qua khe.", "r: giống sh nhưng dây thanh rung."],
  },
  "rang-luoi": {
    diagram: "dental",
    where: "Đầu lưỡi phẳng, đặt sát mặt sau răng cửa trên (gần chân răng); không cuốn lên vòm. Môi dẹt.",
    how: ["z, c: đầu lưỡi áp sát răng rồi nhả cho hơi cọ xát. c bật hơi mạnh, z thì không.", "s: đầu lưỡi sát răng, hơi cọ xát qua khe."],
  },
  "mui-n": {
    diagram: "alveolar",
    where: "Đầu lưỡi chạm lợi trên và giữ nguyên ở đó đến hết âm.",
    how: ["Hơi thoát qua mũi, dây thanh rung. Đọc in, en, an: kết thúc bằng đầu lưỡi chạm lợi."],
  },
  "mui-ng": {
    diagram: "velar",
    where: "Cuống lưỡi nâng chạm ngạc mềm; đầu lưỡi buông tự do, KHÔNG chạm lợi.",
    how: ["Hơi thoát qua mũi, âm kết thúc ở phía sau miệng. Đây là điểm khác với -n: in và ing, en và eng."],
  },
};

/** Riêng một số âm trong nhóm: f (môi–răng) và các nguyên âm đơn, theo ký hiệu. */
export const SOUND_ARTICULATION: Record<string, Articulation> = {
  f: { diagram: "labiodental", where: "Răng cửa trên chạm nhẹ môi dưới.", how: ["Hơi cọ xát qua khe giữa răng và môi, như 'ph' tiếng Việt."] },
  a: { diagram: "vowelA", where: "Hàm hạ thấp, miệng mở rộng; lưỡi nằm thấp và phẳng.", how: ["Môi không tròn."] },
  o: { diagram: "vowelO", where: "Môi tròn vừa; cuống lưỡi nâng ở mức giữa.", how: ["Không chu môi quá nhiều."] },
  e: { diagram: "vowelE", where: "Miệng mở vừa, môi không tròn; cuống lưỡi nâng ở mức giữa, lùi về sau.", how: ["Nếu môi tròn thì thành 'o'."] },
  i: { diagram: "vowelI", where: "Môi dẹt; phần trước của lưỡi nâng cao gần ngạc cứng, đầu lưỡi gần răng dưới.", how: ["Miệng gần như khép."] },
  u: { diagram: "vowelU", where: "Môi chu tròn nhỏ; cuống lưỡi nâng cao gần ngạc mềm.", how: ["Đầu lưỡi lùi khỏi răng."] },
  "ü": { diagram: "vowelV", where: "Lưỡi ở vị trí như khi đọc i, rồi chu tròn môi như đọc u.", how: ["Lưỡi KHÔNG lùi về sau; chỉ môi thay đổi."] },
  er: { diagram: "vowelEr", where: "Miệng mở vừa; đầu lưỡi cuốn nhẹ lên như khi đọc r.", how: ["Đọc 'ơ' rồi cong đầu lưỡi lên."] },
};

/** Ba nhóm phụ âm người Việt hay lẫn, đặt cạnh nhau để so sánh. */
export const COMPARE_GROUPS: { id: string; label: string; diagram: DiagramKey; point: string }[] = [
  { id: "mat-luoi", label: "j q x", diagram: "alveolopalatal", point: "Mặt lưỡi áp ngạc cứng, đầu lưỡi hạ sau răng dưới, môi dẹt." },
  { id: "uon-luoi", label: "zh ch sh r", diagram: "retroflex", point: "Đầu lưỡi cuốn lên, hướng tới ngạc cứng sau lợi." },
  { id: "rang-luoi", label: "z c s", diagram: "dental", point: "Đầu lưỡi phẳng, sát mặt sau răng cửa trên." },
];
