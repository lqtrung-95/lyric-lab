import type { SceneDef } from "../explore-types";

/** Nhà ga: tàu đỗ sát tường, quầy bán vé và mấy món đồ của hành khách. Câu ví dụ tự viết, đơn giản. */
export const STATION_SCENE: SceneDef = {
  id: "station",
  title: "Nhà ga",
  subtitle: "Đi quanh nhà ga, học từ về tàu, vé và hành lý rồi làm nhiệm vụ cho Trưởng ga Thỏ.",
  theme: "station",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Chợ", to: "market", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Công viên", to: "park", x: 90, y: 60, w: 6 },
  ],
  npc: {
    id: "rabbit", name: "Trưởng ga Thỏ", x: 90, y: 93, w: 9,
    greeting: "Chào mừng đến nhà ga! Hãy đi quanh ga, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Đi quanh ga và ghé vài chỗ nhé!",
  },
  decor: [{ sprite: "counter", x: 24, y: 62, w: 26 }],
  phrases: [
    { zh: "我要买一张去北京的票。", vi: "Tôi muốn mua một vé đi Bắc Kinh." },
    { zh: "火车几点开?", vi: "Mấy giờ tàu chạy?" },
    { zh: "请问,站台在哪儿?", vi: "Xin hỏi, sân ga ở đâu?" },
    { zh: "这趟车到站了。", vi: "Chuyến tàu này đã đến ga." },
  ],
  objects: [
    { id: "train", wall: true, term: "火车", gloss: "tàu hỏa", example: { zh: "火车来了。", vi: "Tàu đến rồi." }, x: 68, y: 41, w: 26, stand: { x: 68, y: 52 } },
    { id: "ticket", term: "票", gloss: "vé", above: true, portable: true, example: { zh: "我买了两张票。", vi: "Tôi đã mua hai vé." }, x: 16, y: 46, w: 6.5, stand: { x: 16, y: 68 } },
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "墙上有一个钟。", vi: "Trên tường có một cái đồng hồ." }, x: 44, y: 24, w: 6 },
    { id: "map", wall: true, term: "地图", gloss: "bản đồ", example: { zh: "请看地图。", vi: "Xin hãy xem bản đồ." }, x: 88, y: 26, w: 8 },
    { id: "timetable", term: "时刻表", gloss: "bảng giờ tàu", above: true, portable: true, example: { zh: "请看时刻表。", vi: "Xin hãy xem bảng giờ tàu." }, x: 24, y: 46, w: 6, stand: { x: 24, y: 68 } },
    { id: "trolley", term: "行李车", gloss: "xe đẩy hành lý", example: { zh: "请用行李车。", vi: "Xin hãy dùng xe đẩy hành lý." }, x: 36, y: 86, w: 9 },
    { id: "signboard", term: "站牌", gloss: "biển tên ga", example: { zh: "站牌上写着北京站。", vi: "Trên biển ghi ga Bắc Kinh." }, x: 50, y: 92, w: 7 },
    { id: "lunchbox", term: "盒饭", gloss: "hộp cơm", above: true, portable: true, example: { zh: "火车上可以买盒饭。", vi: "Trên tàu có thể mua hộp cơm." }, x: 31, y: 46, w: 6, stand: { x: 31, y: 68 } },
    { id: "flag", term: "信号旗", gloss: "cờ hiệu", portable: true, example: { zh: "站务员举起信号旗。", vi: "Nhân viên ga giơ cờ hiệu lên." }, x: 64, y: 88, w: 4 },
    { id: "ticketwindow", term: "售票窗口", gloss: "quầy bán vé", example: { zh: "请到售票窗口买票。", vi: "Xin hãy ra quầy bán vé để mua vé." }, x: 22, y: 92, w: 9 },
    { id: "rails", wall: true, term: "铁轨", gloss: "đường ray", example: { zh: "火车在铁轨上跑。", vi: "Tàu chạy trên đường ray." }, x: 68, y: 50, w: 30 },
    { id: "ticketmachine", term: "自动售票机", gloss: "máy bán vé tự động", example: { zh: "可以用自动售票机买票。", vi: "Có thể mua vé ở máy bán vé tự động." }, x: 60, y: 74, w: 6.5 },
    { id: "turnstile", term: "检票口", gloss: "cổng soát vé", example: { zh: "请在检票口排队。", vi: "Xin xếp hàng ở cổng soát vé." }, x: 78, y: 76, w: 9 },
    { id: "waitingbench", term: "候车椅", gloss: "ghế chờ tàu", example: { zh: "我在候车椅上等车。", vi: "Tôi ngồi ghế chờ để đợi tàu." }, x: 40, y: 72, w: 14 },
  ],
};
