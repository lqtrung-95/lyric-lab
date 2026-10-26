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
  phrases: [
    { zh: "我来帮你切菜。", vi: "Để tôi giúp bạn thái rau." },
    { zh: "汤好了吗?", vi: "Canh xong chưa?" },
    { zh: "请把盐递给我。", vi: "Xin chuyển muối cho tôi." },
    { zh: "小心,锅很烫!", vi: "Cẩn thận, nồi rất nóng!" },
  ],
  objects: [
    { id: "fridge", term: "冰箱", gloss: "tủ lạnh", example: { zh: "牛奶在冰箱里。", vi: "Sữa ở trong tủ lạnh." }, x: 50, y: 44, w: 8 },
    { id: "pot", term: "锅", gloss: "cái nồi", example: { zh: "锅里有汤。", vi: "Trong nồi có canh." }, x: 36, y: 80, w: 10 },
    { id: "knife", term: "刀", gloss: "con dao", above: true, portable: true, example: { zh: "小心,刀很快。", vi: "Cẩn thận, dao rất sắc." }, x: 15, y: 46.5, w: 7, stand: { x: 15, y: 68 } },
    { id: "cuttingboard", term: "菜板", gloss: "cái thớt", above: true, portable: true, example: { zh: "菜在菜板上。", vi: "Rau ở trên thớt." }, x: 23, y: 46.5, w: 8, stand: { x: 23, y: 68 } },
    { id: "saltjar", term: "盐", gloss: "muối", above: true, portable: true, example: { zh: "请把盐递给我。", vi: "Xin chuyển muối cho tôi." }, x: 30, y: 46.5, w: 4, stand: { x: 30, y: 68 } },
    { id: "kettle", term: "水壶", gloss: "ấm đun nước", above: true, portable: true, example: { zh: "水壶里有热水。", vi: "Trong ấm có nước nóng." }, x: 58, y: 64, w: 6, stand: { x: 58, y: 88 } },
    { id: "ricecooker", term: "电饭锅", gloss: "nồi cơm điện", above: true, portable: true, example: { zh: "电饭锅里有米饭。", vi: "Trong nồi cơm điện có cơm." }, x: 65, y: 64, w: 7, stand: { x: 65, y: 88 } },
    { id: "stove", term: "炉子", gloss: "bếp", example: { zh: "汤在炉子上。", vi: "Canh đang ở trên bếp." }, x: 28, y: 92, w: 10 },
    { id: "sink", term: "水槽", gloss: "bồn rửa", example: { zh: "请把碗放进水槽。", vi: "Xin hãy để bát vào bồn rửa." }, x: 44, y: 94, w: 10 },
  ],
};
