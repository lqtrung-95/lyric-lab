import type { Condition, DialogueEntry, DialogueNode } from "./story-types";

interface Line { zh: string; vi: string }

export interface InterviewSpec {
  /** Tiền tố id câu thoại (duy nhất trong cảnh), ví dụ "chef". */
  prefix: string;
  /** Người được hỏi. */
  speaker: string;
  greeting: Line;
  /** Câu hỏi chính của người chơi (hỏi đúng thì NPC trả lời). */
  question: Line;
  /** Vài câu hỏi lạc đề (gây nhiễu, cũng là cơ hội học câu): hỏi xong NPC đáp rồi quay lại chọn tiếp. */
  chatter?: { ask: Line; reply: Line }[];
  answer: Line;
  /** Câu kiểm tra hiểu lời khai: hỏi bằng tiếng Việt, chọn đáp án tiếng Trung. Chọn sai thì nghe lại. */
  check: { vi: string; right: Line; wrong: Line[]; /** Vị trí đáp án đúng trong danh sách (0 = đầu). */ rightAt?: number };
  /** Manh mối ghi vào sổ khi hiểu đúng, và cờ "đã nghe lời khai". */
  clue: string;
  metFlag: string;
  closing: Line;
  /** Lời khi người chơi quay lại lần sau. */
  after: Line;
  /** Điều kiện để cuộc hỏi này mở (mặc định luôn mở). */
  gate?: Condition;
}

/**
 * Dựng đồ thị hội thoại "thẩm vấn" chuẩn: chào → hỏi (có thể hỏi lạc đề) → khai → câu kiểm tra hiểu (sai thì nghe lại) → ghi manh mối → lời khép lại.
 * Trả các câu thoại và điểm vào (khi đã khai rồi thì vào lời "after"). Dùng chung cho mọi nghi phạm/nhân chứng để cấu trúc nhất quán.
 */
export function buildInterview(spec: InterviewSpec): { nodes: Record<string, DialogueNode>; entries: DialogueEntry[] } {
  const p = spec.prefix;
  const id = (s: string) => `${p}_${s}`;
  const nodes: Record<string, DialogueNode> = {};
  const add = (n: DialogueNode) => { nodes[n.id] = n; };

  add({ id: id("hi"), speaker: spec.speaker, ...spec.greeting, next: id("ask") });
  add({
    id: id("ask"), speaker: "player", zh: "", vi: "Bạn muốn nói gì?",
    choices: [
      { ...spec.question, next: id("ans") },
      ...(spec.chatter ?? []).map((c, i) => ({ ...c.ask, next: id(`chat${i}`) })),
    ],
  });
  (spec.chatter ?? []).forEach((c, i) => add({ id: id(`chat${i}`), speaker: spec.speaker, ...c.reply, next: id("ask") }));
  add({ id: id("ans"), speaker: spec.speaker, ...spec.answer, next: id("check") });

  const options = spec.check.wrong.map((w) => ({ ...w, next: id("again"), check: "wrong" as const }));
  const at = Math.min(spec.check.rightAt ?? 1, options.length);
  options.splice(at, 0, { ...spec.check.right, next: id("ok"), check: "right" as never });
  add({ id: id("check"), speaker: "player", zh: "", vi: spec.check.vi, choices: options });
  add({ id: id("again"), speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại lời khai nào…", next: id("ans") });
  add({ id: id("ok"), speaker: "player", zh: "", vi: "Đã ghi lời khai vào sổ vụ án.", effects: [{ clue: spec.clue }, { flag: spec.metFlag }], next: id("close") });
  add({ id: id("close"), speaker: spec.speaker, ...spec.closing, next: null });
  add({ id: id("after"), speaker: spec.speaker, ...spec.after, next: null });

  const gateAll = spec.gate?.all ?? [];
  return {
    nodes,
    entries: [
      { when: { all: [spec.metFlag, ...gateAll], none: spec.gate?.none }, node: id("after") },
      { when: spec.gate, node: id("hi") },
    ],
  };
}
