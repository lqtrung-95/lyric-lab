// Chuẩn hóa kết quả JSON của Azure Pronunciation Assessment (zh-CN) thành danh sách điểm theo từng chữ.
// Với tiếng Trung, Azure đặt điểm từng âm tiết trong `Phonemes` (nhãn dạng "hao 3"), còn `Syllables` chỉ chứa cả từ.
import { numericToToneMark } from "./pinyin-tone-marks";

export type SyllableError = "none" | "omission" | "mispronunciation";
export interface AssessedSyllable {
  /** Chữ Hán (hoặc cả cụm khi Azure không tách được từng âm tiết). */
  han: string;
  /** Pinyin kỳ vọng, có dấu; rỗng khi không biết. */
  pinyin: string;
  /** Pinyin không dấu, không số (để tra mẹo); rỗng khi không biết. */
  base: string;
  score: number;
  error: SyllableError;
}
export interface AssessmentResult {
  /** Điểm chung 0-100: trung bình các âm tiết, đã tính cả chữ bị bỏ sót. */
  overall: number;
  completeness: number;
  fluency: number;
  syllables: AssessedSyllable[];
}

interface AzureWord { Word?: string; AccuracyScore?: number; ErrorType?: string; Phonemes?: { Phoneme?: string; AccuracyScore?: number }[] }
interface AzureResponse { RecognitionStatus?: string; NBest?: { FluencyScore?: number; CompletenessScore?: number; Words?: AzureWord[] }[] }

const HAN = /\p{Script=Han}/u;
const hanChars = (s: string) => [...s].filter((c) => HAN.test(c));
const round = (n: number) => Math.round(Math.max(0, Math.min(100, n)));

export class AssessmentError extends Error {
  constructor(public code: "no_speech" | "bad_response") {
    super(code);
    this.name = "AssessmentError";
  }
}

/** Gộp phản hồi Azure thành kết quả theo chữ. Ném `AssessmentError("no_speech")` khi không nghe thấy giọng nói. */
export function normalizeAssessment(json: unknown): AssessmentResult {
  const res = json as AzureResponse;
  if (res?.RecognitionStatus && res.RecognitionStatus !== "Success") throw new AssessmentError("no_speech");
  const best = res?.NBest?.[0];
  if (!best?.Words?.length) throw new AssessmentError("bad_response");

  const syllables: AssessedSyllable[] = [];
  for (const w of best.Words) {
    const chars = hanChars(w.Word ?? "");
    if (!chars.length) continue;
    const phonemes = w.Phonemes ?? [];
    const omitted = w.ErrorType === "Omission";
    if (!omitted && phonemes.length === chars.length) {
      // Trường hợp thường gặp: mỗi chữ một âm tiết.
      chars.forEach((han, i) => {
        const label = phonemes[i].Phoneme ?? "";
        const score = round(phonemes[i].AccuracyScore ?? 0);
        syllables.push({ han, pinyin: numericToToneMark(label), base: label.trim().split(/\s+/)[0]?.toLowerCase() ?? "", score, error: score < 50 ? "mispronunciation" : "none" });
      });
    } else if (omitted) {
      for (const han of chars) syllables.push({ han, pinyin: "", base: "", score: 0, error: "omission" });
    } else {
      // Số âm tiết không khớp số chữ (ví dụ âm nhi hóa): chấm cả cụm bằng điểm của từ.
      const score = round(w.AccuracyScore ?? 0);
      syllables.push({ han: chars.join(""), pinyin: "", base: "", score, error: w.ErrorType === "Mispronunciation" ? "mispronunciation" : "none" });
    }
  }
  if (!syllables.length) throw new AssessmentError("bad_response");
  const overall = round(syllables.reduce((s, x) => s + x.score, 0) / syllables.length);
  return { overall, completeness: round(best.CompletenessScore ?? 0), fluency: round(best.FluencyScore ?? 0), syllables };
}
