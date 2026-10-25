import type { SceneDef } from "../explore-types";

/** Sân bay: máy bay sát tường kính, quầy làm thủ tục và hành lý. Câu ví dụ tự viết, dùng được khi đi máy bay. */
export const AIRPORT_SCENE: SceneDef = {
  id: "airport",
  title: "Sân bay",
  subtitle: "Làm thủ tục ở sân bay, học từ về chuyến bay rồi làm nhiệm vụ cho Cô Heo tiếp viên.",
  theme: "airport",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Khách sạn", to: "hotel", x: 7, y: 60, w: 6 }],
  npc: {
    id: "pig", name: "Cô Heo", x: 90, y: 93, w: 8,
    greeting: "Chào mừng đến sân bay! Hãy đi quanh sảnh, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài chỗ nhé!",
  },
  decor: [{ sprite: "counter", x: 24, y: 66, w: 26 }],
  objects: [
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "现在是十点钟。", vi: "Bây giờ là mười giờ." }, x: 44, y: 24, w: 6 },
    { id: "map", wall: true, term: "地图", gloss: "bản đồ", example: { zh: "请看机场地图。", vi: "Xin hãy xem bản đồ sân bay." }, x: 88, y: 26, w: 8 },
    { id: "plane", wall: true, term: "飞机", gloss: "máy bay", example: { zh: "飞机几点起飞?", vi: "Máy bay cất cánh lúc mấy giờ?" }, x: 68, y: 43, w: 30, stand: { x: 68, y: 54 } },
    { id: "passport", term: "护照", gloss: "hộ chiếu", above: true, portable: true, example: { zh: "请给我看你的护照。", vi: "Cho tôi xem hộ chiếu của bạn." }, x: 16, y: 50, w: 4.5, stand: { x: 16, y: 72 } },
    { id: "ticket", term: "机票", gloss: "vé máy bay", above: true, portable: true, example: { zh: "我的机票在这里。", vi: "Vé máy bay của tôi ở đây." }, x: 24, y: 50, w: 6.5, stand: { x: 24, y: 72 } },
    { id: "phone", term: "手机", gloss: "điện thoại", above: true, portable: true, example: { zh: "请关手机。", vi: "Xin hãy tắt điện thoại." }, x: 31, y: 50, w: 3.6, stand: { x: 31, y: 72 } },
    { id: "suitcase", term: "行李箱", gloss: "vali", portable: true, example: { zh: "我有两个行李箱。", vi: "Tôi có hai cái vali." }, x: 38, y: 88, w: 7 },
    { id: "bag", term: "包", gloss: "cái túi", portable: true, example: { zh: "我的包不见了。", vi: "Túi của tôi mất rồi." }, x: 50, y: 94, w: 5 },
    { id: "coffee", term: "咖啡", gloss: "cà phê", portable: true, example: { zh: "我想喝一杯咖啡。", vi: "Tôi muốn uống một ly cà phê." }, x: 60, y: 92, w: 3.6 },
    { id: "newspaper", term: "报纸", gloss: "tờ báo", portable: true, example: { zh: "他在候机时看报纸。", vi: "Anh ấy đọc báo trong lúc chờ bay." }, x: 70, y: 94, w: 6.5 },
    { id: "chair", term: "椅子", gloss: "cái ghế", example: { zh: "请在椅子上等一下。", vi: "Xin hãy ngồi chờ một lát." }, x: 80, y: 88, w: 8 },
  ],
};
