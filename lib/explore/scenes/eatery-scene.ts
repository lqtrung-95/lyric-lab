import type { SceneDef } from "../explore-types";

/**
 * Cảnh thứ hai: quán ăn Trung Hoa. 14 từ đồ ăn thức uống, phần lớn HSK 1–2, đặt trên kệ, hai bàn và quầy. Câu ví dụ tự viết, đơn giản, dùng ngay được.
 * Đồ đặt trên đồ khác (`above`) có điểm đứng `stand` ngay trước bàn/quầy/kệ.
 */
export const EATERY_SCENE: SceneDef = {
  id: "quan-an",
  title: "Quán ăn",
  subtitle: "Đi quanh quán ăn Trung Hoa, học tên đồ ăn thức uống rồi làm nhiệm vụ cho Bếp trưởng Gấu.",
  theme: "eatery",
  start: { x: 50, y: 94 },
  exits: [
    { sprite: "exitLeft", label: "Về Phòng của bạn", to: "phong", x: 11, y: 56, w: 6 },
    { sprite: "exit", label: "Sang Chợ", to: "cho", x: 90, y: 56, w: 6 },
  ],
  npc: {
    id: "chef", name: "Bếp trưởng Gấu", x: 90, y: 92, w: 10,
    greeting: "Chào mừng đến quán của mình! Hãy đi quanh quán, lại gần đồ ăn thức uống rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Ghé thăm vài món trên bàn và trên quầy nhé!",
  },
  decor: [
    { sprite: "shelf", x: 50, y: 33, w: 30 },
    { sprite: "table", x: 22, y: 76, w: 26 },
    { sprite: "table", x: 52, y: 86, w: 30 },
    { sprite: "counter", x: 84, y: 60, w: 26 },
  ],
  objects: [
    { id: "milk", term: "牛奶", gloss: "sữa bò", above: true, portable: true, example: { zh: "孩子喝牛奶。", vi: "Em bé uống sữa." }, x: 42, y: 26.5, w: 4, stand: { x: 42, y: 42 } },
    { id: "bread", term: "面包", gloss: "bánh mì", above: true, portable: true, example: { zh: "这个面包很好吃。", vi: "Ổ bánh mì này rất ngon." }, x: 50, y: 26.5, w: 7, stand: { x: 50, y: 42 } },
    { id: "fruit", term: "水果", gloss: "trái cây", above: true, portable: true, example: { zh: "多吃水果对身体好。", vi: "Ăn nhiều trái cây tốt cho sức khỏe." }, x: 59, y: 26.5, w: 7.5, stand: { x: 59, y: 42 } },
    { id: "noodles", term: "面条", gloss: "mì sợi", above: true, portable: true, example: { zh: "他爱吃面条。", vi: "Anh ấy thích ăn mì." }, x: 16, y: 59.5, w: 8, stand: { x: 16, y: 82 } },
    { id: "rice", term: "米饭", gloss: "cơm", above: true, portable: true, example: { zh: "我想吃米饭。", vi: "Tôi muốn ăn cơm." }, x: 23.5, y: 59.5, w: 7, stand: { x: 23.5, y: 82 } },
    { id: "chopsticks", term: "筷子", gloss: "đũa", above: true, portable: true, example: { zh: "请给我一双筷子。", vi: "Cho tôi một đôi đũa." }, x: 30, y: 59.5, w: 6.5, stand: { x: 30, y: 82 } },
    { id: "fish", term: "鱼", gloss: "cá", above: true, portable: true, example: { zh: "这条鱼很大。", vi: "Con cá này rất to." }, x: 42.5, y: 70, w: 7.5, stand: { x: 42.5, y: 92 } },
    { id: "tea", term: "茶", gloss: "trà", above: true, portable: true, example: { zh: "我喜欢喝茶。", vi: "Tôi thích uống trà." }, x: 50, y: 70, w: 6.5, stand: { x: 50, y: 92 } },
    { id: "coffee", term: "咖啡", gloss: "cà phê", above: true, portable: true, example: { zh: "请给我一杯咖啡。", vi: "Cho tôi một ly cà phê." }, x: 56.5, y: 70, w: 5, stand: { x: 56.5, y: 92 } },
    { id: "soup", term: "汤", gloss: "canh, súp", above: true, portable: true, example: { zh: "今天的汤很热。", vi: "Món canh hôm nay rất nóng." }, x: 62, y: 70, w: 6.5, stand: { x: 62, y: 92 } },
    { id: "veg", term: "菜", gloss: "món ăn, rau", above: true, portable: true, example: { zh: "这个菜很好吃。", vi: "Món này rất ngon." }, x: 67.5, y: 70, w: 7, stand: { x: 67.5, y: 92 } },
    { id: "coin", term: "钱", gloss: "tiền", above: true, portable: true, example: { zh: "这个多少钱?", vi: "Cái này bao nhiêu tiền?" }, x: 77, y: 44.5, w: 4, stand: { x: 77, y: 66 } },
    { id: "menu", term: "菜单", gloss: "thực đơn", above: true, portable: true, example: { zh: "请给我菜单。", vi: "Cho tôi xem thực đơn." }, x: 84, y: 44.5, w: 5.5, stand: { x: 84, y: 66 } },
    { id: "egg", term: "鸡蛋", gloss: "trứng gà", above: true, portable: true, example: { zh: "我早上吃一个鸡蛋。", vi: "Buổi sáng tôi ăn một quả trứng." }, x: 91, y: 44.5, w: 3.8, stand: { x: 91, y: 66 } },
  ],
};
