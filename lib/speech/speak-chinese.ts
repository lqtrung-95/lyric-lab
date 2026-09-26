/** Chọn giọng đọc tiếng Phổ thông: ưu tiên zh-CN (Đại lục), sau đó mọi giọng zh khác trừ Quảng Đông (zh-HK/yue). */
export function pickChineseVoice(voices: { lang: string; name: string; localService?: boolean }[]) {
  const norm = (l: string) => l.replace("_", "-").toLowerCase();
  const mandarin = voices.filter((v) => /^zh(-|$)/.test(norm(v.lang)) && !/^zh-hk|yue/.test(norm(v.lang)));
  // Trong cùng vùng, giọng có sẵn trên máy (không cần mạng) đọc ổn định hơn.
  const rank = (v: (typeof voices)[number]) => (norm(v.lang) === "zh-cn" ? 0 : 2) + (v.localService ? 0 : 1);
  return [...mandarin].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}

export const speechSupported = () => typeof window !== "undefined" && Boolean(window.speechSynthesis) && typeof SpeechSynthesisUtterance !== "undefined";

/** Đọc một từ/câu tiếng Trung bằng giọng có sẵn của trình duyệt (Web Speech API). Đang đọc dở thì ngắt để đọc cái mới. */
export function speakChinese(text: string, rate = 0.85): void {
  if (!speechSupported() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  const voice = pickChineseVoice(synth.getVoices());
  if (voice) utterance.voice = voice as SpeechSynthesisVoice;
  synth.speak(utterance);
}
