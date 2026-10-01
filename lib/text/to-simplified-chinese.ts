import * as OpenCC from "opencc-js";

// Chuyển phồn thể (Đài Loan, Hồng Kông, chung) sang giản thể. Dùng để so khớp và tra từ điển;
// hiển thị vẫn giữ nguyên bản gốc.
const convert = OpenCC.Converter({ from: "t", to: "cn" });

// OpenCC coi các chữ này hợp lệ ở cả hai thể (không tự đổi), nhưng lời bài hát hay dùng như biến thể phồn thể của
// chữ giản thể tương ứng — CC-CEDICT cũng ghi vậy (vd. 妳 là "you" giống 你, chỉ dùng để chỉ giống cái ở Đài Loan).
// Không đổi thì tra từ điển/ghép pinyin ra rỗng vì `dict_words` chỉ có mục theo giản thể.
// 著: lời phồn thể (Đài Loan/Hồng Kông) hay viết trợ từ "着" (zhe, đang/đã) bằng chữ này — giản thể tách hẳn hai
// chữ (著 chỉ còn nghĩa "著tác/nổi tiếng", zhù), không đổi thì tra ra đúng nghĩa zhù thay vì trợ từ zhe. Đánh đổi:
// từ hiếm mang nghĩa zhù (著名, 著作) trong lời bài hát (nếu có) sẽ bị đổi nhầm — ít gặp hơn nhiều so với trợ từ.
export const MANUAL_VARIANTS: Record<string, string> = { 妳: "你", 著: "着" };

export function toSimplifiedChinese(text: string): string {
  return [...convert(text)].map((ch) => MANUAL_VARIANTS[ch] ?? ch).join("");
}
