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
  phrases: [
    { zh: "我要一个蛋糕。", vi: "Tôi muốn một cái bánh kem." },
    { zh: "这个面包是新鲜的吗?", vi: "Bánh mì này có tươi không?" },
    { zh: "可以加蜡烛吗?", vi: "Có thể thêm nến không?" },
    { zh: "生日快乐!", vi: "Chúc mừng sinh nhật!" },
  ],
  objects: [
    { id: "bread", term: "面包", gloss: "bánh mì", above: true, portable: true, example: { zh: "这个面包很香。", vi: "Ổ bánh mì này rất thơm." }, x: 24, y: 26.5, w: 7, stand: { x: 24, y: 42 } },
    { id: "cake", term: "蛋糕", gloss: "bánh kem", above: true, portable: true, example: { zh: "生日要吃蛋糕。", vi: "Sinh nhật phải ăn bánh kem." }, x: 32, y: 26.5, w: 8, stand: { x: 32, y: 42 } },
    { id: "coffee", term: "咖啡", gloss: "cà phê", above: true, portable: true, example: { zh: "我喝咖啡,不加糖。", vi: "Tôi uống cà phê không đường." }, x: 77, y: 50, w: 4, stand: { x: 77, y: 72 } },
    { id: "croissant", term: "牛角包", gloss: "bánh sừng bò", above: true, portable: true, example: { zh: "我要一个牛角包。", vi: "Tôi muốn một cái bánh sừng bò." }, x: 40, y: 26.5, w: 7, stand: { x: 40, y: 42 } },
    { id: "cookie", term: "饼干", gloss: "bánh quy", above: true, portable: true, example: { zh: "孩子喜欢吃饼干。", vi: "Trẻ con thích ăn bánh quy." }, x: 15, y: 64, w: 5, stand: { x: 15, y: 88 } },
    { id: "donut", term: "甜甜圈", gloss: "bánh donut", above: true, portable: true, example: { zh: "甜甜圈是粉红色的。", vi: "Bánh donut màu hồng." }, x: 22, y: 64, w: 5.5, stand: { x: 22, y: 88 } },
    { id: "oven", term: "烤箱", gloss: "lò nướng", example: { zh: "蛋糕在烤箱里。", vi: "Bánh kem ở trong lò nướng." }, x: 54, y: 92, w: 10 },
    { id: "apron", term: "围裙", gloss: "tạp dề", portable: true, example: { zh: "面包师穿着围裙。", vi: "Thợ làm bánh mặc tạp dề." }, x: 64, y: 94, w: 6 },
    { id: "candle", term: "蜡烛", gloss: "cây nến", above: true, portable: true, example: { zh: "请在蛋糕上插蜡烛。", vi: "Xin hãy cắm nến lên bánh." }, x: 29, y: 64, w: 2.5, stand: { x: 29, y: 88 } },
  ],
};
