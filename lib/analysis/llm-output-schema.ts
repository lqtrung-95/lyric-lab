import { z } from "zod";

// Đầu ra LLM. LLM chỉ CHỌN và GIẢI THÍCH; pinyin, cấp HSK, Hán Việt, vị trí lấy từ từ điển và tách từ.
export const llmVocabSchema = z.object({
  term: z.string().min(1),
  meaningInContext: z.string().min(1),
  contextNote: z.string().optional(),
  priority: z.number().min(0).max(100),
});

export const llmGrammarSchema = z.object({
  pattern: z.string().min(1),
  explanation: z.string().min(1),
  example: z.object({ zh: z.string().min(1), vi: z.string().min(1) }),
  commonMistake: z.string().optional(),
  level: z.number().int().min(1).max(7).optional(),
  lineIndexes: z.array(z.number().int().min(0)).min(1),
  priority: z.number().min(0).max(100),
});

export const llmOutputSchema = z.object({
  summary: z.string().min(1),
  moods: z.array(z.string().min(1)).min(1).max(4),
  vocab: z.array(llmVocabSchema),
  grammar: z.array(llmGrammarSchema),
  translations: z.array(z.object({ lineIndex: z.number().int().min(0), vi: z.string().min(1) })),
});

export type LlmOutput = z.infer<typeof llmOutputSchema>;
