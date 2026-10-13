/**
 * Lọc từ tục cho TIN NHẮN (khác bộ lọc biệt danh: biệt danh được khớp rộng tay, còn tin nhắn dài nên chỉ chặn các từ chắc chắn là chửi tục).
 * Văn bản được bỏ dấu, chữ thường, đổi 0→o, 1→i... rồi tách thành từ; chỉ khớp từ riêng hoặc hai từ liền nhau ghép lại ("dit me"), không khớp bên trong từ khác
 * và không bỏ khoảng trắng ("đủ mệt" không bị nhầm thành "dume").
 */
const STRONG_TERMS = new Set([
  "ditme", "ditmay", "dume", "duma", "dumay", "concac", "cailon", "dcm", "dkm", "dmm", "vcl", "vkl", "deomemay", "conmemay", "thangcho", "concho", "ocho", "ocho",
  "fuck", "fuk", "shit", "bitch", "cunt", "nigger", "nigga", "pussy", "whore", "slut",
]);
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };
const plain = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase().replace(/[013457@$]/g, (c) => LEET[c] ?? c);

export function containsChatProfanity(text: string): boolean {
  const words = plain(text).split(/[^a-z]+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    if (STRONG_TERMS.has(words[i])) return true;
    if (i + 1 < words.length && STRONG_TERMS.has(words[i] + words[i + 1])) return true;
  }
  return false;
}
