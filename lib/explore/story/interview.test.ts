import { describe, expect, it } from "vitest";
import { buildInterview } from "./interview";
import { enterNode, pickEntry, step } from "./dialogue";
import { emptyStory } from "./story-state";

const spec = {
  prefix: "chef", speaker: "chef",
  greeting: { zh: "你好!", vi: "Chào!" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Hôm qua ba giờ chiều ông ở đâu?" },
  chatter: [{ ask: { zh: "你吃饭了吗?", vi: "Ông ăn cơm chưa?" }, reply: { zh: "吃了。", vi: "Ăn rồi." } }],
  answer: { zh: "我在厨房。", vi: "Tôi ở trong bếp." },
  check: { vi: "Ông ấy ở đâu?", right: { zh: "在厨房", vi: "Trong bếp" }, wrong: [{ zh: "在医院", vi: "Ở bệnh viện" }, { zh: "在公园", vi: "Ở công viên" }] },
  clue: "chef_alibi", metFlag: "met:chef", closing: { zh: "再见。", vi: "Tạm biệt." }, after: { zh: "还有事吗?", vi: "Còn việc gì không?" },
};

describe("buildInterview", () => {
  const { nodes, entries } = buildInterview(spec);

  it("mọi liên kết trong đồ thị đều trỏ tới câu có thật", () => {
    for (const n of Object.values(nodes)) {
      const targets = [n.next, ...(n.choices ?? []).map((c) => c.next)].filter((t): t is string => t !== null && t !== undefined);
      for (const t of targets) expect(nodes[t], `${n.id} → ${t}`).toBeDefined();
    }
    for (const e of entries) expect(nodes[e.node]).toBeDefined();
  });

  it("vào lần đầu là lời chào, đã khai rồi thì vào lời 'after'", () => {
    expect(pickEntry(entries, [])).toBe("chef_hi");
    expect(pickEntry(entries, ["met:chef"])).toBe("chef_after");
  });

  it("câu kiểm tra: đáp án đúng đặt ở vị trí rightAt, đúng thì ghi manh mối và cờ, sai thì nghe lại và không ghi", () => {
    const check = nodes.chef_check;
    expect(check.choices!.map((c) => c.check)).toEqual(["wrong", "right", "wrong"]);
    const wrong = step(check, emptyStory(), 0);
    expect(wrong.next).toBe("chef_again");
    expect(wrong.progress.checks).toEqual({ right: 0, total: 1 });
    expect(nodes.chef_again.next).toBe("chef_ans");

    const right = step(check, emptyStory(), 1);
    expect(right.next).toBe("chef_ok");
    const withClue = enterNode(right.progress, nodes.chef_ok);
    expect(withClue.clues).toEqual(["chef_alibi"]);
    expect(withClue.flags).toContain("met:chef");
    expect(withClue.checks).toEqual({ right: 1, total: 1 });
  });

  it("hỏi lạc đề quay lại menu hỏi; cuộc hỏi có điều kiện mở (gate) chỉ vào được khi đủ cờ", () => {
    expect(step(nodes.chef_ask, emptyStory(), 1).next).toBe("chef_chat0");
    expect(nodes.chef_chat0.next).toBe("chef_ask");
    const gated = buildInterview({ ...spec, gate: { all: ["a"] } });
    expect(pickEntry(gated.entries, [])).toBeNull();
    expect(pickEntry(gated.entries, ["a"])).toBe("chef_hi");
    expect(pickEntry(gated.entries, ["a", "met:chef"])).toBe("chef_after");
  });
});
