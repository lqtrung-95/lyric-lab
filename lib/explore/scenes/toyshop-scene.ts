import type { SceneDef } from "../explore-types";

/** Cửa hàng đồ chơi: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const TOYSHOP_SCENE: SceneDef = {
  id: "toyshop",
  title: "Cửa hàng đồ chơi",
  subtitle: "Ghé cửa hàng đồ chơi, học tên đồ chơi rồi làm nhiệm vụ cho Cụ Cú chủ tiệm.",
  theme: "toyshop",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Tiệm giặt là", to: "laundry", x: 7, y: 60, w: 6 }],
  npc: {
    id: "owl", name: "Cụ Cú chủ tiệm", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến cửa hàng đồ chơi! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "这个玩具多少钱?", vi: "Món đồ chơi này bao nhiêu tiền?" },
    { zh: "我想送给我弟弟。", vi: "Tôi muốn tặng em trai tôi." },
    { zh: "这个适合几岁的孩子?", vi: "Cái này hợp cho bé mấy tuổi?" },
    { zh: "请帮我包装一下。", vi: "Xin gói giúp tôi." },
  ],
  objects: [
    { id: "blocks", term: "积木", gloss: "khối xếp hình", above: true, portable: true, example: { zh: "他用积木搭了一座房子。", vi: "Cậu ấy dùng khối xếp hình dựng một ngôi nhà." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "puzzle", term: "拼图", gloss: "tranh ghép", above: true, portable: true, example: { zh: "这幅拼图有一百块。", vi: "Bức tranh ghép này có một trăm mảnh." }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "yoyo", term: "溜溜球", gloss: "con quay dây", above: true, portable: true, example: { zh: "他的溜溜球玩得很好。", vi: "Cậu ấy chơi con quay dây rất giỏi." }, x: 35, y: 48, w: 3.5, stand: { x: 35, y: 70 } },
    { id: "spintop", term: "陀螺", gloss: "con vụ", above: true, portable: true, example: { zh: "陀螺转得很快。", vi: "Con vụ quay rất nhanh." }, x: 41, y: 48, w: 4, stand: { x: 41, y: 70 } },
    { id: "rubik", term: "魔方", gloss: "khối rubik", above: true, portable: true, example: { zh: "我不会玩魔方。", vi: "Tôi không biết chơi rubik." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "marbles", term: "弹珠", gloss: "bi ve", above: true, portable: true, example: { zh: "弟弟有很多弹珠。", vi: "Em trai có rất nhiều bi ve." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "doll", term: "洋娃娃", gloss: "búp bê", above: true, portable: true, example: { zh: "女儿抱着洋娃娃睡觉。", vi: "Con gái ôm búp bê đi ngủ." }, x: 74, y: 50, w: 4, stand: { x: 74, y: 74 } },
    { id: "robot", term: "机器人", gloss: "người máy", above: true, portable: true, example: { zh: "这个机器人会唱歌。", vi: "Người máy này biết hát." }, x: 81, y: 50, w: 4, stand: { x: 81, y: 74 } },
    { id: "toytrain", term: "玩具火车", gloss: "tàu hỏa đồ chơi", example: { zh: "玩具火车在轨道上跑。", vi: "Tàu hỏa đồ chơi chạy trên đường ray." }, x: 44, y: 80, w: 12 },
    { id: "rccar", term: "遥控车", gloss: "xe điều khiển từ xa", portable: true, example: { zh: "遥控车跑得真快。", vi: "Xe điều khiển từ xa chạy thật nhanh." }, x: 56, y: 94, w: 9 },
    { id: "chess", term: "象棋", gloss: "cờ tướng", portable: true, example: { zh: "爷爷教我下象棋。", vi: "Ông dạy tôi chơi cờ tướng." }, x: 84, y: 76, w: 7 },
    { id: "teddy", term: "玩具熊", gloss: "gấu bông", portable: true, example: { zh: "这只玩具熊很可爱。", vi: "Chú gấu bông này rất đáng yêu." }, x: 30, y: 92, w: 7 },
  ],
};
