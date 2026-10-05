import * as OpenCC from "opencc-js";

// Giản thể sang phồn thể, chỉ để tra âm Hán-Việt (Unihan gán âm cho chữ phồn thể, xem lib/dictionary/sino-viet.ts).
// Chuyển theo từng chữ nên có thể chọn nhầm dạng phồn thể ở chữ đa dạng; nơi dùng chấp nhận việc đó cho phần gợi ý.
const convert = OpenCC.Converter({ from: "cn", to: "t" });

export const toTraditionalChinese = (text: string): string => convert(text);
