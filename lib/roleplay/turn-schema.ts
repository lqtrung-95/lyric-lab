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

export const roleplayOutputSchema = z.object({
  reply: z.string().trim().min(1).max(80).refine((s) => /\p{Script=Han}/u.test(s), "reply phải có chữ Hán"),
  replyVi: z.string().trim().min(1).max(200),
  /** Tối đa 2 mẫu câu người học có thể nói tiếp (chữ Hán). */
  tips: z.array(z.string().trim().min(1).max(40)).max(2).default([]),
  feedback: z.object({ issue: z.string().trim().min(1).max(160), better: z.string().trim().min(1).max(80) }).nullable().default(null),
});
export type RoleplayOutput = z.infer<typeof roleplayOutputSchema>;
