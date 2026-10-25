import type { SceneDef } from "../explore-types";

/** Chợ: ba sạp trái cây, rau, thịt cá và hai món để dưới đất. Câu ví dụ tự viết, đơn giản, dùng ngay khi đi chợ. */
export const MARKET_SCENE: SceneDef = {
  id: "cho",
  title: "Chợ",
  subtitle: "Đi quanh chợ, học tên trái cây, rau, thịt cá rồi làm nhiệm vụ cho Cô Mèo bán hàng.",
  theme: "market",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Quán ăn", to: "quan-an", x: 7, y: 58, w: 6 },
    { sprite: "exit", label: "Sang Nhà ga", to: "nha-ga", x: 90, y: 58, w: 6 },
  ],
  npc: {
    id: "cat", name: "Cô Mèo", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến chợ! Hãy đi quanh các sạp, lại gần món hàng rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Ghé thăm vài sạp hàng nhé!",
  },
  decor: [
    { sprite: "counter", x: 20, y: 72, w: 26 },
    { sprite: "counter", x: 52, y: 72, w: 26 },
    { sprite: "table", x: 80, y: 80, w: 26 },
  ],
  objects: [
    { id: "fruit", term: "水果", gloss: "trái cây", above: true, portable: true, example: { zh: "我想买水果。", vi: "Tôi muốn mua trái cây." }, x: 14, y: 56, w: 7.5, stand: { x: 14, y: 78 } },
    { id: "apple", term: "苹果", gloss: "quả táo", above: true, portable: true, example: { zh: "这个苹果很甜。", vi: "Quả táo này rất ngọt." }, x: 21, y: 56, w: 3.6, stand: { x: 21, y: 78 } },
    { id: "banana", term: "香蕉", gloss: "quả chuối", above: true, portable: true, example: { zh: "香蕉是黄色的。", vi: "Chuối có màu vàng." }, x: 27.5, y: 56, w: 6, stand: { x: 27.5, y: 78 } },
    { id: "watermelon", term: "西瓜", gloss: "dưa hấu", above: true, portable: true, example: { zh: "夏天我爱吃西瓜。", vi: "Mùa hè tôi thích ăn dưa hấu." }, x: 45, y: 56, w: 7, stand: { x: 45, y: 78 } },
    { id: "veg", term: "菜", gloss: "rau", above: true, portable: true, example: { zh: "今天我买了很多菜。", vi: "Hôm nay tôi mua rất nhiều rau." }, x: 52.5, y: 56, w: 7, stand: { x: 52.5, y: 78 } },
    { id: "egg", term: "鸡蛋", gloss: "trứng gà", above: true, portable: true, example: { zh: "请给我六个鸡蛋。", vi: "Cho tôi sáu quả trứng." }, x: 59.5, y: 56, w: 3.8, stand: { x: 59.5, y: 78 } },
    { id: "meat", term: "肉", gloss: "thịt", above: true, portable: true, example: { zh: "我不吃肉。", vi: "Tôi không ăn thịt." }, x: 74, y: 64, w: 6.5, stand: { x: 74, y: 87 } },
    { id: "fish", term: "鱼", gloss: "cá", above: true, portable: true, example: { zh: "这条鱼多少钱?", vi: "Con cá này bao nhiêu tiền?" }, x: 81, y: 64, w: 7.5, stand: { x: 81, y: 87 } },
    { id: "coin", term: "钱", gloss: "tiền", above: true, portable: true, example: { zh: "一共十块钱。", vi: "Tổng cộng mười tệ." }, x: 87.5, y: 64, w: 4, stand: { x: 87.5, y: 87 } },
    { id: "basket", term: "篮子", gloss: "cái giỏ", portable: true, example: { zh: "篮子里有水果。", vi: "Trong giỏ có trái cây." }, x: 38, y: 90, w: 7 },
    { id: "bag", term: "袋子", gloss: "cái túi", portable: true, example: { zh: "请给我一个袋子。", vi: "Cho tôi một cái túi." }, x: 66, y: 93, w: 5.5 },
  ],
};
