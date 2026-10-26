import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const duck = buildInterview({
  prefix: "duck", speaker: "duck",
  greeting: { zh: "你好!你要洗衣服吗?", vi: "Chào bạn! Bạn muốn giặt đồ à?" },
  question: { zh: "昨天晚上七点半你在哪儿?", vi: "Bảy giờ rưỡi tối qua chú ở đâu?" },
  chatter: [
    { ask: { zh: "你每天几点关门?", vi: "Mỗi ngày chú đóng cửa lúc mấy giờ?" }, reply: { zh: "晚上九点。", vi: "Chín giờ tối." } },
    { ask: { zh: "你去过游乐场吗?", vi: "Chú đã từng đến công viên chưa?" }, reply: { zh: "去过,但是昨天没有去。", vi: "Có, nhưng hôm qua thì không đi." } },
  ],
  answer: { zh: "昨天晚上七点半,我在洗衣店工作。", vi: "Bảy giờ rưỡi tối qua, tôi đang làm việc ở tiệm giặt là." },
  check: { vi: "Chú Vịt nói bảy giờ rưỡi tối qua chú làm gì?", right: { zh: "在洗衣店工作", vi: "Làm việc ở tiệm giặt" }, wrong: [{ zh: "在帐篷里", vi: "Trong lều" }, { zh: "在摩天轮上", vi: "Trên vòng quay" }], rightAt: 0 },
  clue: "duck_alibi", metFlag: "met:duck",
  closing: { zh: "柜台上有一张单子,墙上有一块牌子。", vi: "Trên quầy có một tờ phiếu, trên tường có một tấm biển." },
  after: { zh: "你看到什么了?还有事吗?", vi: "Bạn thấy gì rồi? Còn việc gì không?" },
});

/** Tiệm giặt là: Vịt khai đang làm việc; phiếu nhận đồ lúc 7 giờ 35 cộng quãng đường 40 phút tới công viên chứng tỏ Vịt không thể có mặt ở công viên trong khoảng 7:30-7:50. */
export const LAUNDRY_STORY: StorySceneDef = {
  sceneId: "laundry",
  sceneNpcEntries: duck.entries,
  spots: [
    { id: "laundry_receipt", clue: "laundry_receipt", label: "Phiếu nhận đồ", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:duck"] }, stand: { x: 20, y: 92 } },
    { id: "road_laundry", clue: "road_laundry", label: "Biển chỉ đường", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:duck"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: duck.nodes,
};
