import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要剪头发吗?", vi: "Chào bạn! Bạn muốn cắt tóc à?" },
  question: { zh: "昨天晚上七点你在哪儿?", vi: "Bảy giờ tối hôm qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "你家在哪儿?", vi: "Nhà cô ở đâu?" }, reply: { zh: "就在店后面。", vi: "Ngay phía sau tiệm." } },
    { ask: { zh: "你喜欢看什么电视?", vi: "Cô thích xem ti vi gì?" }, reply: { zh: "我喜欢看电影。", vi: "Tôi thích xem phim." } },
  ],
  answer: { zh: "昨天晚上七点,我在家看电视。", vi: "Bảy giờ tối hôm qua, tôi đang xem ti vi ở nhà." },
  check: { vi: "Cô Mèo nói bảy giờ tối hôm qua cô làm gì?", right: { zh: "看电视", vi: "Xem ti vi" }, wrong: [{ zh: "卖药", vi: "Bán thuốc" }, { zh: "吃火锅", vi: "Ăn lẩu" }], rightAt: 0 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "你可以问问我的邻居,他在那张纸上写了几句话。", vi: "Bạn có thể hỏi hàng xóm của tôi, anh ấy có viết vài dòng trên tờ giấy đó." },
  after: { zh: "纸在桌子上。你还有事吗?", vi: "Tờ giấy ở trên bàn. Bạn còn việc gì không?" },
});

/** Hiệu cắt tóc: Cô Mèo khai ở nhà xem ti vi (không ai ở cùng, nhìn đáng ngờ), nhưng hàng xóm xác nhận có tiếng ti vi trong nhà cô. */
export const SALON_STORY: StorySceneDef = {
  sceneId: "salon",
  sceneNpcEntries: cat.entries,
  spots: [{ id: "neighbor_note", clue: "neighbor_note", label: "Tờ giấy của hàng xóm", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:cat"] }, stand: { x: 20, y: 92 } }],
  dialogues: cat.nodes,
};
