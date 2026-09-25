import * as OpenCC from "opencc-js";

// Chuyển phồn thể (Đài Loan, Hồng Kông, chung) sang giản thể. Dùng để so khớp và tra từ điển;
// hiển thị vẫn giữ nguyên bản gốc.
const convert = OpenCC.Converter({ from: "t", to: "cn" });

export function toSimplifiedChinese(text: string): string {
  return convert(text);
}
