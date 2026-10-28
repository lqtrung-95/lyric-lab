import { describe, expect, it } from "vitest";
import { SCENES } from "@/lib/explore/scenes";
import { COOP_ITEMS } from "./coop-items";
import { COOP_PLACES } from "./coop-places";
import { allComposedMessages, composeMessage, parseMessage } from "./coop-messages";
import { parseProposal, parseReply, parseReport, parseVerdict, sharedFlags } from "./coop-events";
import { COOP_BONUS, coopPoints, parseCoopRecord, withCoopSolve } from "./coop-reward";
import { splitForTts } from "@/lib/speech/split-for-tts";

describe("nơi chốn bằng tiếng Trung", () => {
  it("mỗi cảnh có tên tiếng Trung riêng, không trùng nhau", () => {
    for (const id of Object.keys(SCENES)) expect(COOP_PLACES[id], id).toBeDefined();
    const zh = Object.values(COOP_PLACES).map((p) => p.zh);
    expect(new Set(zh).size).toBe(zh.length);
  });
});

describe("đồ vật", () => {
  it("chữ Hán đồ vật không trùng và không trùng tên nơi chốn", () => {
    const zh = COOP_ITEMS.map((i) => i.zh);
    expect(new Set(zh).size).toBe(zh.length);
    for (const p of Object.values(COOP_PLACES)) expect(zh).not.toContain(p.zh);
  });
});

describe("câu ghép từ mẫu", () => {
  it("ghép mẫu có chỗ trống với nơi chốn, mẫu không chỗ trống thì dùng nguyên", () => {
    expect(composeMessage("at", "hospital")).toEqual({ zh: "我在医院。", vi: "Tôi đang ở Bệnh viện." });
    expect(composeMessage("agree")).toEqual({ zh: "我同意。", vi: "Tôi đồng ý." });
    expect(composeMessage("at")).toBeNull();
    expect(composeMessage("at", "không-có")).toBeNull();
    expect(composeMessage("sawo", "笔")).toEqual({ zh: "你看见笔了吗?", vi: "Bạn có thấy bút không?" });
    expect(composeMessage("sawo", "hospital")).toBeNull(); // đồ vật không nhận id nơi chốn
    expect(composeMessage("lạ", "room")).toBeNull();
  });

  it("chỉ nhận tin khớp đúng một câu ghép; chữ lạ, câu dài hoặc nơi chốn ngoài vụ án bị bỏ", () => {
    expect(parseMessage("你去书店看看。")?.vi).toBe("Bạn đến Hiệu sách xem thử.");
    expect(parseMessage("我找到了钥匙。")?.vi).toBe("Tôi đã tìm thấy chìa khóa.");
    expect(parseMessage("我找到了大象。")).toBeNull();
    expect(parseMessage("tùy ý")).toBeNull();
    expect(parseMessage(42)).toBeNull();
    expect(parseMessage("我在医院。<script>")).toBeNull();
  });

  it("mọi câu ghép đều đọc được bằng giọng tạo sẵn (≤ 40 ký tự) và không trùng", () => {
    const all = allComposedMessages();
    expect(new Set(all.map((m) => m.zh)).size).toBe(all.length);
    for (const m of all) for (const part of splitForTts(m.zh)) expect(part.length, m.zh).toBeLessThanOrEqual(40);
  });
});

describe("tin đặc biệt qua kênh", () => {
  const ids = { clues: ["c1", "c2", "c3"], suspects: ["s1", "s2"] };

  it("báo manh mối: chỉ nhận manh mối của vụ án", () => {
    expect(parseReport({ from: "a", clueId: "c2" }, ids)).toEqual({ from: "a", clueId: "c2" });
    expect(parseReport({ from: "a", clueId: "zzz" }, ids)).toBeNull();
    expect(parseReport({ from: "x", clueId: "c1" }, ids)).toBeNull();
    expect(parseReport(null, ids)).toBeNull();
    // Kèm đoạn thoại hợp lệ thì giữ, đoạn hỏng thì bỏ riêng đoạn đó.
    expect(parseReport({ from: "a", clueId: "c1", clip: { mime: "audio/webm", b64: "QUJD" } }, ids)?.clip).toEqual({ mime: "audio/webm", b64: "QUJD" });
    expect(parseReport({ from: "a", clueId: "c1", clip: { mime: "x/y", b64: "QUJD" } }, ids)).toEqual({ from: "a", clueId: "c1" });
  });

  it("đề nghị buộc tội: nghi phạm tối đa hai, bằng chứng thuộc vụ án, bỏ trùng", () => {
    expect(parseProposal({ from: "b", suspectIds: ["s1"], clueIds: ["c1", "c1", "c3"] }, ids)).toEqual({ from: "b", suspectIds: ["s1"], clueIds: ["c1", "c3"] });
    expect(parseProposal({ from: "b", suspectIds: ["s1", "s2", "s1"], clueIds: ["c1"] }, ids)).toBeNull();
    expect(parseProposal({ from: "b", suspectIds: ["lạ"], clueIds: ["c1"] }, ids)).toBeNull();
    expect(parseProposal({ from: "b", suspectIds: ["s1"], clueIds: [] }, ids)).toBeNull();
  });

  it("trả lời và kết quả", () => {
    expect(parseReply({ from: "a", ok: true })).toEqual({ from: "a", ok: true });
    expect(parseReply({ from: "a", ok: "yes" })).toBeNull();
    expect(parseVerdict({ from: "b", kind: "solved" })).toEqual({ from: "b", kind: "solved" });
    expect(parseVerdict({ from: "b", kind: "khác" })).toBeNull();
  });

  it("cờ chia sẻ bỏ cờ manh mối riêng", () => {
    expect(sharedFlags(["met:cat", "clue:letter", "talked"])).toEqual(["met:cat", "talked"]);
  });
});

describe("thưởng cặp thám tử", () => {
  it("điểm nhân 1,5 và không vượt trần mỗi câu của server", () => {
    expect(COOP_BONUS).toBe(1.5);
    expect(coopPoints(800)).toBe(1200);
    expect(coopPoints(100) <= 150).toBe(true);
  });

  it("ghi nhận mỗi vụ và mỗi ngày một lần, đọc dữ liệu hỏng thì rỗng", () => {
    const once = withCoopSolve({ solved: [], days: [] }, "toy-thief", "2026-10-28");
    expect(withCoopSolve(once, "toy-thief", "2026-10-28")).toEqual(once);
    expect(withCoopSolve(once, "lost-kite", "2026-10-29")).toEqual({ solved: ["toy-thief", "lost-kite"], days: ["2026-10-28", "2026-10-29"] });
    expect(parseCoopRecord(null)).toEqual({ solved: [], days: [] });
    expect(parseCoopRecord({ solved: [1, "a"], days: "x" })).toEqual({ solved: ["a"], days: [] });
  });
});
