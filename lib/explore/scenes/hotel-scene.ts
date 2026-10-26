import type { SceneDef } from "../explore-types";

/** Khách sạn: phòng nghỉ có giường, ti vi và bàn để chìa khóa, khăn. Câu ví dụ tự viết, dùng được khi đặt phòng. */
export const HOTEL_SCENE: SceneDef = {
  id: "hotel",
  title: "Khách sạn",
  subtitle: "Nhận phòng khách sạn, học từ về phòng nghỉ rồi làm nhiệm vụ cho Chú Vịt lễ tân.",
  theme: "hotel",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Cửa hàng", to: "clothing-store", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Sân bay", to: "airport", x: 90, y: 56, w: 6 },
  ],
  npc: {
    id: "duck", name: "Chú Vịt", x: 88, y: 93, w: 8,
    greeting: "Chào mừng đến khách sạn! Hãy đi quanh phòng, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [{ sprite: "table", x: 70, y: 82, w: 26 }],
  phrases: [
    { zh: "我想订一个房间。", vi: "Tôi muốn đặt một phòng." },
    { zh: "房间在几楼?", vi: "Phòng ở tầng mấy?" },
    { zh: "请问,早餐几点开始?", vi: "Xin hỏi, bữa sáng mấy giờ bắt đầu?" },
    { zh: "请给我换一间房。", vi: "Xin đổi cho tôi một phòng khác." },
  ],
  objects: [
    { id: "key", term: "钥匙", gloss: "chìa khóa", above: true, portable: true, example: { zh: "这是你的钥匙。", vi: "Đây là chìa khóa của bạn." }, x: 62, y: 66, w: 4.5, stand: { x: 62, y: 90 } },
    { id: "towel", term: "毛巾", gloss: "khăn tắm", above: true, portable: true, example: { zh: "请给我一条毛巾。", vi: "Cho tôi một cái khăn." }, x: 74, y: 66, w: 5.5, stand: { x: 74, y: 90 } },
    { id: "sofa", term: "沙发", gloss: "ghế sofa", example: { zh: "大厅里有沙发。", vi: "Trong sảnh có ghế sofa." }, x: 18, y: 70, w: 16 },
    { id: "wardrobe", term: "衣柜", gloss: "tủ quần áo", example: { zh: "衣服在衣柜里。", vi: "Quần áo ở trong tủ." }, x: 58, y: 36, w: 9 },
    { id: "telephone", term: "电话", gloss: "điện thoại bàn", above: true, portable: true, example: { zh: "请打电话给前台。", vi: "Xin hãy gọi điện cho lễ tân." }, x: 68, y: 66, w: 3.4, stand: { x: 68, y: 90 } },
    { id: "roomcard", term: "房卡", gloss: "thẻ phòng", above: true, portable: true, example: { zh: "请把房卡给我。", vi: "Xin đưa thẻ phòng cho tôi." }, x: 80, y: 66, w: 5, stand: { x: 80, y: 90 } },
    { id: "slippers", term: "拖鞋", gloss: "dép đi trong nhà", portable: true, example: { zh: "房间里有拖鞋。", vi: "Trong phòng có dép đi trong nhà." }, x: 40, y: 88, w: 7 },
    { id: "hairdryer", term: "吹风机", gloss: "máy sấy tóc", portable: true, example: { zh: "浴室里有吹风机。", vi: "Trong phòng tắm có máy sấy tóc." }, x: 28, y: 94, w: 5 },
    { id: "minibar", term: "小冰箱", gloss: "tủ lạnh mini", example: { zh: "小冰箱里有饮料。", vi: "Trong tủ lạnh mini có đồ uống." }, x: 52, y: 78, w: 6 },
    { id: "elevator", wall: true, term: "电梯", gloss: "thang máy", example: { zh: "我们坐电梯上楼。", vi: "Chúng ta đi thang máy lên lầu." }, x: 26, y: 38, w: 9 },
    { id: "breakfast", term: "早餐", gloss: "bữa sáng", portable: true, example: { zh: "早餐在一楼。", vi: "Bữa sáng ở tầng một." }, x: 36, y: 76, w: 6 },
    { id: "dnd", wall: true, term: "请勿打扰", gloss: "biển xin đừng làm phiền", example: { zh: "门上挂着请勿打扰的牌子。", vi: "Trên cửa treo biển xin đừng làm phiền." }, x: 86, y: 34, w: 4 },
    { id: "bathrobe", term: "浴袍", gloss: "áo choàng tắm", portable: true, example: { zh: "房间里有浴袍。", vi: "Trong phòng có áo choàng tắm." }, x: 38, y: 54, w: 6 },
  ],
};
