/**
 * Lọc từ tục cơ bản cho biệt danh (không thay được việc báo cáo người chơi). Tên được chuẩn hóa (bỏ dấu, chữ thường, đổi các ký tự
 * thay chữ như 0→o, 1→i, @→a, bỏ ký tự phân cách) trước khi so khớp:
 * - cụm đủ dài và không gây nhầm: khớp ở bất kỳ đâu trong tên đã bỏ phân cách;
 * - từ viết tắt/từ ngắn dễ nằm trong từ vô hại ("lon" trong "long"): chỉ khớp khi là một từ riêng trong tên.
 */
const SUBSTRING_TERMS = [
  "ditme", "ditmay", "dume", "duma", "dumay", "concac", "cailon", "dcm", "dkm", "deomemay", "conmemay", "thangcho", "concho", "oc cho".replace(" ", ""),
  "fuck", "shit", "bitch", "cunt", "nigger", "nigga", "pussy", "whore", "slut", "hitler",
];
const WHOLE_WORD_TERMS = ["dm", "dmm", "vcl", "vkl", "vl", "lon", "cac", "dit"];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };

const plain = (input: string) => input.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
const leet = (s: string) => s.replace(/[013457@$]/g, (c) => LEET[c] ?? c);

export function containsBlockedWord(nickname: string): boolean {
  const folded = plain(nickname);
  // Từ riêng: số và ký tự lạ là dấu ngăn cách ("vcl123" → "vcl"), không đổi chữ.
  const words = folded.split(/[^a-z]+/).filter(Boolean);
  if (words.some((w) => WHOLE_WORD_TERMS.includes(w))) return true;
  const squashed = leet(folded).replace(/[^a-z]/g, "");
  return SUBSTRING_TERMS.some((t) => squashed.includes(t));
}
