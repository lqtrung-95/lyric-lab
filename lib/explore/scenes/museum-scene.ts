import type { SceneDef } from "../explore-types";

/** Bảo tàng: tranh, tượng, bình hoa và băng ghế ngắm tranh. Câu ví dụ tự viết, đơn giản, dùng được khi đi tham quan. */
export const MUSEUM_SCENE: SceneDef = {
  id: "museum",
  title: "Bảo tàng",
  subtitle: "Tham quan bảo tàng yên tĩnh, học từ về tranh, tượng và vé rồi làm nhiệm vụ cho Cô Cú giám đốc.",
  theme: "museum",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Nhà bếp", to: "kitchen", x: 7, y: 60, w: 6 }],
  npc: {
    id: "owl", name: "Cô Cú giám đốc", x: 90, y: 93, w: 9,
    greeting: "Chào mừng đến bảo tàng! Hãy đi nhẹ, lại gần tác phẩm rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp cô để nhận nhiệm vụ nhé.",
    notReady: "Em cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  objects: [
    { id: "painting", wall: true, term: "画", gloss: "bức tranh", example: { zh: "这幅画很漂亮。", vi: "Bức tranh này rất đẹp." }, x: 34, y: 31, w: 16 },
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "博物馆九点钟开门。", vi: "Bảo tàng mở cửa lúc chín giờ." }, x: 58, y: 24, w: 6 },
    { id: "map", wall: true, term: "地图", gloss: "bản đồ", example: { zh: "请看博物馆地图。", vi: "Xin hãy xem bản đồ bảo tàng." }, x: 76, y: 26, w: 8 },
    { id: "cup", term: "杯子", gloss: "cái cốc", portable: true, example: { zh: "馆里可以喝茶,杯子在这里。", vi: "Trong bảo tàng có thể uống trà, cốc ở đây." }, x: 92, y: 52, w: 3.6 },
    { id: "statue", term: "雕像", gloss: "bức tượng", example: { zh: "这座雕像很有名。", vi: "Bức tượng này rất nổi tiếng." }, x: 18, y: 72, w: 9 },
    { id: "vase", term: "花瓶", gloss: "bình hoa", portable: true, example: { zh: "花瓶里有花。", vi: "Trong bình có hoa." }, x: 40, y: 74, w: 6 },
    { id: "bench", term: "长椅", gloss: "ghế dài", example: { zh: "我们在长椅上看画。", vi: "Chúng ta ngồi ghế dài ngắm tranh." }, x: 64, y: 78, w: 16 },
    { id: "glasses", term: "眼镜", gloss: "kính", above: true, portable: true, example: { zh: "他把眼镜放在长椅上。", vi: "Anh ấy để kính trên ghế dài." }, x: 64, y: 68, w: 5.5, stand: { x: 64, y: 86 } },
    { id: "ticket", term: "票", gloss: "vé", portable: true, example: { zh: "参观要买票。", vi: "Tham quan phải mua vé." }, x: 44, y: 94, w: 6.5 },
    { id: "book", term: "书", gloss: "sách", portable: true, example: { zh: "这本书介绍这幅画。", vi: "Quyển sách này giới thiệu bức tranh." }, x: 30, y: 92, w: 6 },
    { id: "newspaper", term: "报纸", gloss: "tờ báo", portable: true, example: { zh: "报纸上有博物馆的新闻。", vi: "Trên báo có tin về bảo tàng." }, x: 22, y: 94, w: 6.5 },
    { id: "bag", term: "包", gloss: "cái túi", portable: true, example: { zh: "请把包放在这里。", vi: "Xin để túi ở đây." }, x: 80, y: 94, w: 5 },
  ],
};
