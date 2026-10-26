import type { SceneDef } from "../explore-types";

/** Quán trà sữa: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const BUBBLETEA_SCENE: SceneDef = {
  id: "bubbletea",
  title: "Quán trà sữa",
  subtitle: "Ghé quán trà sữa, học tên nguyên liệu và đồ uống rồi làm nhiệm vụ cho Bé Thỏ pha chế.",
  theme: "bubbletea",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Tiệm sửa xe", to: "garage", x: 7, y: 60, w: 6 }],
  npc: {
    id: "rabbit", name: "Bé Thỏ pha chế", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến quán trà sữa! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我要一杯奶茶。", vi: "Tôi muốn một ly trà sữa." },
    { zh: "少糖,少冰。", vi: "Ít đường, ít đá." },
    { zh: "可以加珍珠吗?", vi: "Có thể thêm trân châu không?" },
    { zh: "请帮我打包。", vi: "Xin đóng gói giúp tôi." },
  ],
  objects: [
    { id: "pearls", term: "珍珠", gloss: "trân châu", above: true, portable: true, example: { zh: "奶茶里有很多珍珠。", vi: "Trong trà sữa có rất nhiều trân châu." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "straw", term: "吸管", gloss: "ống hút", above: true, portable: true, example: { zh: "请给我一根吸管。", vi: "Cho tôi một cái ống hút." }, x: 28, y: 48, w: 3.5, stand: { x: 28, y: 70 } },
    { id: "sugar", term: "糖", gloss: "đường", above: true, portable: true, example: { zh: "我喝茶不放糖。", vi: "Tôi uống trà không bỏ đường." }, x: 35, y: 48, w: 4.5, stand: { x: 35, y: 70 } },
    { id: "icecubes", term: "冰块", gloss: "đá viên", above: true, portable: true, example: { zh: "夏天要加冰块。", vi: "Mùa hè phải thêm đá viên." }, x: 41, y: 48, w: 5.5, stand: { x: 41, y: 70 } },
    { id: "lemon", term: "柠檬", gloss: "quả chanh", above: true, portable: true, example: { zh: "柠檬茶有一点酸。", vi: "Trà chanh hơi chua một chút." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "mango", term: "芒果", gloss: "xoài", above: true, portable: true, example: { zh: "我最喜欢芒果味的。", vi: "Tôi thích nhất vị xoài." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "strawberry", term: "草莓", gloss: "dâu tây", above: true, portable: true, example: { zh: "草莓奶茶是粉红色的。", vi: "Trà sữa dâu tây có màu hồng." }, x: 74, y: 50, w: 4.5, stand: { x: 74, y: 74 } },
    { id: "shaker", term: "摇杯", gloss: "bình lắc", above: true, portable: true, example: { zh: "老板用摇杯摇一摇。", vi: "Chủ quán lắc bằng bình lắc." }, x: 81, y: 50, w: 3.5, stand: { x: 81, y: 74 } },
    { id: "milktea", term: "奶茶", gloss: "trà sữa", portable: true, example: { zh: "天气热的时候喝奶茶。", vi: "Trời nóng thì uống trà sữa." }, x: 44, y: 80, w: 4.5 },
    { id: "bobacup", term: "杯子", gloss: "cái ly", portable: true, example: { zh: "杯子里有半杯水。", vi: "Trong ly có nửa ly nước." }, x: 56, y: 94, w: 5 },
    { id: "pricelist", term: "价目表", gloss: "bảng giá", portable: true, example: { zh: "价目表在墙上。", vi: "Bảng giá ở trên tường." }, x: 84, y: 76, w: 5 },
    { id: "takeaway", term: "打包袋", gloss: "túi mang đi", portable: true, example: { zh: "请把奶茶放进打包袋。", vi: "Xin cho trà sữa vào túi mang đi." }, x: 30, y: 92, w: 5 },
  ],
};
