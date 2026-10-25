import type { SceneDef } from "../explore-types";

/** Khách sạn: phòng nghỉ có giường, ti vi và bàn để chìa khóa, khăn. Câu ví dụ tự viết, dùng được khi đặt phòng. */
export const HOTEL_SCENE: SceneDef = {
  id: "khach-san",
  title: "Khách sạn",
  subtitle: "Nhận phòng khách sạn, học từ về phòng nghỉ rồi làm nhiệm vụ cho Chú Vịt lễ tân.",
  theme: "hotel",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Cửa hàng", to: "cua-hang", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Sân bay", to: "san-bay", x: 90, y: 56, w: 6 },
  ],
  npc: {
    id: "duck", name: "Chú Vịt", x: 88, y: 93, w: 8,
    greeting: "Chào mừng đến khách sạn! Hãy đi quanh phòng, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [{ sprite: "table", x: 70, y: 82, w: 26 }],
  objects: [
    { id: "window", wall: true, term: "窗户", gloss: "cửa sổ", example: { zh: "窗户外面有一棵树。", vi: "Bên ngoài cửa sổ có một cái cây." }, x: 26, y: 27, w: 16 },
    { id: "tv", term: "电视", gloss: "ti vi", example: { zh: "房间里有电视。", vi: "Trong phòng có ti vi." }, x: 58, y: 36, w: 11 },
    { id: "lamp", term: "灯", gloss: "đèn", example: { zh: "请关灯。", vi: "Xin hãy tắt đèn." }, x: 38, y: 52, w: 5 },
    { id: "bed", term: "床", gloss: "cái giường", example: { zh: "这张床很舒服。", vi: "Chiếc giường này rất thoải mái." }, x: 18, y: 70, w: 22 },
    { id: "key", term: "钥匙", gloss: "chìa khóa", above: true, portable: true, example: { zh: "这是你的钥匙。", vi: "Đây là chìa khóa của bạn." }, x: 62, y: 66, w: 4.5, stand: { x: 62, y: 90 } },
    { id: "phone", term: "手机", gloss: "điện thoại", above: true, portable: true, example: { zh: "我的手机没电了。", vi: "Điện thoại của tôi hết pin rồi." }, x: 68, y: 66, w: 3.2, stand: { x: 68, y: 90 } },
    { id: "towel", term: "毛巾", gloss: "khăn tắm", above: true, portable: true, example: { zh: "请给我一条毛巾。", vi: "Cho tôi một cái khăn." }, x: 74, y: 66, w: 5.5, stand: { x: 74, y: 90 } },
    { id: "water", term: "水", gloss: "nước", above: true, portable: true, example: { zh: "房间里有免费的水。", vi: "Trong phòng có nước miễn phí." }, x: 80, y: 66, w: 2.6, stand: { x: 80, y: 90 } },
    { id: "suitcase", term: "行李箱", gloss: "vali", portable: true, example: { zh: "行李箱在床旁边。", vi: "Vali ở cạnh giường." }, x: 40, y: 88, w: 7 },
    { id: "book", term: "书", gloss: "sách", portable: true, example: { zh: "我晚上在房间看书。", vi: "Buổi tối tôi đọc sách trong phòng." }, x: 28, y: 94, w: 6 },
    { id: "flower", term: "花", gloss: "hoa", portable: true, example: { zh: "桌子上有一朵花。", vi: "Trên bàn có một bông hoa." }, x: 52, y: 78, w: 5 },
  ],
};
