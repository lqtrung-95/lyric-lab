import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const owl = buildInterview({
  prefix: "owl", speaker: "owl",
  greeting: { zh: "你好!欢迎光临。", vi: "Chào bạn! Hoan nghênh quý khách." },
  question: { zh: "昨天晚上七点半你在哪儿?", vi: "Bảy giờ rưỡi tối qua ông ở đâu?" },
  chatter: [
    { ask: { zh: "架子上的金色奖杯是哪儿来的?", vi: "Chiếc cúp vàng trên kệ ở đâu ra vậy?" }, reply: { zh: "那是玩具奖杯,店里卖的,二十块一个。", vi: "Đó là cúp đồ chơi, trong tiệm có bán, hai mươi tệ một cái." } },
    { ask: { zh: "你昨天几点离开游乐场?", vi: "Hôm qua ông rời công viên lúc mấy giờ?" }, reply: { zh: "我不记得了,我走得很快。", vi: "Tôi không nhớ, tôi đi rất nhanh." } },
  ],
  answer: { zh: "昨天晚上七点半,我已经在去玩具店的路上了。", vi: "Bảy giờ rưỡi tối qua, tôi đã đang trên đường đến cửa hàng đồ chơi." },
  check: { vi: "Cụ Cú nói bảy giờ rưỡi tối qua ông đang làm gì?", right: { zh: "在路上", vi: "Đang trên đường" }, wrong: [{ zh: "在摩天轮上", vi: "Trên vòng quay" }, { zh: "在洗衣店", vi: "Ở tiệm giặt" }], rightAt: 0 },
  clue: "owl_alibi", metFlag: "met:owl",
  closing: { zh: "桌子上有一张单子,墙上有一块牌子,架子上也有东西。", vi: "Trên bàn có một tờ phiếu, trên tường có một tấm biển, trên kệ cũng có đồ." },
  after: { zh: "你看到什么了?还有事吗?", vi: "Bạn thấy gì rồi? Còn việc gì không?" },
});

/** Cửa hàng đồ chơi: Cú khai đã trên đường; hóa đơn 7 giờ 50 cộng quãng đường 25 phút cho thấy ông rời công viên trước 7 giờ 25 nên vô can. Cúp nhỏ trên kệ là đồ chơi bán sẵn (mồi nhử). */
export const TOYSHOP_STORY: StorySceneDef = {
  sceneId: "toyshop",
  sceneNpcEntries: owl.entries,
  spots: [
    { id: "toy_receipt", clue: "toy_receipt", label: "Hóa đơn trên bàn", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:owl"] }, stand: { x: 20, y: 92 } },
    { id: "road_toy", clue: "road_toy", label: "Biển chỉ đường", sprite: "note", x: 24, y: 80, w: 5, when: { all: ["met:owl"] }, stand: { x: 24, y: 90 } },
    { id: "toy_trophy", clue: "toy_trophy", label: "Chiếc cúp nhỏ trên kệ", sprite: "prize", x: 68, y: 92, w: 4, when: { all: ["met:owl"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: owl.nodes,
};
