import type { SceneDef } from "../explore-types";

/** Cửa hàng quần áo: quần áo, giày mũ trên bàn trưng bày, quầy thanh toán. Câu ví dụ tự viết, dùng được khi đi mua sắm. */
export const SHOP_SCENE: SceneDef = {
  id: "clothing-store",
  title: "Cửa hàng quần áo",
  subtitle: "Đi mua sắm, học tên quần áo, giày mũ rồi làm nhiệm vụ cho Chú Chó bán hàng.",
  theme: "shop",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Trường học", to: "school", x: 7, y: 58, w: 6 },
    { sprite: "exit", label: "Sang Khách sạn", to: "hotel", x: 92, y: 54, w: 6 },
  ],
  npc: {
    id: "dog", name: "Chú Chó", x: 88, y: 93, w: 11,
    greeting: "Chào mừng đến cửa hàng! Hãy đi xem hàng, lại gần món đồ rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "table", x: 22, y: 78, w: 26 },
    { sprite: "counter", x: 74, y: 66, w: 26 },
  ],
  objects: [
    { id: "clothes", term: "衣服", gloss: "quần áo", above: true, portable: true, example: { zh: "这件衣服很好看。", vi: "Chiếc áo này rất đẹp." }, x: 14, y: 62, w: 8, stand: { x: 14, y: 85 } },
    { id: "shoes", term: "鞋", gloss: "giày", above: true, portable: true, example: { zh: "我想买一双鞋。", vi: "Tôi muốn mua một đôi giày." }, x: 23, y: 62, w: 8, stand: { x: 23, y: 85 } },
    { id: "hat", term: "帽子", gloss: "cái mũ", above: true, portable: true, example: { zh: "这个帽子很可爱。", vi: "Cái mũ này rất dễ thương." }, x: 31, y: 62, w: 7, stand: { x: 31, y: 85 } },
    { id: "pants", term: "裤子", gloss: "quần", portable: true, example: { zh: "这条裤子太长了。", vi: "Chiếc quần này dài quá." }, x: 46, y: 88, w: 6 },
    { id: "skirt", term: "裙子", gloss: "váy", portable: true, example: { zh: "她喜欢红色的裙子。", vi: "Cô ấy thích chiếc váy màu đỏ." }, x: 56, y: 88, w: 7 },
    { id: "mirror", term: "镜子", gloss: "cái gương", example: { zh: "请照照镜子。", vi: "Mời soi gương." }, x: 60, y: 62, w: 6 },
    { id: "coin", term: "钱", gloss: "tiền", above: true, portable: true, example: { zh: "我带了很多钱。", vi: "Tôi mang theo nhiều tiền." }, x: 67, y: 50, w: 4, stand: { x: 67, y: 72 } },
    { id: "glasses", term: "眼镜", gloss: "kính", above: true, portable: true, example: { zh: "这副眼镜多少钱?", vi: "Chiếc kính này bao nhiêu tiền?" }, x: 74, y: 50, w: 6.5, stand: { x: 74, y: 72 } },
    { id: "bag", term: "包", gloss: "cái túi", above: true, portable: true, example: { zh: "这个包是新的。", vi: "Cái túi này mới." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 72 } },
    { id: "umbrella", term: "雨伞", gloss: "cái ô", portable: true, example: { zh: "我要买一把雨伞。", vi: "Tôi muốn mua một cái ô." }, x: 36, y: 94, w: 7 },
  ],
};
