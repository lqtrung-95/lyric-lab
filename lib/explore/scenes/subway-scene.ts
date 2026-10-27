import type { SceneDef } from "../explore-types";

/** Ga tàu điện ngầm: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const SUBWAY_SCENE: SceneDef = {
  id: "subway",
  title: "Ga tàu điện ngầm",
  subtitle: "Xuống ga tàu điện ngầm, học từ về đi lại trong thành phố rồi làm nhiệm vụ cho Anh Heo soát vé.",
  theme: "subway",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Đồn cảnh sát", to: "police", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Khu cắm trại", to: "camping", x: 92, y: 60, w: 6 }],
  npc: {
    id: "pig", name: "Anh Heo soát vé", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến ga tàu điện ngầm! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "请问怎么去人民广场?", vi: "Xin hỏi đi đến Quảng trường Nhân Dân thế nào?" },
    { zh: "下一站是哪儿?", vi: "Ga tiếp theo là ga nào?" },
    { zh: "我要在这一站换乘。", vi: "Tôi phải đổi tuyến ở ga này." },
    { zh: "请站在安全线后面。", vi: "Xin đứng sau vạch an toàn." },
  ],
  objects: [
    { id: "transitcard", term: "交通卡", gloss: "thẻ đi lại", above: true, portable: true, example: { zh: "我的交通卡没钱了。", vi: "Thẻ đi lại của tôi hết tiền rồi." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "routemap", term: "路线图", gloss: "sơ đồ tuyến", above: true, portable: true, example: { zh: "墙上的路线图可以帮你找路。", vi: "Sơ đồ tuyến trên tường có thể giúp bạn tìm đường." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "strap", term: "拉环", gloss: "tay vịn treo", above: true, portable: true, example: { zh: "没有座位就抓住拉环。", vi: "Không có chỗ ngồi thì nắm lấy tay vịn treo." }, x: 35, y: 48, w: 3.5, stand: { x: 35, y: 70 } },
    { id: "safetyline", term: "安全线", gloss: "vạch an toàn", above: true, portable: true, example: { zh: "请站在安全线后面,等地铁进站。", vi: "Xin đứng sau vạch an toàn, chờ tàu điện ngầm vào ga." }, x: 41, y: 48, w: 8, stand: { x: 41, y: 70 } },
    { id: "broadcast", term: "广播", gloss: "loa thông báo", above: true, portable: true, example: { zh: "广播说:“下一站是北京站。”", vi: "Loa thông báo nói: “Ga tiếp theo là ga Bắc Kinh.”" }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "exitsign", term: "出口", gloss: "lối ra", above: true, portable: true, example: { zh: "请从二号出口出去。", vi: "Xin đi ra bằng lối ra số hai." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "transfersign", term: "换乘", gloss: "đổi tuyến", above: true, portable: true, example: { zh: "在这一站可以换乘三号线。", vi: "Ở ga này có thể đổi tuyến sang tuyến số ba." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "carriage", term: "车厢", gloss: "toa tàu", above: true, portable: true, example: { zh: "第三节车厢里人很少。", vi: "Trong toa thứ ba rất ít người." }, x: 81, y: 50, w: 7, stand: { x: 81, y: 74 } },
    { id: "subwaytrain", term: "地铁", gloss: "tàu điện ngầm", example: { zh: "坐地铁去上班又快又方便。", vi: "Đi tàu điện ngầm đi làm vừa nhanh vừa tiện." }, x: 44, y: 80, w: 13 },
    { id: "escalator", term: "扶梯", gloss: "thang cuốn", example: { zh: "上扶梯的时候请抓紧扶手。", vi: "Khi lên thang cuốn xin nắm chặt tay vịn." }, x: 56, y: 94, w: 10 },
    { id: "faregate", term: "闸机", gloss: "cổng soát vé tự động", example: { zh: "把交通卡放在闸机上刷一下。", vi: "Đặt thẻ đi lại lên cổng soát vé tự động quẹt một cái." }, x: 84, y: 76, w: 8 },
    { id: "platform", term: "站台", gloss: "sân ga", example: { zh: "站台上有很多等车的人。", vi: "Trên sân ga có rất nhiều người chờ tàu." }, x: 30, y: 92, w: 12 },
  ],
};
