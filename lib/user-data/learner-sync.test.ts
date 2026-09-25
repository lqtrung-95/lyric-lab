import { describe, expect, it } from "vitest";
import { initialLearnerState, type SavedItem } from "@/lib/user-state/learner-state";
import { cardRowFromSaved, diffLearnerState, isEmptyOps, opsFromState, savedFromRow, stateFromRemote } from "./learner-sync";

const item = (key: string, over: Partial<SavedItem> = {}): SavedItem => ({
  key, videoId: "e2eFixture1", type: "vocab", term: "城市", lineIndex: 2, start: 8, savedAt: 1_700_000_000_000,
  reading: "chéngshì", sinoViet: "thành thị", level: 2, meaning: "thành phố", ...over,
});

describe("diffLearnerState", () => {
  it("không đổi thì không có thao tác", () => {
    expect(isEmptyOps(diffLearnerState(initialLearnerState, initialLearnerState))).toBe(true);
  });

  it("nhận biết thêm/bỏ từ đã biết, lưu/bỏ lưu thẻ và đổi cấp", () => {
    const prev = { level: 3, known: ["vocab:a", "vocab:b"], saved: [item("vocab:x")] };
    const next = { level: 4, known: ["vocab:b", "vocab:c"], saved: [item("vocab:y")] };
    const ops = diffLearnerState(prev, next);
    expect(ops.level).toBe(4);
    expect(ops.knownAdd).toEqual(["vocab:c"]);
    expect(ops.knownRemove).toEqual(["vocab:a"]);
    expect(ops.cardsAdd.map((c) => c.key)).toEqual(["vocab:y"]);
    expect(ops.cardsRemove).toEqual(["vocab:x"]);
  });

  it("opsFromState đẩy toàn bộ trạng thái cũ lên", () => {
    const ops = opsFromState({ level: 5, known: ["vocab:a"], saved: [item("vocab:x")] });
    expect(ops.level).toBe(5);
    expect(ops.knownAdd).toEqual(["vocab:a"]);
    expect(ops.cardsAdd).toHaveLength(1);
  });
});

describe("card rows", () => {
  it("SavedItem → hàng thẻ → SavedItem giữ nguyên ảnh chụp", () => {
    const row = cardRowFromSaved(item("vocab:城市"))!;
    expect(row).toMatchObject({ item_key: "vocab:城市", meaning: "thành phố", han_viet: "thành thị", hsk_level: 2, video_id: "e2eFixture1" });
    const back = savedFromRow(row);
    expect(back).toMatchObject({ key: "vocab:城市", term: "城市", reading: "chéngshì", meaning: "thành phố", lineIndex: 2, savedAt: 1_700_000_000_000 });
  });

  it("thẻ cũ không có nghĩa thì không tạo hàng", () => {
    expect(cardRowFromSaved(item("vocab:x", { meaning: undefined }))).toBeNull();
  });

  it("stateFromRemote dùng cấp mặc định khi chưa có hồ sơ", () => {
    expect(stateFromRemote({ level: null, known: [], cards: [] }).level).toBe(3);
    expect(stateFromRemote({ level: 6, known: ["vocab:a"], cards: [] })).toMatchObject({ level: 6, known: ["vocab:a"] });
  });
});
