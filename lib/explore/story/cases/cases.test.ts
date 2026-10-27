import { describe, expect, it } from "vitest";
import { judge, linkClues, readyToAccuse } from "../deduction";
import { enterNode, pickEntry, step } from "../dialogue";
import { currentObjective, sceneUnlocked } from "../objectives";
import { storyExits, storyRoute } from "../story-route";
import { applyEffects, emptyStory, holds } from "../story-state";
import type { Condition, Effect, StoryDef, StoryProgress } from "../story-types";
import { SCENES } from "@/lib/explore/scenes";
import { CASES } from ".";

const conds = (c?: Condition) => [...(c?.all ?? []), ...(c?.none ?? [])];
const effectFlags = (effects?: Effect[]) => (effects ?? []).flatMap((e) => ("flag" in e ? [e.flag] : [`clue:${e.clue}`]));

/** Mọi cờ có thể được đặt trong vụ án: từ hiệu ứng câu thoại/lựa chọn, manh mối ở chỗ xem xét, và cờ phá án xong. */
function producibleFlags(story: StoryDef): Set<string> {
  const out = new Set<string>([story.solvedFlag]);
  for (const sc of Object.values(story.scenes)) {
    for (const n of Object.values(sc.dialogues)) {
      effectFlags(n.effects).forEach((f) => out.add(f));
      for (const c of n.choices ?? []) effectFlags(c.effects).forEach((f) => out.add(f));
    }
    for (const s of sc.spots ?? []) out.add(`clue:${s.clue}`);
  }
  for (const c of story.clues) if (c.kind === "deduction") out.add(`clue:${c.id}`);
  return out;
}

/** Đi hết một hội thoại theo đường "lý tưởng": ưu tiên câu trả lời đúng ở câu kiểm tra, không thì lựa chọn đầu tiên; mỗi câu đi qua tối đa một lần. */
function playIdeal(story: StoryDef, sceneId: string, entry: string, start: StoryProgress): StoryProgress {
  const nodes = story.scenes[sceneId].dialogues;
  let p = start;
  let id: string | null = entry;
  const seen = new Set<string>();
  while (id && !seen.has(id)) {
    seen.add(id);
    const node: (typeof nodes)[string] = nodes[id];
    p = enterNode(p, node);
    const choices = (node.choices ?? []).filter((c) => holds(c.when, p.flags));
    const idx = Math.max(0, choices.findIndex((c) => c.check === "right"));
    const stepped = step(node, p, choices.length ? idx : null);
    p = stepped.progress;
    id = stepped.next;
  }
  return p;
}

describe.each(Object.values(CASES))("vụ án $id", (story) => {
  it("mọi liên kết hội thoại trỏ tới câu có thật cùng cảnh; điểm vào hợp lệ; mọi cảnh có câu thoại chứa tối thiểu một điểm vào", () => {
    for (const sc of Object.values(story.scenes)) {
      for (const n of Object.values(sc.dialogues)) {
        expect(n.id, "id khớp khóa").toBe(Object.keys(sc.dialogues).find((k) => sc.dialogues[k] === n));
        const targets = [n.next, ...(n.choices ?? []).map((c) => c.next)].filter((t): t is string => !!t);
        for (const t of targets) expect(sc.dialogues[t], `${sc.sceneId}/${n.id} → ${t}`).toBeDefined();
        expect(story.speakers[n.speaker], `${n.id}: người nói ${n.speaker}`).toBeDefined();
        expect(n.zh !== "" || n.vi !== "", `${n.id} rỗng`).toBe(true);
      }
      for (const e of [...(sc.sceneNpcEntries ?? []), ...(sc.npcs ?? []).flatMap((x) => x.entries)]) expect(sc.dialogues[e.node], e.node).toBeDefined();
      expect((sc.sceneNpcEntries?.length ?? 0) + (sc.npcs?.length ?? 0), sc.sceneId).toBeGreaterThan(0);
    }
  });

  it("manh mối, nghi phạm, lời giải tham chiếu tới thứ có thật", () => {
    const clueIds = new Set(story.clues.map((c) => c.id));
    expect(clueIds.size).toBe(story.clues.length);
    for (const sc of Object.values(story.scenes)) {
      for (const s of sc.spots ?? []) expect(clueIds.has(s.clue), s.id).toBe(true);
      for (const n of Object.values(sc.dialogues)) for (const f of [...(n.effects ?? []), ...(n.choices ?? []).flatMap((c) => c.effects ?? [])]) if ("clue" in f) expect(clueIds.has(f.clue), f.clue).toBe(true);
    }
    for (const k of story.solution.keyClues) expect(clueIds.has(k), k).toBe(true);
    for (const d of story.clues.filter((c) => c.kind === "deduction")) {
      expect(d.link, d.id).toHaveLength(2);
      for (const l of d.link!) expect(story.clues.find((c) => c.id === l && c.kind !== "deduction"), `${d.id} → ${l}`).toBeDefined();
    }
    expect(story.suspects.map((s) => s.id)).toContain(story.solution.suspectId);
    expect(story.solution.needed).toBeLessThanOrEqual(story.solution.keyClues.length);
  });

  it("mọi cờ dùng làm điều kiện đều có cách được đặt (không có mục tiêu hay hội thoại bị khóa vĩnh viễn)", () => {
    const can = producibleFlags(story);
    const all: Condition[] = [...story.objectives.flatMap((o) => [o.when, o.done]).filter((c): c is Condition => !!c)];
    for (const sc of Object.values(story.scenes)) {
      for (const e of [...(sc.sceneNpcEntries ?? []), ...(sc.npcs ?? []).flatMap((x) => x.entries)]) if (e.when) all.push(e.when);
      for (const s of sc.spots ?? []) if (s.when) all.push(s.when);
      for (const n of Object.values(sc.dialogues)) for (const c of n.choices ?? []) if (c.when) all.push(c.when);
    }
    for (const c of all) for (const f of conds(c)) expect(can.has(f) || f.startsWith("met:"), `cờ ${f}`).toBe(true);
    for (const s of story.suspects.filter((x) => !x.virtual)) expect(can.has(s.metFlag), s.metFlag).toBe(true);
  });

  it("chơi theo đường lý tưởng thì đi hết các mục tiêu và buộc tội đúng được (vụ án giải được)", () => {
    let p = emptyStory();
    for (let round = 0; round < 20; round++) {
      const before = p.flags.length;
      for (const sc of Object.values(story.scenes)) {
        const entry = pickEntry(sc.sceneNpcEntries, p.flags);
        if (entry && !entry.endsWith("_after") && !entry.endsWith("_idle")) p = playIdeal(story, sc.sceneId, entry, p);
        for (const s of sc.spots ?? []) if (holds(s.when, p.flags)) p = applyEffects(p, [{ clue: s.clue }]);
      }
      if (p.flags.length === before) break;
    }
    // Người chơi nối các cặp manh mối để ra suy luận (chỉ vụ có suy luận).
    for (const d of story.clues.filter((c) => c.kind === "deduction")) {
      const r = linkClues(story, p, d.link![0], d.link![1]);
      expect(r.status, `nối ${d.id}`).toBe("linked");
      if (r.status === "linked") p = r.progress;
    }
    expect(readyToAccuse(story.suspects, p.flags)).toBe(true);
    expect(judge(story, [story.solution.suspectId, ...(story.solution.partnerId ? [story.solution.partnerId] : [])], story.solution.keyClues.slice(0, story.solution.needed)).type).toBe("solved");
    for (const k of story.solution.keyClues) expect(p.clues, k).toContain(k);
    p = applyEffects(p, [{ flag: story.solvedFlag }]);
    expect(currentObjective(story.objectives, p.flags)).toBeNull();
    expect(p.checks.right).toBeGreaterThan(0);
  });

  it("buộc tội sai người hoặc thiếu bằng chứng thì không phá án", () => {
    const wrong = story.suspects.find((s) => s.id !== story.solution.suspectId && s.id !== story.solution.partnerId)!;
    expect(judge(story, wrong.id, story.solution.keyClues).type).toBe("wrong_suspect");
    expect(judge(story, [story.solution.suspectId, ...(story.solution.partnerId ? [story.solution.partnerId] : [])], []).type).toBe("weak_evidence");
  });
});

describe("khóa cảnh theo thứ tự mục tiêu", () => {
  const story = CASES["wooden-box"];
  const open = (flags: string[], scene: string) => sceneUnlocked(story.objectives, story.startScene, flags, scene);

  it("chưa gặp Cú Thầy thì chỉ có cảnh xuất phát", () => {
    expect(open([], "room")).toBe(true);
    for (const id of ["restaurant", "market", "station", "hospital", "park"]) expect(open([], id), id).toBe(false);
  });

  it("mỗi cảnh mở đúng khi làm xong việc liền trước, và chơi đủ thì mở hết", () => {
    expect(open(["met:owl"], "restaurant")).toBe(false);
    expect(open(["met:owl", "clue:letter", "clue:pen"], "restaurant")).toBe(true);
    const all = [...new Set(story.objectives.flatMap((o) => [...(o.done?.all ?? [])]))];
    for (const id of ["room", "restaurant", "market", "station", "hospital", "park"]) expect(open(all, id), id).toBe(true);
  });
});

describe("vụ án chiếc chìa khóa vàng", () => {
  const story = CASES["golden-key"];
  const open = (flags: string[], scene: string) => sceneUnlocked(story.objectives, story.startScene, flags, scene);

  it("là mức Vừa, có 4 nghi phạm và chỉ mở cảnh theo thứ tự", () => {
    expect(story.difficulty).toBe("medium");
    expect(story.suspects).toHaveLength(4);
    expect(open([], "hotel")).toBe(true);
    for (const id of ["clothing-store", "school", "station", "airport", "park"]) expect(open([], id), id).toBe(false);
    expect(open(["clue:guest_book", "clue:umbrella"], "clothing-store")).toBe(true);
  });

  it("Ông Rùa chỉ kể khi đã có manh mối chiếc ô (câu hỏi bị khóa)", () => {
    const ask = story.scenes.park.dialogues.t_ask;
    const visible = (flags: string[]) => (ask.choices ?? []).filter((c) => holds(c.when, flags)).map((c) => c.next);
    expect(visible([])).not.toContain("t_ans");
    expect(visible(["clue:umbrella"])).toContain("t_ans");
  });

  it("buộc tội Chó (mồi nhử) dù có nhiều bằng chứng vẫn sai; chỉ cần 4/6 manh mối then chốt với Cô Chim", () => {
    expect(judge(story, "dog", story.solution.keyClues).type).toBe("wrong_suspect");
    expect(judge(story, "bird", story.solution.keyClues.slice(0, 3)).type).toBe("weak_evidence");
    expect(judge(story, "bird", story.solution.keyClues.slice(0, 4)).type).toBe("solved");
  });
});

describe("vụ án chiếc bánh kem bị đánh tráo", () => {
  const story = CASES["swapped-cake"];

  it("là mức Khó, 5 nghi phạm; thủ phạm là Thỏ và Mèo/Cáo/Cô Chim/Rùa đều bị loại bằng buộc tội sai", () => {
    expect(story.difficulty).toBe("hard");
    expect(story.suspects).toHaveLength(5);
    for (const s of story.suspects.filter((x) => x.id !== "rabbit")) expect(judge(story, s.id, story.solution.keyClues).type, s.id).toBe("wrong_suspect");
    expect(judge(story, "rabbit", story.solution.keyClues.slice(0, 3)).type).toBe("weak_evidence");
  });

  it("chỉ hỏi lại được Thỏ khi có cả bảng cửa sổ vé và sổ phẫu thuật; Ông Rùa chỉ kể về người chạy khi biết người mua muối", () => {
    const entries = story.scenes.station.sceneNpcEntries!;
    expect(pickEntry(entries, ["met:rabbit", "clue:ticket_closed"])).not.toBe("rabbit_conf");
    expect(pickEntry(entries, ["met:rabbit", "clue:ticket_closed", "clue:sign_sheet"])).toBe("rabbit_conf");
    expect(pickEntry(entries, ["met:rabbit", "clue:ticket_closed", "clue:sign_sheet", "confronted:rabbit"])).not.toBe("rabbit_conf");
    const park = story.scenes.park.sceneNpcEntries!;
    expect(pickEntry(park, ["met:turtle"])).toBe("t_after");
    expect(pickEntry(park, ["met:turtle", "clue:salt_buyer"])).toBe("t2_hi");
    expect(pickEntry(park, ["met:turtle", "clue:salt_buyer", "saw:turtle"])).toBe("t_after");
  });
});

describe("lối đi trong vụ án theo thứ tự điều tra", () => {
  it("mỗi cảnh (trừ đầu/cuối) có lối về cảnh trước và sang cảnh sau khi cả hai đã mở; cảnh chưa mở không có biển", () => {
    for (const story of Object.values(CASES)) {
      const route = storyRoute(story.objectives, story.startScene);
      expect(new Set(route).size, story.id).toBe(route.length);
      for (const id of Object.keys(story.scenes)) expect(route, `${story.id}: ${id}`).toContain(id);
      const title = (id: string) => id;
      const mid = route[1];
      expect(storyExits(route, mid, title, () => true).map((e) => e.to)).toEqual([route[0], route[2]]);
      // Cảnh kế tiếp chưa mở vẫn có biển nhưng khóa; về cảnh trước thì không còn biển.
      expect(storyExits(route, mid, title, () => false).map((e) => [e.to, e.locked])).toEqual([[route[2], true]]);
      expect(storyExits(route, route[0], title, () => true).map((e) => e.to)).toEqual([route[1]]);
    }
  });
});

describe("vụ án bức tranh Mùa Xuân", () => {
  const story = CASES["spring-painting"];

  it("là mức Khó; chỉ Mèo là thủ phạm; hỏi lại Thỏ cần cả sổ bếp lẫn bảng cửa sổ; Chó chỉ kể sau khi Thỏ bị vạch trần", () => {
    expect(story.difficulty).toBe("hard");
    for (const s of story.suspects.filter((x) => x.id !== "cat")) expect(judge(story, s.id, story.solution.keyClues).type, s.id).toBe("wrong_suspect");
    expect(judge(story, "cat", story.solution.keyClues.slice(0, 3)).type).toBe("weak_evidence");
    const st = story.scenes.station.sceneNpcEntries!;
    expect(pickEntry(st, ["met:rabbit", "clue:window_closed"])).not.toBe("rabbit_conf");
    expect(pickEntry(st, ["met:rabbit", "clue:window_closed", "clue:kitchen_log"])).toBe("rabbit_conf");
    const sd = story.scenes.stadium.sceneNpcEntries!;
    expect(pickEntry(sd, ["met:dog"])).toBe("dog_after");
    expect(pickEntry(sd, ["met:dog", "clue:rabbit_slip"])).toBe("dog2_hi");
    expect(pickEntry(sd, ["met:dog", "clue:rabbit_slip", "saw:dog"])).toBe("dog_after");
  });
});

describe("vụ án chiếc ví bị mất", () => {
  const story = CASES["lost-wallet"];
  it("là mức Vừa; chỉ Chó là thủ phạm; ghi chú người mua vé chỉ hiện khi đã có cuống vé; Chó chỉ đổi lời khi có sổ ký tên và ghi chú người mua vé", () => {
    expect(story.difficulty).toBe("medium");
    for (const s of story.suspects.filter((x) => x.id !== "dog")) expect(judge(story, s.id, story.solution.keyClues).type, s.id).toBe("wrong_suspect");
    const note = story.scenes.cinema.spots!.find((s) => s.id === "buyer_note")!;
    expect(holds(note.when, ["met:rabbit"])).toBe(false);
    expect(holds(note.when, ["met:rabbit", "clue:stub"])).toBe(true);
    const e = story.scenes.gym.sceneNpcEntries!;
    expect(pickEntry(e, ["met:dog", "clue:gym_signout"])).not.toBe("dog_conf");
    expect(pickEntry(e, ["met:dog", "clue:gym_signout", "clue:buyer_note"])).toBe("dog_conf");
  });
});

describe("vụ án chiếc cúp biến mất", () => {
  const story = CASES["trophy-loan"];
  it("là mức Khó, 5 nghi phạm gồm cả người báo án; người báo án (Chó) là người nói sai; câu hỏi của Cáo chỉ mở khi đã thấy lớp bụi; hỏi lại Chó cần đủ ba thứ", () => {
    expect(story.difficulty).toBe("hard");
    expect(story.suspects).toHaveLength(5);
    expect(story.solution.suspectId).toBe("dog");
    for (const s of story.suspects.filter((x) => x.id !== "dog")) expect(judge(story, s.id, story.solution.keyClues).type, s.id).toBe("wrong_suspect");
    const fox = story.scenes.bank.sceneNpcEntries!;
    expect(pickEntry(fox, ["met:fox"])).toBe("fox_after");
    expect(pickEntry(fox, ["met:fox", "clue:dust_shelf"])).toBe("fox2_hi");
    const gym = story.scenes.gym.sceneNpcEntries!;
    expect(pickEntry(gym, ["met:dog", "clue:loan_form", "clue:dust_shelf"])).toBe("g_wait");
    expect(pickEntry(gym, ["met:dog", "clue:loan_form", "clue:dust_shelf", "clue:witness_fox"])).toBe("g_conf");
  });
});

describe("vụ án bưu kiện biến mất (hộp đỏ)", () => {
  const story = CASES["lost-parcel"];
  it("là mức Khó; Mèo nói dối nhưng vẫn là người bị buộc tội sai; chỉ Heo là thủ phạm; Heo chỉ đổi lời khi đã có đủ chứng cứ ngoại phạm của Cáo và Rùa", () => {
    expect(story.difficulty).toBe("hard");
    expect(story.suspects).toHaveLength(4);
    for (const s of story.suspects.filter((x) => x.id !== "pig")) expect(judge(story, s.id, story.solution.keyClues).type, s.id).toBe("wrong_suspect");
    expect(judge(story, "pig", story.solution.keyClues.slice(0, 3)).type).toBe("weak_evidence");
    const e = story.scenes.phoneshop.sceneNpcEntries!;
    const base = ["met:pig", "clue:closing_sign", "clue:thief_note", "clue:rabbit_list", "clue:pharmacy_receipt"];
    expect(pickEntry(e, base)).not.toBe("pig_conf");
    expect(pickEntry(e, [...base, "clue:kitchen_log"])).toBe("pig_conf");
  });
});

describe("vụ án hộp dụng cụ biến mất (tính giờ)", () => {
  const story = CASES["lost-toolbox"];
  it("là mức Khó; thủ phạm Thỏ; hỏi lại Thỏ cần đủ mốc giờ của cả ba người còn lại", () => {
    expect(story.difficulty).toBe("hard");
    for (const s of story.suspects.filter((x) => x.id !== "rabbit")) expect(judge(story, s.id, story.solution.keyClues).type, s.id).toBe("wrong_suspect");
    const e = story.scenes.bubbletea.sceneNpcEntries!;
    const all = ["met:rabbit", "clue:tea_tickets", "clue:last_seen", "clue:route_map", "clue:flower_orders", "clue:zoo_log", "clue:hotpot_log"];
    expect(pickEntry(e, all.filter((f) => f !== "clue:hotpot_log"))).not.toBe("rabbit_conf");
    expect(pickEntry(e, all)).toBe("rabbit_conf");
  });
});

describe("vụ án chiếc bút máy (bị đổ oan)", () => {
  const story = CASES["fountain-pen"];
  it("là mức Vừa; thủ phạm là Chó chứ không phải Vịt; Chó chỉ đổi lời khi đã so cát trắng, cát biển và phiếu mượn sách", () => {
    expect(story.difficulty).toBe("medium");
    expect(story.solution.suspectId).toBe("dog");
    expect(judge(story, "duck", story.solution.keyClues).type).toBe("wrong_suspect");
    const e = story.scenes.office.sceneNpcEntries!;
    const all = ["met:dog", "clue:meeting_note", "clue:office_sand", "clue:pen_cap", "clue:beach_sand", "clue:library_card"];
    expect(pickEntry(e, all.filter((f) => f !== "clue:beach_sand"))).not.toBe("dog_conf");
    expect(pickEntry(e, all)).toBe("dog_conf");
  });
});

describe("vụ án mới: không có thủ phạm, đồng phạm, nối manh mối, đọc hiểu", () => {
  it("birthday-cake: đáp án là 'Không ai cả'; buộc tội Chó là sai; Chó chỉ đổi lời khi có sổ đơn của tiệm bánh", () => {
    const story = CASES["birthday-cake"];
    expect(story.solution.suspectId).toBe("nobody");
    expect(story.suspects.find((s) => s.id === "nobody")?.virtual).toBe(true);
    expect(judge(story, "nobody", story.solution.keyClues).type).toBe("solved");
    expect(judge(story, "dog", story.solution.keyClues).type).toBe("wrong_suspect");
    const dog = story.scenes.gym.dialogues.dog_conf;
    const visible = (flags: string[]) => (dog.choices ?? []).filter((c) => holds(c.when, flags)).filter((c) => c.check === "right");
    expect(visible(["clue:class_roster"])).toHaveLength(0);
    expect(visible(["clue:order_book"])).toHaveLength(1);
  });

  it("jade-vase: phải chọn đủ cả hai người (thừa hoặc thiếu đều sai)", () => {
    const story = CASES["jade-vase"];
    const keys = story.solution.keyClues;
    expect(judge(story, ["rabbit", "duck"], keys).type).toBe("solved");
    expect(judge(story, ["duck", "rabbit"], keys).type).toBe("solved");
    expect(judge(story, "rabbit", keys).type).toBe("wrong_suspect");
    expect(judge(story, ["rabbit", "duck", "fox"], keys).type).toBe("wrong_suspect");
    expect(judge(story, ["rabbit", "fox"], keys).type).toBe("wrong_suspect");
  });

  it("nối manh mối: cặp đúng ra suy luận (không phụ thuộc thứ tự), cặp sai hoặc chưa tìm thì không", () => {
    const story = CASES["note-directions"];
    const have = emptyStory();
    expect(linkClues(story, have, "note_east", "home_cat").status).toBe("none");
    const p = applyEffects(have, [{ clue: "note_east" }, { clue: "home_cat" }]);
    const r = linkClues(story, p, "home_cat", "note_east");
    expect(r.status).toBe("linked");
    if (r.status === "linked") {
      expect(r.progress.clues).toContain("d_cat");
      expect(linkClues(story, r.progress, "note_east", "home_cat").status).toBe("known");
    }
    expect(linkClues(story, p, "note_east", "note_east").status).toBe("none");
  });

  it("vụ khó dùng tự do điều tra: mọi cảnh mở sẵn và không có mục tiêu dẫn từng bước", () => {
    for (const id of ["lost-toolbox", "lost-parcel", "fountain-pen", "birthday-cake", "jade-vase", "note-directions", "shopping-list"]) {
      const s = CASES[id];
      expect(s.freeRoam, id).toBe(true);
      expect(s.questions?.length, id).toBeGreaterThan(0);
    }
  });

  it("vụ đọc hiểu: manh mối chữ Hán không kèm bản dịch nội dung", () => {
    for (const id of ["note-directions", "shopping-list"]) {
      const hidden = CASES[id].clues.filter((c) => c.noTranslation);
      expect(hidden.length, id).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("mọi cảnh của mọi vụ án có thật trong danh sách cảnh (tránh 404)", () => {
  it.each(Object.values(CASES))("vụ án $id", (story) => {
    const ids = new Set([story.startScene, story.accuseScene, ...Object.keys(story.scenes), ...story.clues.map((c) => c.sceneId), ...story.suspects.map((s) => s.sceneId), ...story.objectives.flatMap((o) => (o.sceneId ? [o.sceneId] : []))]);
    for (const id of ids) expect(SCENES[id], `cảnh "${id}"`).toBeDefined();
  });
});
