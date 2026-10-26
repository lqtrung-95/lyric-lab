import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "欢迎!想买什么?", vi: "Chào mừng! Bạn muốn mua gì?" },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua ông ở đâu?" },
  chatter: [
    { ask: { zh: "你为什么这么紧张?", vi: "Sao ông căng thẳng thế?" }, reply: { zh: "没有!我没有紧张!", vi: "Không có! Tôi đâu có căng thẳng!" } },
    { ask: { zh: "这件衣服多少钱?", vi: "Cái áo này bao nhiêu tiền?" }, reply: { zh: "一百块。", vi: "Một trăm tệ." } },
  ],
  answer: { zh: "昨天晚上八点,我在店里卖东西。", vi: "Tối qua 8 giờ, tôi đang bán hàng ở cửa hàng." },
  check: { vi: "Chú Chó nói tối qua 8 giờ ông ở đâu?", right: { zh: "在店里", vi: "Ở cửa hàng" }, wrong: [{ zh: "在酒店", vi: "Ở khách sạn" }, { zh: "在学校", vi: "Ở trường" }], rightAt: 0 },
  clue: "dog_alibi", metFlag: "met:dog",
  closing: { zh: "我还有客人,你自己看看吧。", vi: "Tôi còn khách, bạn cứ tự xem nhé." },
  after: { zh: "你还想买什么?", vi: "Bạn còn muốn mua gì nữa?" },
});

/** Cửa hàng quần áo: Chó có hóa đơn xác nhận, giấu một món quà (mồi nhử), và ô bán ở đây không có chữ nên khác chiếc ô trong sảnh. */
export const CLOTHING_STORE_STORY: StorySceneDef = {
  sceneId: "clothing-store",
  sceneNpcEntries: dog.entries,
  spots: [
    { id: "receipt", clue: "dog_receipt", label: "Hóa đơn cửa hàng", sprite: "note", x: 86, y: 78, w: 4.5, when: { all: ["met:dog"] }, stand: { x: 86, y: 86 } },
    { id: "umbrella_stand", clue: "shop_umbrellas", label: "Ô bán trong cửa hàng", sprite: "umbrella", x: 54, y: 78, w: 6, when: { all: ["met:dog"] }, stand: { x: 54, y: 86 } },
    { id: "gift", clue: "dog_gift", label: "Hộp quà giấu sau quầy", sprite: "bag", x: 66, y: 92, w: 5, when: { all: ["met:dog"] }, stand: { x: 66, y: 95 } },
  ],
  dialogues: dog.nodes,
};
