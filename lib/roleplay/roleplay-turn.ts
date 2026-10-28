import type { ChatFn } from "@/lib/analysis/groq-chat";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";
import { ROLEPLAY_SYSTEM_PROMPT, buildRoleplayPrompt } from "./build-turn-prompt";
import { findScenario } from "./scenarios";
import { roleplayOutputSchema, type RoleplayOutput, type RoleplayRequest } from "./turn-schema";

const MAX_TOKENS = 400;

export type RoleplayErrorCode = "scenario_not_found" | "rate_limited" | "turn_failed";

export class RoleplayError extends Error {
  constructor(public readonly code: RoleplayErrorCode, message: string) {
    super(message);
    this.name = "RoleplayError";
  }
}

export interface RoleplayDeps {
  chat: ChatFn;
  models?: string[];
  /** Gọi ngay trước khi tốn token LLM (áp hạn mức). Trả false để từ chối. */
  allowLlmCall?: () => boolean | Promise<boolean>;
}

/** Bỏ rào ```json nếu model lỡ bọc JSON trong khối mã. */
const stripFence = (raw: string): string => raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

/** Một lượt trò chuyện: AI đóng vai đáp lại câu người học kèm nghĩa, câu gợi ý và (nếu có lỗi rõ) một lời sửa. Thử lần lượt các model, lỗi hết thì ném `turn_failed`. */
export async function runRoleplayTurn(req: RoleplayRequest, deps: RoleplayDeps): Promise<RoleplayOutput & { model: string }> {
  const scenario = findScenario(req.scenarioId);
  if (!scenario) throw new RoleplayError("scenario_not_found", "Không có tình huống này");
  if (deps.allowLlmCall && !(await deps.allowLlmCall())) throw new RoleplayError("rate_limited", "Hết lượt trò chuyện hôm nay");
  const prompt = buildRoleplayPrompt(scenario, req);
  let lastError = "";
  for (const model of deps.models ?? EXPLAIN_MODELS) {
    try {
      const raw = await deps.chat({ model, system: ROLEPLAY_SYSTEM_PROMPT, user: prompt, maxTokens: MAX_TOKENS });
      return { ...roleplayOutputSchema.parse(JSON.parse(stripFence(raw))), model };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new RoleplayError("turn_failed", `Không trả lời được: ${lastError.slice(0, 120)}`);
}
