import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const bird = buildInterview({
  prefix: "bird", speaker: "bird",
  greeting: { zh: "你好!欢迎来农场。", vi: "Chào bạn! Chào mừng đến nông trại." },
  question: { zh: "昨天晚上七点半你在哪儿?", vi: "Bảy giờ rưỡi tối qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你昨天去游乐场了吗?", vi: "Hôm qua cô có đến công viên giải trí không?" }, reply: { zh: "没有,我昨天一直在农场。", vi: "Không, hôm qua tôi ở nông trại suốt." } },
    { ask: { zh: "农场离游乐场远吗?", vi: "Nông trại có xa công viên không?" }, reply: { zh: "有点远,走路要三十分钟。", vi: "Hơi xa, đi bộ mất ba mươi phút." } },
  ],
  answer: { zh: "昨天晚上七点半,我在农场喂鸡。", vi: "Bảy giờ rưỡi tối qua, tôi đang cho gà ăn ở nông trại." },
  check: { vi: "Cô Chim nói bảy giờ rưỡi tối qua cô làm gì?", right: { zh: "喂鸡", vi: "Cho gà ăn" }, wrong: [{ zh: "看表演", vi: "Xem biểu diễn" }, { zh: "洗衣服", vi: "Giặt đồ" }], rightAt: 0 },
  clue: "bird_alibi", metFlag: "met:bird",
  closing: { zh: "你可以看看农场里的东西。", vi: "Bạn có thể xem những thứ trong nông trại." },
  after: { zh: "我一直在农场。你还有事吗?", vi: "Tôi ở nông trại suốt. Bạn còn việc gì không?" },
});

/** Nông trại: Chim khai đang cho gà ăn, nhưng sổ cho gà cho thấy sau 7 giờ không ai cho ăn; hàng rào có lỗ đi tắt 10 phút tới sau công viên (đường lớn mất 30 phút), miệng lỗ có mảnh vàng của chiếc cúp. */
export const FARM_STORY: StorySceneDef = {
  sceneId: "farm",
  sceneNpcEntries: bird.entries,
  spots: [
    { id: "feed_log", clue: "feed_log", label: "Sổ cho gà ăn", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:bird"] }, stand: { x: 20, y: 92 } },
    { id: "fence_hole", clue: "fence_hole", label: "Cái lỗ trên hàng rào", sprite: "fence", x: 68, y: 92, w: 8, when: { all: ["met:bird", "clue:feed_log"] }, stand: { x: 68, y: 95 } },
    { id: "gold_flake", clue: "gold_flake", label: "Mảnh vàng ở miệng lỗ", sprite: "prize", x: 24, y: 80, w: 4, when: { all: ["clue:fence_hole"] }, stand: { x: 24, y: 90 } },
    { id: "farm_road", clue: "farm_road", label: "Biển chỉ đường", sprite: "note", x: 66, y: 80, w: 5, when: { all: ["met:bird"] }, stand: { x: 66, y: 90 } },
  ],
  dialogues: bird.nodes,
};
