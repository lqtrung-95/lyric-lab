import { z } from "zod";
import type { ChatFn } from "@/lib/analysis/groq-chat";

const CONTEXT_LINES = 3;
const SYSTEM =
  "Bạn là người dịch phụ đề tiếng Trung sang tiếng Việt. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON. " +
  "Dịch tự nhiên, sát nghĩa, đúng ngữ cảnh các câu xung quanh; không thêm lời giải thích.";
const outputSchema = z.object({ vi: z.string().min(1).max(400) });

export interface LineForRetranslation {
  text: string;
  translation: string | null;
}

/** Nội dung gửi cho model: vài dòng trước/sau làm ngữ cảnh, dòng cần dịch lại và bản dịch cũ (người học báo là sai). */
export function buildRetranslationPrompt(lines: LineForRetranslation[], idx: number): string {
  const from = Math.max(0, idx - CONTEXT_LINES);
  const context = lines.slice(from, idx + CONTEXT_LINES + 1).map((l, i) => `${from + i}\t${l.text}\t${l.translation ?? ""}`).join("\n");
  const target = lines[idx];
  return (
    `NGỮ CẢNH (mỗi dòng: chỉ số, tab, tiếng Trung, tab, bản dịch hiện có):\n${context}\n\n` +
    `DÒNG CẦN DỊCH LẠI: chỉ số ${idx}: ${target.text}\n` +
    `Bản dịch hiện tại bị người học báo là sai: ${target.translation ?? "(chưa có)"}\n\n` +
    `Trả về JSON: {"vi": "bản dịch tiếng Việt mới của riêng dòng ${idx}"}`
  );
}

/**
 * Dịch lại MỘT dòng, thử lần lượt các model. Trả null khi mọi model lỗi hoặc chỉ cho lại đúng bản dịch cũ (không cải thiện được gì).
 */
export async function retranslateLine(chat: ChatFn, models: string[], lines: LineForRetranslation[], idx: number): Promise<string | null> {
  if (!lines[idx]) return null;
  const user = buildRetranslationPrompt(lines, idx);
  const old = (lines[idx].translation ?? "").trim();
  for (const model of models) {
    try {
      const vi = outputSchema.parse(JSON.parse(await chat({ model, system: SYSTEM, user, maxTokens: 600 }))).vi.trim();
      if (vi && vi !== old) return vi;
    } catch {
      // thử model kế tiếp
    }
  }
  return null;
}
