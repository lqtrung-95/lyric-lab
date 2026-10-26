import type { SceneDef } from "../explore-types";

/** Tiệm bánh: kệ bánh, quầy tính tiền và bàn trưng bày. Câu ví dụ tự viết, đơn giản, dùng được khi mua bánh. */
export const BAKERY_SCENE: SceneDef = {
  id: "bakery",
  title: "Tiệm bánh",
  subtitle: "Ghé tiệm bánh thơm lừng, học tên bánh và đồ uống rồi làm nhiệm vụ cho Cô Mèo thợ bánh.",
  theme: "bakery",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Sân vận động", to: "stadium", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Nhà bếp", to: "kitchen", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "cat", name: "Cô Mèo thợ bánh", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến tiệm bánh! Hãy đi quanh, lại gần món bánh rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "shelf", x: 30, y: 33, w: 28 },
    { sprite: "table", x: 22, y: 80, w: 26 },
    { sprite: "counter", x: 70, y: 66, w: 26 },
  ],
  objects: [
    { id: "bread", term: "面包", gloss: "bánh mì", above: true, portable: true, example: { zh: "这个面包很香。", vi: "Ổ bánh mì này rất thơm." }, x: 24, y: 26.5, w: 7, stand: { x: 24, y: 42 } },
    { id: "cake", term: "蛋糕", gloss: "bánh kem", above: true, portable: true, example: { zh: "生日要吃蛋糕。", vi: "Sinh nhật phải ăn bánh kem." }, x: 32, y: 26.5, w: 8, stand: { x: 32, y: 42 } },
    { id: "milk", term: "牛奶", gloss: "sữa bò", above: true, portable: true, example: { zh: "我要一杯热牛奶。", vi: "Cho tôi một ly sữa nóng." }, x: 40, y: 26.5, w: 4, stand: { x: 40, y: 42 } },
    { id: "fruit", term: "水果", gloss: "trái cây", above: true, portable: true, example: { zh: "蛋糕上有水果。", vi: "Trên bánh có trái cây." }, x: 15, y: 64, w: 7.5, stand: { x: 15, y: 88 } },
    { id: "egg", term: "鸡蛋", gloss: "trứng gà", above: true, portable: true, example: { zh: "做蛋糕要两个鸡蛋。", vi: "Làm bánh cần hai quả trứng." }, x: 22, y: 64, w: 3.8, stand: { x: 22, y: 88 } },
    { id: "tea", term: "茶", gloss: "trà", above: true, portable: true, example: { zh: "蛋糕配茶很好吃。", vi: "Bánh ăn kèm trà rất ngon." }, x: 29, y: 64, w: 6.5, stand: { x: 29, y: 88 } },
    { id: "coin", term: "钱", gloss: "tiền", above: true, portable: true, example: { zh: "一共三十块钱。", vi: "Tổng cộng ba mươi tệ." }, x: 63, y: 50, w: 4, stand: { x: 63, y: 72 } },
    { id: "menu", term: "菜单", gloss: "thực đơn", above: true, portable: true, example: { zh: "请看菜单。", vi: "Xin hãy xem thực đơn." }, x: 70, y: 50, w: 5.5, stand: { x: 70, y: 72 } },
    { id: "coffee", term: "咖啡", gloss: "cà phê", above: true, portable: true, example: { zh: "我喝咖啡,不加糖。", vi: "Tôi uống cà phê không đường." }, x: 77, y: 50, w: 4, stand: { x: 77, y: 72 } },
    { id: "cup", term: "杯子", gloss: "cái cốc", portable: true, example: { zh: "这个杯子很可爱。", vi: "Cái cốc này rất dễ thương." }, x: 44, y: 90, w: 3.6 },
    { id: "basket", term: "篮子", gloss: "cái giỏ", portable: true, example: { zh: "篮子里有面包。", vi: "Trong giỏ có bánh mì." }, x: 54, y: 92, w: 7 },
    { id: "bag", term: "袋子", gloss: "cái túi", portable: true, example: { zh: "请给我一个袋子。", vi: "Cho tôi một cái túi." }, x: 64, y: 94, w: 5.5 },
  ],
};
