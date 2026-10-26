import type { SceneDef } from "../explore-types";

/** Công viên giải trí: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const FUNFAIR_SCENE: SceneDef = {
  id: "funfair",
  title: "Công viên giải trí",
  subtitle: "Đi chơi công viên giải trí, học tên trò chơi và đồ ăn vặt rồi làm nhiệm vụ cho Chú Chó bán vé.",
  theme: "funfair",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Quán trà sữa", to: "bubbletea", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Nông trại", to: "farm", x: 92, y: 60, w: 6 }],
  npc: {
    id: "dog", name: "Chú Chó bán vé", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến công viên giải trí! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我想坐摩天轮。", vi: "Tôi muốn đi vòng quay." },
    { zh: "这个游戏怎么玩?", vi: "Trò này chơi thế nào?" },
    { zh: "我们去玩过山车吧!", vi: "Mình đi chơi tàu lượn đi!" },
    { zh: "晚上有烟花表演。", vi: "Buổi tối có biểu diễn pháo hoa." },
  ],
  objects: [
    { id: "balloon", term: "气球", gloss: "bóng bay", above: true, portable: true, example: { zh: "孩子们都喜欢气球。", vi: "Trẻ con đều thích bóng bay." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "cottoncandy", term: "棉花糖", gloss: "kẹo bông", above: true, portable: true, example: { zh: "棉花糖又甜又软。", vi: "Kẹo bông vừa ngọt vừa mềm." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "dart", term: "飞镖", gloss: "phi tiêu", above: true, portable: true, example: { zh: "他扔飞镖扔得很准。", vi: "Anh ấy ném phi tiêu rất chuẩn." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "prize", term: "奖品", gloss: "giải thưởng", above: true, portable: true, example: { zh: "赢了游戏就有奖品。", vi: "Thắng trò chơi thì có phần thưởng." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "firework", term: "烟花", gloss: "pháo hoa", above: true, portable: true, example: { zh: "晚上八点放烟花。", vi: "Tám giờ tối bắn pháo hoa." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "clown", term: "小丑", gloss: "chú hề", above: true, portable: true, example: { zh: "小丑给大家表演魔术。", vi: "Chú hề biểu diễn ảo thuật cho mọi người." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "tent", term: "帐篷", gloss: "cái lều", above: true, portable: true, example: { zh: "马戏团在大帐篷里表演。", vi: "Đoàn xiếc biểu diễn trong chiếc lều lớn." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "stall", term: "摊位", gloss: "gian hàng", above: true, portable: true, example: { zh: "那个摊位卖小玩具。", vi: "Gian hàng kia bán đồ chơi nhỏ." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "ferris", term: "摩天轮", gloss: "vòng quay khổng lồ", example: { zh: "坐摩天轮可以看到整个城市。", vi: "Ngồi vòng quay khổng lồ có thể thấy cả thành phố." }, x: 44, y: 80, w: 11 },
    { id: "carousel", term: "旋转木马", gloss: "đu quay ngựa", example: { zh: "小朋友喜欢旋转木马。", vi: "Các bé thích đu quay ngựa." }, x: 56, y: 94, w: 9 },
    { id: "rollercoaster", term: "过山车", gloss: "tàu lượn", example: { zh: "过山车跑得很快。", vi: "Tàu lượn chạy rất nhanh." }, x: 84, y: 76, w: 13 },
    { id: "bumpercar", term: "碰碰车", gloss: "xe điện đụng", example: { zh: "我们一起玩碰碰车吧。", vi: "Chúng ta cùng chơi xe điện đụng nhé." }, x: 30, y: 92, w: 8 },
  ],
};
