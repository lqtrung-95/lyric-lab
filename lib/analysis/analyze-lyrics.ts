import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import type { LyricsSourceLabel, SongAnalysis, TokenizedLine, VocabCandidate } from "./analysis-types";
import { assembleSongAnalysis } from "./assemble-song-analysis";
import { SYSTEM_PROMPT, buildAnalysisPrompt } from "./build-analysis-prompt";
import type { ChatFn } from "./groq-chat";
import { llmOutputSchema } from "./llm-output-schema";
import { validateLlmOutput, type Dropped } from "./validate-llm-output";

// Model chính, rồi model dự phòng khi lỗi hoặc kết quả quá nghèo (PRD §7: tự chuyển model khi nhà cung cấp lỗi).
// qwen/qwen3.8-27b bị loại: hạn mức đầu ra 1.000 token/phút không đủ cho một phân tích.
export const DEFAULT_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const MIN_VOCAB_ITEMS = 6;

export interface AnalyzeInput {
  videoId: string;
  lyricsSource: LyricsSourceLabel;
  track?: { title: string; artist: string };
  lines: TokenizedLine[];
  candidates: VocabCandidate[];
  dictionary: ReadonlyMap<string, DictWordRow[]>;
  sinoViet: ReadonlyMap<string, string[]>;
  chat: ChatFn;
  models?: string[];
}

export interface AnalyzeAttempt {
  model: string;
  ok: boolean;
  latencyMs: number;
  error?: string;
  dropped?: Dropped[];
}

export class AnalysisFailedError extends Error {
  constructor(public readonly attempts: AnalyzeAttempt[]) {
    super("Không phân tích được bài hát bằng model nào");
    this.name = "AnalysisFailedError";
  }
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** LLM chọn và giải thích, mọi thứ còn lại được kiểm tra/tra cứu. Thử lần lượt các model cho tới khi ra kết quả đủ dùng. */
export async function analyzeLyrics(input: AnalyzeInput): Promise<{ analysis: SongAnalysis; attempts: AnalyzeAttempt[] }> {
  const prompt = buildAnalysisPrompt(input.lines, input.candidates);
  const attempts: AnalyzeAttempt[] = [];

  for (const model of input.models ?? DEFAULT_MODELS) {
    const t0 = Date.now();
    try {
      const raw = await input.chat({ model, system: SYSTEM_PROMPT, user: prompt });
      const parsed = llmOutputSchema.parse(JSON.parse(raw));
      const validated = validateLlmOutput(parsed, input.lines, input.candidates);
      if (validated.vocab.length < MIN_VOCAB_ITEMS) {
        throw new Error(`Chỉ ${validated.vocab.length} từ hợp lệ (cần ≥ ${MIN_VOCAB_ITEMS})`);
      }
      attempts.push({ model, ok: true, latencyMs: Date.now() - t0, dropped: validated.dropped });
      return { analysis: assembleSongAnalysis({ ...input, llm: parsed, validated, model }), attempts };
    } catch (e) {
      attempts.push({ model, ok: false, latencyMs: Date.now() - t0, error: errMsg(e).slice(0, 300) });
    }
  }
  throw new AnalysisFailedError(attempts);
}
