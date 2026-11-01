import { describe, expect, it } from "vitest";
import { EMOJI_ICON_KEYS, hasEmojiIcon } from "./emoji-icon";

describe("EmojiIcon", () => {
  it("nhận ra emoji có hình (bỏ dấu chọn kiểu hiển thị)", () => {
    expect(hasEmojiIcon("❤️")).toBe(true);
    expect(hasEmojiIcon("🔥")).toBe(true);
    expect(hasEmojiIcon("🍜")).toBe(true);
    expect(hasEmojiIcon("🦄")).toBe(false);
  });
  it("khóa không chứa dấu chọn kiểu hiển thị và không trùng", () => {
    const keys = EMOJI_ICON_KEYS();
    for (const k of keys) expect(k.includes("️")).toBe(false);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

import { PET_TONE_INFO } from "@/lib/roleplay/pet-tone";
import { SCENARIOS } from "@/lib/roleplay/scenarios";
import { DIALOGUE_TOPICS } from "@/lib/dialogues/dialogue-types";
import { JOURNEYS } from "@/lib/explore/journeys";
import { STAMP_MEDALS } from "@/lib/explore/passport";
import { POWER_ICON } from "@/components/games/squadron-scene";
import { VISIT_GIFTS } from "@/lib/pet/pet-visit";
import { SPECS as BURSTS } from "@/lib/pet/pet-burst";
import { READINGS } from "@/lib/readings/reading-catalog";

describe("emoji trong dữ liệu đều có hình vẽ", () => {
  const all: [string, string][] = [
    ...Object.values(PET_TONE_INFO).map((t) => ["pet-tone", t.emoji] as [string, string]),
    ...SCENARIOS.map((s) => ["scenario " + s.id, s.emoji] as [string, string]),
    ...DIALOGUE_TOPICS.map((t) => ["dialogue " + t.id, t.emoji] as [string, string]),
    ...JOURNEYS.map((j) => ["journey " + j.id, j.emoji] as [string, string]),
    ...Object.values(STAMP_MEDALS).filter(Boolean).map((m) => ["medal", m] as [string, string]),
    ...Object.values(POWER_ICON).map((p) => ["power", p.icon] as [string, string]),
    ...VISIT_GIFTS.map((g) => ["gift", g] as [string, string]),
    ...Object.values(BURSTS).flatMap((b) => b.glyphs.map((g: string) => ["burst", g] as [string, string])),
    ...READINGS.map((r) => ["reading " + r.id, r.emoji] as [string, string]),
  ];
  it("không có emoji nào rơi về chữ", () => {
    for (const [where, e] of all) expect(hasEmojiIcon(e), `${where}: ${e}`).toBe(true);
  });
});
