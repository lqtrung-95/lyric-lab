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
  objects: [
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "墙上有一个钟。", vi: "Trên tường có một cái đồng hồ." }, x: 44, y: 24, w: 6 },
    { id: "map", wall: true, term: "地图", gloss: "bản đồ", example: { zh: "请看地图。", vi: "Xin hãy xem bản đồ." }, x: 88, y: 26, w: 8 },
    { id: "train", wall: true, term: "火车", gloss: "tàu hỏa", example: { zh: "火车来了。", vi: "Tàu đến rồi." }, x: 68, y: 41, w: 26, stand: { x: 68, y: 52 } },
    { id: "ticket", term: "票", gloss: "vé", above: true, portable: true, example: { zh: "我买了两张票。", vi: "Tôi đã mua hai vé." }, x: 16, y: 46, w: 6.5, stand: { x: 16, y: 68 } },
    { id: "phone", term: "手机", gloss: "điện thoại", above: true, portable: true, example: { zh: "我的手机在这儿。", vi: "Điện thoại của tôi ở đây." }, x: 24, y: 46, w: 3.6, stand: { x: 24, y: 68 } },
    { id: "newspaper", term: "报纸", gloss: "tờ báo", above: true, portable: true, example: { zh: "他在看报纸。", vi: "Anh ấy đang đọc báo." }, x: 31, y: 46, w: 6.5, stand: { x: 31, y: 68 } },
    { id: "suitcase", term: "行李箱", gloss: "vali", portable: true, example: { zh: "我的行李箱很重。", vi: "Vali của tôi rất nặng." }, x: 36, y: 86, w: 7 },
    { id: "bag", term: "包", gloss: "cái túi, cặp", portable: true, example: { zh: "这是我的包。", vi: "Đây là túi của tôi." }, x: 50, y: 92, w: 5 },
    { id: "book", term: "书", gloss: "sách", portable: true, example: { zh: "我在火车上看书。", vi: "Tôi đọc sách trên tàu." }, x: 22, y: 92, w: 6 },
    { id: "chair", term: "椅子", gloss: "cái ghế", example: { zh: "请坐这把椅子。", vi: "Mời ngồi chiếc ghế này." }, x: 64, y: 88, w: 9 },
    { id: "water", term: "水", gloss: "nước", portable: true, example: { zh: "我想喝水。", vi: "Tôi muốn uống nước." }, x: 76, y: 92, w: 2.8 },
  ],
};
