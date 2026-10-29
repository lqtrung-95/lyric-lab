import type { SceneDef } from "../explore-types";

/** Cửa hàng tiện lợi: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const CONVENIENCE_SCENE: SceneDef = {
  id: "convenience",
  title: "Cửa hàng tiện lợi",
  subtitle: "Ghé cửa hàng tiện lợi mở cửa suốt đêm, học từ về đồ ăn nhanh rồi làm nhiệm vụ cho Bạn Vịt thu ngân.",
  theme: "convenience",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Trạm xe buýt", to: "busstop", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Trường mẫu giáo", to: "kindergarten", x: 92, y: 60, w: 6 }],
  npc: {
    id: "duck", name: "Bạn Vịt thu ngân", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến cửa hàng tiện lợi! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "请问,可以加热吗?", vi: "Cho hỏi, có hâm nóng được không?" },
    { zh: "一共十二块五。", vi: "Tổng cộng mười hai tệ rưỡi." },
    { zh: "要不要袋子?", vi: "Có cần túi không?" },
    { zh: "这里二十四小时营业。", vi: "Ở đây mở cửa hai mươi bốn giờ." },
  ],
  objects: [
    { id: "oden", term: "关东煮", gloss: "oden (món hầm xiên)", above: true, portable: true, example: { zh: "冬天来一杯热关东煮真舒服。", vi: "Mùa đông ăn oden nóng thật dễ chịu." }, x: 21, y: 48, w: 5.5, stand: { x: 21, y: 70 } },
    { id: "riceball", term: "饭团", gloss: "cơm nắm", above: true, portable: true, example: { zh: "我早饭只吃了一个饭团。", vi: "Bữa sáng tôi chỉ ăn một nắm cơm." }, x: 28, y: 48, w: 5, stand: { x: 28, y: 70 } },
    { id: "bento", term: "便当", gloss: "cơm hộp", above: true, portable: true, example: { zh: "用微波炉热一下便当吧。", vi: "Hâm cơm hộp trong lò vi sóng nhé." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "cupnoodle", term: "杯面", gloss: "mì ly", above: true, portable: true, example: { zh: "杯面加开水泡三分钟。", vi: "Mì ly chế nước sôi ngâm ba phút." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "drink", term: "饮料", gloss: "đồ uống đóng chai", above: true, portable: true, example: { zh: "这瓶饮料买一送一。", vi: "Chai đồ uống này mua một tặng một." }, x: 60, y: 50, w: 4.5, stand: { x: 60, y: 74 } },
    { id: "snack", term: "零食", gloss: "đồ ăn vặt", above: true, portable: true, example: { zh: "孩子们都爱吃零食。", vi: "Bọn trẻ đều thích ăn vặt." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "gum", term: "口香糖", gloss: "kẹo cao su", above: true, portable: true, example: { zh: "他一边走一边嚼口香糖。", vi: "Anh ấy vừa đi vừa nhai kẹo cao su." }, x: 74, y: 50, w: 4, stand: { x: 74, y: 74 } },
    { id: "lighter", term: "打火机", gloss: "bật lửa", above: true, portable: true, example: { zh: "这家店不卖打火机。", vi: "Cửa hàng này không bán bật lửa." }, x: 81, y: 50, w: 4, stand: { x: 81, y: 74 } },
    { id: "checkout", term: "购物筐", gloss: "giỏ mua hàng", example: { zh: "我把东西都放进购物筐里。", vi: "Tôi bỏ hết đồ vào giỏ mua hàng." }, x: 44, y: 80, w: 8 },
    { id: "coolercase", term: "冷藏柜", gloss: "tủ mát", example: { zh: "牛奶放在冷藏柜里。", vi: "Sữa để trong tủ mát." }, x: 56, y: 94, w: 8 },
    { id: "microwave", term: "微波炉", gloss: "lò vi sóng", example: { zh: "微波炉叮的一声,饭就热好了。", vi: "Lò vi sóng kêu \"ting\", cơm đã hâm xong." }, x: 84, y: 76, w: 7 },
    { id: "autodoor", term: "自动门", gloss: "cửa tự động", example: { zh: "自动门一开,冷气扑面而来。", vi: "Cửa tự động vừa mở, hơi lạnh phả vào mặt." }, x: 30, y: 92, w: 8 },
  ],
};
