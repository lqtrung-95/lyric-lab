import type { SceneDef } from "../explore-types";

/** Sân vận động: khung thành, cúp, bóng và đồ tập luyện. Câu ví dụ tự viết, đơn giản, dùng được khi chơi thể thao. */
export const STADIUM_SCENE: SceneDef = {
  id: "stadium",
  title: "Sân vận động",
  subtitle: "Ra sân tập, học từ về thể thao và đồ tập luyện rồi làm nhiệm vụ cho Chú Chó huấn luyện viên.",
  theme: "stadium",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Bãi biển", to: "beach", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Tiệm bánh", to: "bakery", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "dog", name: "Chú Chó huấn luyện viên", x: 88, y: 93, w: 11,
    greeting: "Chào mừng ra sân! Hãy chạy quanh, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Chạy thêm vài vòng nhé!",
  },
  objects: [
    { id: "sun", wall: true, term: "太阳", gloss: "mặt trời", example: { zh: "今天太阳很大。", vi: "Hôm nay nắng rất to." }, x: 84, y: 15, w: 7 },
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "比赛三点钟开始。", vi: "Trận đấu bắt đầu lúc ba giờ." }, x: 40, y: 24, w: 6 },
    { id: "bird", wall: true, term: "鸟", gloss: "con chim", example: { zh: "球场上飞过一只鸟。", vi: "Một con chim bay qua sân." }, x: 60, y: 22, w: 5 },
    { id: "goal", term: "球门", gloss: "khung thành", example: { zh: "他把球踢进了球门。", vi: "Cậu ấy sút bóng vào khung thành." }, x: 30, y: 52, w: 24 },
    { id: "trophy", term: "奖杯", gloss: "cúp", portable: true, example: { zh: "我们得到了一个奖杯。", vi: "Chúng tôi giành được một chiếc cúp." }, x: 12, y: 70, w: 6 },
    { id: "ball", term: "球", gloss: "quả bóng", portable: true, example: { zh: "请把球传给我。", vi: "Xin chuyền bóng cho tôi." }, x: 46, y: 70, w: 4.5 },
    { id: "hat", term: "帽子", gloss: "cái mũ", portable: true, example: { zh: "训练要戴帽子。", vi: "Tập luyện phải đội mũ." }, x: 68, y: 72, w: 7 },
    { id: "bicycle", term: "自行车", gloss: "xe đạp", example: { zh: "我骑自行车来球场。", vi: "Tôi đạp xe đến sân." }, x: 22, y: 88, w: 13 },
    { id: "shoes", term: "鞋", gloss: "giày", portable: true, example: { zh: "踢球要穿运动鞋。", vi: "Đá bóng phải đi giày thể thao." }, x: 58, y: 86, w: 7 },
    { id: "water", term: "水", gloss: "nước", portable: true, example: { zh: "运动后要喝水。", vi: "Tập xong phải uống nước." }, x: 40, y: 92, w: 2.6 },
    { id: "towel", term: "毛巾", gloss: "khăn", portable: true, example: { zh: "请给我一条毛巾。", vi: "Cho tôi một cái khăn." }, x: 76, y: 90, w: 6 },
    { id: "bag", term: "包", gloss: "cái túi", portable: true, example: { zh: "我的运动包很大。", vi: "Túi thể thao của tôi rất to." }, x: 90, y: 74, w: 5 },
  ],
};
