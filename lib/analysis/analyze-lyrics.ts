import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import type { LyricsSourceLabel, SongAnalysis, TokenizedLine, VocabCandidate } from "./analysis-types";
import { assembleSongAnalysis } from "./assemble-song-analysis";
import { SYSTEM_PROMPT, buildAnalysisPrompt } from "./build-analysis-prompt";
import type { ChatFn } from "./groq-chat";
import { fillMissingTranslations } from "./fill-translations";
import { GEMINI_MODELS } from "./gemini-models";
import { withGroqFallback } from "./openrouter-chat";
import { llmOutputSchema } from "./llm-output-schema";
import { validateLlmOutput, type Dropped } from "./validate-llm-output";

// Model chính, rồi model dự phòng khi lỗi hoặc kết quả quá nghèo (PRD §7: tự chuyển model khi nhà cung cấp lỗi).
// qwen/qwen3.8-27b bị loại: hạn mức đầu ra 1.000 token/phút không đủ cho một phân tích.
// deepseek-chat đứng đầu, gọi THẲNG API DeepSeek (không qua OpenRouter): mạnh tiếng Trung, rẻ, và đo thực tế nhanh/
// ổn định (~1-2s) — deepseek qua OpenRouter từng đứng đầu nhưng đo lại dao động thất thường (có lúc >30s/treo, xem
// lịch sử), đổi sang gọi thẳng mới hết vấn đề đó. Không có DEEPSEEK_API_KEY thì rớt nhanh qua model sau, không lỗi.
// Dự phòng thứ hai: Gemini gọi thẳng bằng GEMINI_API_KEYS (nhiều khóa xoay vòng nên hạn mức rộng). Sau đó
// gemini-2.5-flash qua OpenRouter, và cuối cùng 2 model Groq bằng GROQ_API_KEY → cùng 2 model đó bằng
// FALLBACK_LLM_API_KEY (khóa Groq thứ hai). Groq đặt cuối vì hạn mức token/phút nhỏ, dễ 429.
export const GROQ_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
export const DEFAULT_MODELS = [
  "deepseek:deepseek-chat",
  ...GEMINI_MODELS,
  "openrouter:google/gemini-2.5-flash",
  ...GROQ_MODELS,
  ...withGroqFallback(GROQ_MODELS),
];
// Gemini mặc định chỉ 1024 token / 10s, không đủ cho JSON phân tích cả bài: nới ngang các client khác.
const ANALYSIS_MAX_TOKENS = 4500;
const ANALYSIS_TIMEOUT_MS = 25_000;
const MIN_VOCAB_ITEMS = 6;

export interface AnalyzeInput {
  videoId: string;
  lyricsSource: LyricsSourceLabel;
  track?: { title: string; artist: string };
  lines: TokenizedLine[];
  candidates: VocabCandidate[];
  dictionary: ReadonlyMap<string, DictWordRow[]>;
  pinyinDictionary?: ReadonlyMap<string, DictWordRow[]>;
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
      const raw = await input.chat({ model, system: SYSTEM_PROMPT, user: prompt, maxTokens: ANALYSIS_MAX_TOKENS, timeoutMs: ANALYSIS_TIMEOUT_MS });
      const parsed = llmOutputSchema.parse(JSON.parse(raw));
      const validated = validateLlmOutput(parsed, input.lines, input.candidates);
      if (validated.vocab.length < MIN_VOCAB_ITEMS) {
        throw new Error(`Chỉ ${validated.vocab.length} từ hợp lệ (cần ≥ ${MIN_VOCAB_ITEMS})`);
      }
      attempts.push({ model, ok: true, latencyMs: Date.now() - t0, dropped: validated.dropped });
      const assembled = assembleSongAnalysis({ ...input, llm: parsed, validated, model });
      // Bài dài: LLM hay dịch dở dang. Bù các dòng còn thiếu bằng lượt dịch riêng theo đoạn ngắn.
      const lines = await fillMissingTranslations(assembled.lines, input.chat, input.models ?? DEFAULT_MODELS);
      return { analysis: { ...assembled, lines }, attempts };
    } catch (e) {
      attempts.push({ model, ok: false, latencyMs: Date.now() - t0, error: errMsg(e).slice(0, 300) });
    }
  }
  throw new AnalysisFailedError(attempts);
}
