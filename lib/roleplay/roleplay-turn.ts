import type { ChatFn } from "@/lib/analysis/groq-chat";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";
import { hedged } from "./hedged";
import { ROLEPLAY_SYSTEM_PROMPT, buildRoleplayPrompt } from "./build-turn-prompt";
import { findScenario } from "./scenarios";
import { roleplayOutputSchema, type RoleplayOutput, type RoleplayRequest } from "./turn-schema";

const MAX_TOKENS = 400;
/** Sau chừng này mà model đầu chưa đáp thì khởi động thêm model kế song song (xem `hedged`). Một lượt đáp bình thường chỉ ~1–2 giây. */
const HEDGE_MS = 2200;

/** Chuỗi model cho trò chuyện: Gemini flash-lite (đầu chuỗi chung) rồi DeepSeek gọi thẳng (nhanh, ổn định) trước các model suy luận chậm của Groq. Thiếu khóa thì model đó lỗi ngay và chuyển tiếp. */
export const ROLEPLAY_MODELS: string[] = [...EXPLAIN_MODELS.slice(0, 1), "deepseek:deepseek-chat", ...EXPLAIN_MODELS.slice(1)];

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
  /** Chỉ để test: thời gian chờ trước khi chạy thêm model song song. */
  hedgeMs?: number;
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
  try {
    return await hedged(deps.models ?? ROLEPLAY_MODELS, async (model) => {
      const raw = await deps.chat({ model, system: ROLEPLAY_SYSTEM_PROMPT, user: prompt, maxTokens: MAX_TOKENS });
      return { ...roleplayOutputSchema.parse(JSON.parse(stripFence(raw))), model };
    }, deps.hedgeMs ?? HEDGE_MS);
  } catch (e) {
    const lastError = e instanceof Error ? e.message : String(e);
    throw new RoleplayError("turn_failed", `Không trả lời được: ${lastError.slice(0, 120)}`);
  }
}
