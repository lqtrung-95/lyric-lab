import { numberedPinyinToToneMarks } from "./pinyin-tone-marks";

export interface CedictEntry {
  traditional: string;
  simplified: string;
  pinyin: string;
  meanings: string[];
}

// Dạng dòng: `繁體 简体 [pin1 yin1] /nghĩa 1/nghĩa 2/`
const LINE = /^(\S+) (\S+) \[([^\]]*)\] \/(.+)\/\s*$/;

export function parseCedictLine(line: string): CedictEntry | null {
  if (!line || line.startsWith("#")) return null;
  const m = line.match(LINE);
  if (!m) return null;
  return {
    traditional: m[1],
    simplified: m[2],
    pinyin: numberedPinyinToToneMarks(m[3]),
    meanings: m[4].split("/").map((s) => s.trim()).filter(Boolean),
  };
}

export function parseCedict(text: string): CedictEntry[] {
  return text.split("\n").map(parseCedictLine).filter((e): e is CedictEntry => e !== null);
}
