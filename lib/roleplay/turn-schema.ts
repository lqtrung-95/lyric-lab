import { z } from "zod";
import { SCENARIO_IDS } from "./scenarios";

export const MAX_ROLEPLAY_TURNS = 8;
const MAX_LINE_CHARS = 120;

const lineSchema = z.object({ role: z.enum(["ai", "user"]), zh: z.string().trim().min(1).max(MAX_LINE_CHARS) });

export const roleplayRequestSchema = z.object({
  scenarioId: z.string().refine((id) => SCENARIO_IDS.includes(id), "scenario không hợp lệ"),
  level: z.number().int().min(1).max(4),
  /** Các lượt trước (gồm câu mở đầu của AI), không kể câu vừa nói. */
  history: z.array(lineSchema).max(MAX_ROLEPLAY_TURNS * 2 + 1),
  userText: z.string().trim().min(2).max(MAX_LINE_CHARS),
});
export type RoleplayRequest = z.infer<typeof roleplayRequestSchema>;

/** Lời giải thích phải là tiếng Việt (được trích vài chữ Hán để chỉ ra lỗi): chữ Hán chiếm tối đa 35% số chữ cái và phải có chữ Latinh. Model đôi khi "nhập vai" quá đà và viết nhận xét bằng tiếng Trung. */
export function mostlyVietnamese(text: string): boolean {
  const han = (text.match(/\p{Script=Han}/gu) ?? []).length;
  const latin = (text.match(/\p{Script=Latin}/gu) ?? []).length;
  return latin >= 4 && han / (han + latin) <= 0.35;
}

export const roleplayOutputSchema = z.object({
  reply: z.string().trim().min(1).max(80).refine((s) => /\p{Script=Han}/u.test(s), "reply phải có chữ Hán"),
  replyVi: z.string().trim().min(1).max(200).refine(mostlyVietnamese, "replyVi phải là tiếng Việt"),
  /** Tối đa 2 mẫu câu người học có thể nói tiếp (chữ Hán). */
  tips: z.array(z.string().trim().min(1).max(40)).max(2).default([]),
  feedback: z.object({ issue: z.string().trim().min(1).max(160).refine(mostlyVietnamese, "issue phải là tiếng Việt"), better: z.string().trim().min(1).max(80) }).nullable().default(null),
});
export type RoleplayOutput = z.infer<typeof roleplayOutputSchema>;
