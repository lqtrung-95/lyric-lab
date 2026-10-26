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
  phrases: [
    { zh: "加油!", vi: "Cố lên!" },
    { zh: "我们赢了!", vi: "Chúng ta thắng rồi!" },
    { zh: "比赛几点开始?", vi: "Mấy giờ trận đấu bắt đầu?" },
    { zh: "请把球传给我。", vi: "Xin chuyền bóng cho tôi." },
  ],
  objects: [
    { id: "goal", term: "球门", gloss: "khung thành", example: { zh: "他把球踢进了球门。", vi: "Cậu ấy sút bóng vào khung thành." }, x: 30, y: 52, w: 24 },
    { id: "trophy", term: "奖杯", gloss: "cúp", portable: true, example: { zh: "我们得到了一个奖杯。", vi: "Chúng tôi giành được một chiếc cúp." }, x: 12, y: 70, w: 6 },
    { id: "ball", term: "球", gloss: "quả bóng", portable: true, example: { zh: "请把球传给我。", vi: "Xin chuyền bóng cho tôi." }, x: 46, y: 70, w: 4.5 },
    { id: "water", term: "水", gloss: "nước", portable: true, example: { zh: "运动后要喝水。", vi: "Tập xong phải uống nước." }, x: 40, y: 92, w: 2.6 },
    { id: "whistle", term: "哨子", gloss: "cái còi", portable: true, example: { zh: "裁判吹响了哨子。", vi: "Trọng tài thổi còi." }, x: 58, y: 86, w: 5 },
    { id: "racket", term: "球拍", gloss: "cây vợt", portable: true, example: { zh: "我的球拍很轻。", vi: "Cây vợt của tôi rất nhẹ." }, x: 68, y: 72, w: 4 },
    { id: "medal", term: "奖牌", gloss: "huy chương", portable: true, example: { zh: "他得了一块奖牌。", vi: "Anh ấy giành được một tấm huy chương." }, x: 76, y: 90, w: 4 },
    { id: "stopwatch", term: "秒表", gloss: "đồng hồ bấm giờ", portable: true, example: { zh: "教练用秒表计时。", vi: "Huấn luyện viên bấm giờ bằng đồng hồ." }, x: 90, y: 74, w: 4 },
    { id: "scoreboard", wall: true, term: "记分牌", gloss: "bảng tỉ số", example: { zh: "记分牌上是二比一。", vi: "Trên bảng tỉ số là hai một." }, x: 40, y: 24, w: 14 },
    { id: "jersey", term: "球衣", gloss: "áo thi đấu", portable: true, example: { zh: "他穿着红色的球衣。", vi: "Anh ấy mặc áo thi đấu màu đỏ." }, x: 22, y: 88, w: 9 },
    { id: "net", term: "球网", gloss: "lưới", example: { zh: "球进了球网。", vi: "Bóng vào lưới rồi." }, x: 64, y: 52, w: 16 },
    { id: "redcard", term: "红牌", gloss: "thẻ đỏ", portable: true, example: { zh: "裁判给了他一张红牌。", vi: "Trọng tài rút thẻ đỏ với anh ấy." }, x: 72, y: 92, w: 3.5 },
  ],
};
