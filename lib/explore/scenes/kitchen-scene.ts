import type { SceneDef } from "../explore-types";

/** Nhà bếp: tủ lạnh, nồi, quầy và bàn bếp đầy món ăn. Câu ví dụ tự viết, đơn giản, dùng được khi nấu ăn. */
export const KITCHEN_SCENE: SceneDef = {
  id: "kitchen",
  title: "Nhà bếp",
  subtitle: "Vào bếp, học tên đồ nấu ăn và món ăn rồi làm nhiệm vụ cho Bếp trưởng Gấu.",
  theme: "kitchen",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Tiệm bánh", to: "bakery", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Bảo tàng", to: "museum", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "chef", name: "Bếp trưởng Gấu", x: 88, y: 93, w: 10,
    greeting: "Chào mừng vào bếp! Hãy đi quanh, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 22, y: 62, w: 26 },
    { sprite: "table", x: 66, y: 80, w: 26 },
  ],
  objects: [
    { id: "fridge", term: "冰箱", gloss: "tủ lạnh", example: { zh: "牛奶在冰箱里。", vi: "Sữa ở trong tủ lạnh." }, x: 50, y: 44, w: 8 },
    { id: "rice", term: "米饭", gloss: "cơm", above: true, portable: true, example: { zh: "我想吃米饭。", vi: "Tôi muốn ăn cơm." }, x: 15, y: 46.5, w: 7, stand: { x: 15, y: 68 } },
    { id: "noodles", term: "面条", gloss: "mì sợi", above: true, portable: true, example: { zh: "他在煮面条。", vi: "Anh ấy đang nấu mì." }, x: 23, y: 46.5, w: 8, stand: { x: 23, y: 68 } },
    { id: "chopsticks", term: "筷子", gloss: "đũa", above: true, portable: true, example: { zh: "请拿一双筷子。", vi: "Xin lấy một đôi đũa." }, x: 30, y: 46.5, w: 6.5, stand: { x: 30, y: 68 } },
    { id: "soup", term: "汤", gloss: "canh, súp", above: true, portable: true, example: { zh: "汤很热,小心。", vi: "Canh rất nóng, cẩn thận." }, x: 58, y: 64, w: 6.5, stand: { x: 58, y: 88 } },
    { id: "fish", term: "鱼", gloss: "cá", above: true, portable: true, example: { zh: "今天做鱼。", vi: "Hôm nay nấu cá." }, x: 65, y: 64, w: 7.5, stand: { x: 65, y: 88 } },
    { id: "egg", term: "鸡蛋", gloss: "trứng gà", above: true, portable: true, example: { zh: "做蛋糕要用鸡蛋。", vi: "Làm bánh phải dùng trứng." }, x: 71, y: 64, w: 3.8, stand: { x: 71, y: 88 } },
    { id: "tea", term: "茶", gloss: "trà", above: true, portable: true, example: { zh: "饭后喝一杯茶。", vi: "Sau bữa ăn uống một tách trà." }, x: 77, y: 64, w: 6.5, stand: { x: 77, y: 88 } },
    { id: "pot", term: "锅", gloss: "cái nồi", example: { zh: "锅里有汤。", vi: "Trong nồi có canh." }, x: 36, y: 80, w: 10 },
    { id: "veg", term: "菜", gloss: "rau", portable: true, example: { zh: "这些菜都很新鲜。", vi: "Chỗ rau này đều rất tươi." }, x: 28, y: 92, w: 7 },
    { id: "milk", term: "牛奶", gloss: "sữa bò", portable: true, example: { zh: "牛奶要放冰箱。", vi: "Sữa phải để trong tủ lạnh." }, x: 44, y: 94, w: 4 },
    { id: "cup", term: "杯子", gloss: "cái cốc", portable: true, example: { zh: "杯子在桌子上。", vi: "Cốc ở trên bàn." }, x: 54, y: 94, w: 3.6 },
  ],
};
