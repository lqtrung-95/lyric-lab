export interface VoiceLike {
  lang: string;
  name: string;
  localService?: boolean;
}

const norm = (l: string) => l.replace("_", "-").toLowerCase();
const isMandarin = (v: VoiceLike) => /^zh(-|$)/.test(norm(v.lang)) && !/^zh-hk|yue/.test(norm(v.lang));

// Giọng thần kinh/cao cấp của hệ điều hành và trình duyệt nghe tự nhiên hơn hẳn giọng cũ (Tingting...).
const HIGH_QUALITY = /natural|neural|premium|enhanced|online|^google|xiaoxiao|xiaoyi|yunxi|yunjian|lili|siri/i;

/** Các giọng Phổ thông có thể dùng, giọng nghe tự nhiên nhất xếp trước. */
export function listChineseVoices<T extends VoiceLike>(voices: T[]): T[] {
  const rank = (v: T) => (HIGH_QUALITY.test(v.name) ? 0 : 4) + (norm(v.lang) === "zh-cn" ? 0 : 2) + (v.localService ? 1 : 0);
  return voices.filter(isMandarin).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

/** Giọng để đọc: giọng người dùng đã chọn (nếu còn trên máy), không thì giọng tự nhiên nhất. */
export function pickChineseVoice<T extends VoiceLike>(voices: T[], preferredName?: string | null): T | null {
  const list = listChineseVoices(voices);
  return (preferredName ? list.find((v) => v.name === preferredName) : undefined) ?? list[0] ?? null;
}

export const speechSupported = () => typeof window !== "undefined" && Boolean(window.speechSynthesis) && typeof SpeechSynthesisUtterance !== "undefined";

export const VOICE_KEY = "lyric-lab-tts-voice";
export function readPreferredVoice(): string | null {
  try {
    return localStorage.getItem(VOICE_KEY);
  } catch {
    return null;
  }
}

/** Đọc một từ/câu tiếng Trung bằng giọng của trình duyệt (Web Speech API). Đang đọc dở thì ngắt để đọc cái mới. */
export function speakChinese(text: string, rate = 0.85): void {
  if (!speechSupported() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  const voice = pickChineseVoice(synth.getVoices(), readPreferredVoice());
  if (voice) utterance.voice = voice as unknown as SpeechSynthesisVoice;
  synth.speak(utterance);
}
