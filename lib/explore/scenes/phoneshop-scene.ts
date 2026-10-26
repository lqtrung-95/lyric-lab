import type { SceneDef } from "../explore-types";

/** Cửa hàng điện thoại: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const PHONESHOP_SCENE: SceneDef = {
  id: "phoneshop",
  title: "Cửa hàng điện thoại",
  subtitle: "Ghé cửa hàng điện thoại, học từ về phụ kiện và thiết bị rồi làm nhiệm vụ cho Anh Heo bán máy.",
  theme: "phoneshop",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Hiệu thuốc", to: "pharmacy", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Quán lẩu", to: "hotpot", x: 92, y: 60, w: 6 }],
  npc: {
    id: "pig", name: "Anh Heo bán máy", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến cửa hàng điện thoại! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我的手机没电了。", vi: "Điện thoại của tôi hết pin rồi." },
    { zh: "这个手机多少钱?", vi: "Chiếc điện thoại này bao nhiêu tiền?" },
    { zh: "可以便宜一点吗?", vi: "Có thể rẻ hơn một chút không?" },
    { zh: "有保修吗?", vi: "Có bảo hành không?" },
  ],
  objects: [
    { id: "charger", term: "充电器", gloss: "cục sạc", above: true, portable: true, example: { zh: "我忘了带充电器。", vi: "Tôi quên mang cục sạc." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "phonecase", term: "手机壳", gloss: "ốp điện thoại", above: true, portable: true, example: { zh: "这个手机壳很好看。", vi: "Chiếc ốp điện thoại này rất đẹp." }, x: 28, y: 48, w: 4, stand: { x: 28, y: 70 } },
    { id: "cable", term: "数据线", gloss: "dây cáp", above: true, portable: true, example: { zh: "这根数据线太短了。", vi: "Sợi dây cáp này ngắn quá." }, x: 35, y: 48, w: 6.5, stand: { x: 35, y: 70 } },
    { id: "battery", term: "电池", gloss: "pin", above: true, portable: true, example: { zh: "电池快没电了。", vi: "Pin sắp hết rồi." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "powerbank", term: "充电宝", gloss: "sạc dự phòng", above: true, portable: true, example: { zh: "出门带一个充电宝。", vi: "Ra ngoài mang theo một cục sạc dự phòng." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "smartwatch", term: "智能手表", gloss: "đồng hồ thông minh", above: true, portable: true, example: { zh: "他戴着一块智能手表。", vi: "Anh ấy đeo một chiếc đồng hồ thông minh." }, x: 67, y: 50, w: 4, stand: { x: 67, y: 74 } },
    { id: "socket", term: "插座", gloss: "ổ cắm điện", above: true, portable: true, example: { zh: "插座在桌子下面。", vi: "Ổ cắm điện ở dưới bàn." }, x: 74, y: 50, w: 5, stand: { x: 74, y: 74 } },
    { id: "warranty", term: "保修卡", gloss: "thẻ bảo hành", above: true, portable: true, example: { zh: "请收好保修卡。", vi: "Xin hãy giữ kỹ thẻ bảo hành." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "tablet", term: "平板电脑", gloss: "máy tính bảng", portable: true, example: { zh: "我用平板电脑看视频。", vi: "Tôi dùng máy tính bảng xem video." }, x: 44, y: 80, w: 8 },
    { id: "speaker", term: "音箱", gloss: "loa", portable: true, example: { zh: "这个音箱声音很大。", vi: "Chiếc loa này tiếng rất to." }, x: 56, y: 94, w: 6 },
    { id: "router", term: "路由器", gloss: "bộ phát wifi", portable: true, example: { zh: "路由器放在客厅里。", vi: "Bộ phát wifi đặt ở phòng khách." }, x: 84, y: 76, w: 7 },
    { id: "microphone", term: "话筒", gloss: "micro", portable: true, example: { zh: "请把话筒给我。", vi: "Xin đưa micro cho tôi." }, x: 30, y: 92, w: 4 },
  ],
};
