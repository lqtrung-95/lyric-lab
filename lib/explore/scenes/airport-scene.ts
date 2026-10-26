import type { SceneDef } from "../explore-types";

/** Sân bay: máy bay sát tường kính, quầy làm thủ tục và hành lý. Câu ví dụ tự viết, dùng được khi đi máy bay. */
export const AIRPORT_SCENE: SceneDef = {
  id: "airport",
  title: "Sân bay",
  subtitle: "Làm thủ tục ở sân bay, học từ về chuyến bay rồi làm nhiệm vụ cho Cô Heo tiếp viên.",
  theme: "airport",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Khách sạn", to: "hotel", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Văn phòng", to: "office", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "pig", name: "Cô Heo", x: 90, y: 93, w: 8,
    greeting: "Chào mừng đến sân bay! Hãy đi quanh sảnh, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài chỗ nhé!",
  },
  decor: [{ sprite: "counter", x: 24, y: 66, w: 26 }],
  phrases: [
    { zh: "请出示您的护照。", vi: "Xin hãy xuất trình hộ chiếu của bạn." },
    { zh: "我的行李超重了吗?", vi: "Hành lý của tôi có quá cân không?" },
    { zh: "登机口在哪儿?", vi: "Cửa lên máy bay ở đâu?" },
    { zh: "飞机晚点了。", vi: "Máy bay bị hoãn rồi." },
  ],
  objects: [
    { id: "plane", wall: true, term: "飞机", gloss: "máy bay", example: { zh: "飞机几点起飞?", vi: "Máy bay cất cánh lúc mấy giờ?" }, x: 68, y: 43, w: 30, stand: { x: 68, y: 54 } },
    { id: "passport", term: "护照", gloss: "hộ chiếu", above: true, portable: true, example: { zh: "请给我看你的护照。", vi: "Cho tôi xem hộ chiếu của bạn." }, x: 16, y: 50, w: 4.5, stand: { x: 16, y: 72 } },
    { id: "suitcase", term: "行李箱", gloss: "vali", portable: true, example: { zh: "我有两个行李箱。", vi: "Tôi có hai cái vali." }, x: 38, y: 88, w: 7 },
    { id: "boardingpass", term: "登机牌", gloss: "thẻ lên máy bay", above: true, portable: true, example: { zh: "请出示登机牌。", vi: "Xin hãy xuất trình thẻ lên máy bay." }, x: 24, y: 50, w: 6, stand: { x: 24, y: 72 } },
    { id: "luggagetag", term: "行李牌", gloss: "thẻ hành lý", above: true, portable: true, example: { zh: "行李牌在这儿。", vi: "Thẻ hành lý ở đây." }, x: 31, y: 50, w: 3.5, stand: { x: 31, y: 72 } },
    { id: "securitygate", term: "安检门", gloss: "cổng an ninh", example: { zh: "请通过安检门。", vi: "Xin hãy đi qua cổng an ninh." }, x: 80, y: 88, w: 8 },
    { id: "conveyor", term: "传送带", gloss: "băng chuyền hành lý", example: { zh: "行李在传送带上。", vi: "Hành lý ở trên băng chuyền." }, x: 62, y: 92, w: 16 },
    { id: "tower", wall: true, term: "塔台", gloss: "tháp điều khiển", example: { zh: "塔台指挥飞机起飞。", vi: "Tháp điều khiển chỉ huy máy bay cất cánh." }, x: 44, y: 24, w: 5 },
    { id: "flightboard", wall: true, term: "航班牌", gloss: "bảng chuyến bay", example: { zh: "请看航班牌。", vi: "Xin hãy xem bảng chuyến bay." }, x: 88, y: 26, w: 12 },
  ],
};
