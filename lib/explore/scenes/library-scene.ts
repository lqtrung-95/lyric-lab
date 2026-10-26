import type { SceneDef } from "../explore-types";

/** Thư viện: giá sách, bàn đọc có sách, báo và máy tính. Câu ví dụ tự viết, đơn giản, dùng được khi đi thư viện. */
export const LIBRARY_SCENE: SceneDef = {
  id: "library",
  title: "Thư viện",
  subtitle: "Vào thư viện yên tĩnh, học từ về sách, báo và đồ đọc rồi làm nhiệm vụ cho Cô Cú thủ thư.",
  theme: "library",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Văn phòng", to: "office", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Siêu thị", to: "supermarket", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "owl", name: "Cô Cú thủ thư", x: 90, y: 93, w: 9,
    greeting: "Suỵt, đây là thư viện! Hãy đi nhẹ, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp cô để nhận nhiệm vụ nhé.",
    notReady: "Em cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "table", x: 24, y: 80, w: 26 },
    { sprite: "table", x: 64, y: 80, w: 26 },
  ],
  objects: [
    { id: "bookshelf", wall: true, term: "书架", gloss: "giá sách", example: { zh: "书架上有很多书。", vi: "Trên giá sách có nhiều sách." }, x: 30, y: 33, w: 26 },
    { id: "window", wall: true, term: "窗户", gloss: "cửa sổ", example: { zh: "图书馆的窗户很干净。", vi: "Cửa sổ thư viện rất sạch." }, x: 68, y: 27, w: 14 },
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "图书馆五点钟关门。", vi: "Thư viện đóng cửa lúc năm giờ." }, x: 88, y: 24, w: 6 },
    { id: "lamp", term: "灯", gloss: "đèn", example: { zh: "请开灯看书。", vi: "Hãy bật đèn để đọc sách." }, x: 7, y: 48, w: 5 },
    { id: "book", term: "书", gloss: "sách", above: true, portable: true, example: { zh: "我借了一本书。", vi: "Tôi đã mượn một quyển sách." }, x: 16, y: 64, w: 6.5, stand: { x: 16, y: 87 } },
    { id: "newspaper", term: "报纸", gloss: "tờ báo", above: true, portable: true, example: { zh: "爷爷在看报纸。", vi: "Ông đang đọc báo." }, x: 25, y: 64, w: 6.5, stand: { x: 25, y: 87 } },
    { id: "pen", term: "笔", gloss: "bút", above: true, portable: true, example: { zh: "我的笔不见了。", vi: "Bút của tôi mất rồi." }, x: 32, y: 64, w: 4, stand: { x: 32, y: 87 } },
    { id: "laptop", term: "电脑", gloss: "máy tính", above: true, portable: true, example: { zh: "他在用电脑找书。", vi: "Anh ấy dùng máy tính để tìm sách." }, x: 58, y: 64, w: 8, stand: { x: 58, y: 87 } },
    { id: "glasses", term: "眼镜", gloss: "kính", above: true, portable: true, example: { zh: "奶奶戴着眼镜看书。", vi: "Bà đeo kính đọc sách." }, x: 67, y: 64, w: 6.5, stand: { x: 67, y: 87 } },
    { id: "cup", term: "杯子", gloss: "cái cốc", above: true, portable: true, example: { zh: "杯子里有茶。", vi: "Trong cốc có trà." }, x: 74, y: 64, w: 3.6, stand: { x: 74, y: 87 } },
    { id: "chair", term: "椅子", gloss: "cái ghế", example: { zh: "请坐在这把椅子上。", vi: "Mời ngồi lên chiếc ghế này." }, x: 44, y: 92, w: 8 },
    { id: "water", term: "水", gloss: "nước", portable: true, example: { zh: "图书馆里可以喝水。", vi: "Trong thư viện được uống nước." }, x: 56, y: 94, w: 2.6 },
  ],
};
