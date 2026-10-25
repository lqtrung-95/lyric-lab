import { describe, expect, it } from "vitest";
import { commandMeaning, commandText } from "./quest-commands";
import { resolveTap, type TapInput } from "./quest-step";

const base: TapInput = { targetId: "cup", needsDelivery: false, tappedId: "cup", carrying: null, npcId: "owl" };

describe("resolveTap", () => {
  it("câu 'đi tới': chạm đúng vật là xong, chạm vật khác là sai, chạm NPC bỏ qua", () => {
    expect(resolveTap(base)).toEqual({ type: "correct" });
    expect(resolveTap({ ...base, tappedId: "book" })).toEqual({ type: "wrong" });
    expect(resolveTap({ ...base, tappedId: "owl" })).toEqual({ type: "ignore" });
  });

  it("câu 'mang đồ': nhặt đúng vật thì chưa xong, nhặt sai là sai", () => {
    expect(resolveTap({ ...base, needsDelivery: true })).toEqual({ type: "pickup", id: "cup" });
    expect(resolveTap({ ...base, needsDelivery: true, tappedId: "book" })).toEqual({ type: "wrong" });
  });

  it("đang cầm vật: giao cho NPC thì đúng, chạm thứ khác bỏ qua (kể cả vật khác hay chính vật đang cầm)", () => {
    const holding = { ...base, needsDelivery: true, carrying: "cup" };
    expect(resolveTap({ ...holding, tappedId: "owl" })).toEqual({ type: "correct" });
    expect(resolveTap({ ...holding, tappedId: "book" })).toEqual({ type: "ignore" });
    expect(resolveTap({ ...holding, tappedId: "cup" })).toEqual({ type: "ignore" });
  });
});

describe("quest-commands", () => {
  it("vật mang được: 'mang cho tôi'; không mang được: 'đi tới'", () => {
    expect(commandText("杯子", true)).toBe("请把杯子拿给我。");
    expect(commandText("门", false)).toBe("请走到门那里。");
    expect(commandMeaning("cái cốc", true)).toBe("Hãy mang cái cốc cho tôi.");
    expect(commandMeaning("cửa ra vào", false)).toBe("Hãy đi tới chỗ cửa ra vào.");
  });
});
