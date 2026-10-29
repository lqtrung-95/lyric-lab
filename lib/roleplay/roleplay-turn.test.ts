import { describe, expect, it, vi } from "vitest";
import { RoleplayError, runRoleplayTurn } from "./roleplay-turn";
import { buildRoleplayPrompt } from "./build-turn-prompt";
import { findScenario } from "./scenarios";
import { roleplayRequestSchema } from "./turn-schema";

const req = { scenarioId: "cafe", level: 2, history: [{ role: "ai" as const, zh: "你想喝点什么？" }], userText: "我想喝咖啡" };
const good = JSON.stringify({ reply: "好的，要热的还是冰的？", replyVi: "Vâng, nóng hay đá?", tips: ["我要冰的。"], feedback: null });

describe("runRoleplayTurn", () => {
  it("trả lượt đáp hợp lệ, chấp nhận JSON bọc trong khối mã", async () => {
    const chat = vi.fn().mockResolvedValue("```json\n" + good + "\n```");
    const out = await runRoleplayTurn(req, { chat, models: ["m1"] });
    expect(out).toMatchObject({ reply: "好的，要热的还是冰的？", tips: ["我要冰的。"], feedback: null, model: "m1" });
  });
  it("chuyển sang model sau khi model đầu trả sai định dạng", async () => {
    const chat = vi.fn().mockResolvedValueOnce("không phải json").mockResolvedValueOnce(JSON.stringify({ reply: "hello", replyVi: "x" })).mockResolvedValueOnce(good);
    const out = await runRoleplayTurn(req, { chat, models: ["a", "b", "c"] });
    expect(out.model).toBe("c");
  });
  it("ném turn_failed khi mọi model lỗi, rate_limited khi hết hạn mức (không gọi LLM)", async () => {
    await expect(runRoleplayTurn(req, { chat: vi.fn().mockRejectedValue(new Error("x")), models: ["a"] })).rejects.toMatchObject({ code: "turn_failed" });
    const chat = vi.fn();
    await expect(runRoleplayTurn(req, { chat, allowLlmCall: () => false })).rejects.toBeInstanceOf(RoleplayError);
    expect(chat).not.toHaveBeenCalled();
  });
  it("tình huống không có thì ném scenario_not_found", async () => {
    await expect(runRoleplayTurn({ ...req, scenarioId: "nope" }, { chat: vi.fn() })).rejects.toMatchObject({ code: "scenario_not_found" });
  });
});

describe("request schema / prompt", () => {
  it("từ chối cấp ngoài 1-4 và tình huống lạ", () => {
    expect(roleplayRequestSchema.safeParse({ ...req, level: 5 }).success).toBe(false);
    expect(roleplayRequestSchema.safeParse({ ...req, scenarioId: "x" }).success).toBe(false);
    expect(roleplayRequestSchema.safeParse(req).success).toBe(true);
  });
  it("prompt chứa cấp độ, vai và lời người học trong khối trích dẫn", () => {
    const p = buildRoleplayPrompt(findScenario("cafe")!, req);
    expect(p).toContain("HSK 2");
    expect(p).toContain("nhân viên quán cà phê");
    expect(p).toContain('"""\n我想喝咖啡\n"""');
  });
});

describe("kịch bản pet", () => {
  it("có trong danh sách hợp lệ nhưng ẩn khỏi màn chọn chung, prompt giữ vai linh vật và quy tắc an toàn", () => {
    const pet = findScenario("pet")!;
    expect(pet.hidden).toBe(true);
    expect(roleplayRequestSchema.safeParse({ scenarioId: "pet", level: 1, history: [{ role: "ai", zh: pet.opening.zh }], userText: "我学了你好" }).success).toBe(true);
    const p = buildRoleplayPrompt(pet, { scenarioId: "pet", level: 1, history: [{ role: "ai", zh: pet.opening.zh }], userText: "我学了你好" });
    expect(p).toContain("linh vật");
    expect(p).toContain("không phù hợp");
    expect(p).toContain("HSK 1");
  });
  it("linh vật đanh đá: prompt có giọng cà khịa và cho phép sửa lỗi nhỏ; tình huống thường thì không", () => {
    const pet = buildRoleplayPrompt(findScenario("pet")!, { ...req, scenarioId: "pet" });
    expect(pet).toContain("đanh đá");
    expect(pet).toContain("không xúc phạm");
    expect(buildRoleplayPrompt(findScenario("cafe")!, req)).not.toContain("đanh đá");
    expect(pet).not.toContain("Trời ơi, ");
  });
  it("linh vật: kiểu trêu đổi theo số lượt, tình huống thường không có", () => {
    const pets = (n: number) => buildRoleplayPrompt(findScenario("pet")!, { ...req, scenarioId: "pet", history: Array.from({ length: n }, () => ({ role: "ai" as const, zh: "你好" })) });
    expect(pets(1)).not.toBe(pets(2));
    expect(pets(1)).toContain("KIỂU NHẬN XÉT LƯỢT NÀY");
    expect(buildRoleplayPrompt(findScenario("cafe")!, req)).not.toContain("KIỂU NHẬN XÉT");
  });
  it("nhận xét viết bằng tiếng Trung bị loại và thử model sau", async () => {
    const zhIssue = JSON.stringify({ reply: "好的，要热的吗？", replyVi: "Vâng, nóng không?", tips: [], feedback: { issue: "“过得很呢”这个“呢”是语气词，塞在后面不通顺，别硬凑哦。", better: "今天过得很好。" } });
    const viIssue = JSON.stringify({ reply: "好的，要热的吗？", replyVi: "Vâng, nóng không?", tips: [], feedback: { issue: "Chữ '呢' là trợ từ, nhét sau '过得很' nghe cụt ngủn đó nha.", better: "今天过得很好。" } });
    const chat = vi.fn().mockResolvedValueOnce(zhIssue).mockResolvedValueOnce(viIssue);
    const out = await runRoleplayTurn(req, { chat, models: ["a", "b"] });
    expect(out.model).toBe("b");
    expect(out.feedback?.issue).toContain("trợ từ");
  });
});
