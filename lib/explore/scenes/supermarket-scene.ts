import type { SceneDef } from "../explore-types";

/** Siêu thị: kệ hàng sát tường, quầy thu ngân và xe đẩy. Câu ví dụ tự viết, đơn giản, dùng được khi đi mua sắm. */
export const SUPERMARKET_SCENE: SceneDef = {
  id: "supermarket",
  title: "Siêu thị",
  subtitle: "Đẩy xe đi mua sắm, học tên đồ ăn thức uống rồi làm nhiệm vụ cho Cô Heo thu ngân.",
  theme: "supermarket",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Thư viện", to: "library", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Bãi biển", to: "beach", x: 92, y: 52, w: 6 },
  ],
  npc: {
    id: "pig", name: "Cô Heo thu ngân", x: 88, y: 93, w: 8,
    greeting: "Chào mừng đến siêu thị! Hãy đi dọc các kệ, lại gần món hàng rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "shelf", x: 26, y: 33, w: 30 },
    { sprite: "shelf", x: 70, y: 33, w: 30 },
    { sprite: "counter", x: 78, y: 74, w: 26 },
  ],
  objects: [
    { id: "milk", term: "牛奶", gloss: "sữa bò", above: true, portable: true, example: { zh: "我每天喝一杯牛奶。", vi: "Mỗi ngày tôi uống một ly sữa." }, x: 18, y: 26.5, w: 4, stand: { x: 18, y: 42 } },
    { id: "bread", term: "面包", gloss: "bánh mì", above: true, portable: true, example: { zh: "这个面包是新的。", vi: "Ổ bánh mì này mới ra lò." }, x: 26, y: 26.5, w: 7, stand: { x: 26, y: 42 } },
    { id: "egg", term: "鸡蛋", gloss: "trứng gà", above: true, portable: true, example: { zh: "鸡蛋很便宜。", vi: "Trứng gà rất rẻ." }, x: 34, y: 26.5, w: 3.8, stand: { x: 34, y: 42 } },
    { id: "fruit", term: "水果", gloss: "trái cây", above: true, portable: true, example: { zh: "水果在那边。", vi: "Trái cây ở bên kia." }, x: 62, y: 26.5, w: 7.5, stand: { x: 62, y: 42 } },
    { id: "banana", term: "香蕉", gloss: "quả chuối", above: true, portable: true, example: { zh: "我想买香蕉。", vi: "Tôi muốn mua chuối." }, x: 71, y: 26.5, w: 6, stand: { x: 71, y: 42 } },
    { id: "veg", term: "菜", gloss: "rau", above: true, portable: true, example: { zh: "这个菜很新鲜。", vi: "Rau này rất tươi." }, x: 79, y: 26.5, w: 7, stand: { x: 79, y: 42 } },
    { id: "fish", term: "鱼", gloss: "cá", above: true, portable: true, example: { zh: "今天的鱼打折。", vi: "Cá hôm nay giảm giá." }, x: 14, y: 62, w: 7.5, stand: { x: 14, y: 70 } },
    { id: "meat", term: "肉", gloss: "thịt", above: true, portable: true, example: { zh: "这块肉多少钱?", vi: "Miếng thịt này bao nhiêu tiền?" }, x: 24, y: 62, w: 6.5, stand: { x: 24, y: 70 } },
    { id: "cart", term: "购物车", gloss: "xe đẩy mua hàng", example: { zh: "请推着购物车。", vi: "Xin hãy đẩy xe đẩy." }, x: 46, y: 80, w: 10 },
    { id: "basket", term: "篮子", gloss: "cái giỏ", portable: true, example: { zh: "篮子里有鸡蛋。", vi: "Trong giỏ có trứng." }, x: 36, y: 92, w: 7 },
    { id: "coin", term: "钱", gloss: "tiền", above: true, portable: true, example: { zh: "我付了二十块钱。", vi: "Tôi đã trả hai mươi tệ." }, x: 78, y: 58.5, w: 4, stand: { x: 78, y: 80 } },
    { id: "bag", term: "袋子", gloss: "cái túi", above: true, portable: true, example: { zh: "请给我一个袋子。", vi: "Cho tôi một cái túi." }, x: 86, y: 58.5, w: 5.5, stand: { x: 86, y: 80 } },
  ],
};
