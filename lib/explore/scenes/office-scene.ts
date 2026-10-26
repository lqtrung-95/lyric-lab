import type { SceneDef } from "../explore-types";

/** Văn phòng: bàn làm việc có máy tính, điện thoại, máy in và tài liệu. Câu ví dụ tự viết, đơn giản, dùng được khi đi làm. */
export const OFFICE_SCENE: SceneDef = {
  id: "office",
  title: "Văn phòng",
  subtitle: "Đến công ty, học từ về máy tính, tài liệu và đồ dùng văn phòng rồi làm nhiệm vụ cho Chú Chó trưởng phòng.",
  theme: "office",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Sân bay", to: "airport", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Thư viện", to: "library", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "dog", name: "Chú Chó trưởng phòng", x: 88, y: 93, w: 11,
    greeting: "Chào mừng đến văn phòng! Hãy đi quanh, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "table", x: 22, y: 80, w: 26 },
    { sprite: "table", x: 62, y: 80, w: 26 },
  ],
  objects: [
    { id: "window", wall: true, term: "窗户", gloss: "cửa sổ", example: { zh: "办公室的窗户很大。", vi: "Cửa sổ văn phòng rất lớn." }, x: 28, y: 27, w: 16 },
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "现在是九点钟。", vi: "Bây giờ là chín giờ." }, x: 56, y: 24, w: 6 },
    { id: "lamp", term: "灯", gloss: "đèn", example: { zh: "桌子上有一盏灯。", vi: "Trên bàn có một cái đèn." }, x: 92, y: 50, w: 5 },
    { id: "laptop", term: "电脑", gloss: "máy tính", above: true, portable: true, example: { zh: "我用电脑工作。", vi: "Tôi làm việc bằng máy tính." }, x: 14, y: 64, w: 8, stand: { x: 14, y: 87 } },
    { id: "phone", term: "手机", gloss: "điện thoại", above: true, portable: true, example: { zh: "请关手机。", vi: "Xin hãy tắt điện thoại." }, x: 22, y: 64, w: 3.4, stand: { x: 22, y: 87 } },
    { id: "pen", term: "笔", gloss: "bút", above: true, portable: true, example: { zh: "请给我一支笔。", vi: "Cho tôi một cây bút." }, x: 28, y: 64, w: 4, stand: { x: 28, y: 87 } },
    { id: "printer", term: "打印机", gloss: "máy in", above: true, example: { zh: "打印机坏了。", vi: "Máy in hỏng rồi." }, x: 56, y: 64, w: 9, stand: { x: 56, y: 87 } },
    { id: "document", term: "文件", gloss: "tài liệu", above: true, portable: true, example: { zh: "这个文件很重要。", vi: "Tài liệu này rất quan trọng." }, x: 65, y: 64, w: 5.5, stand: { x: 65, y: 87 } },
    { id: "coffee", term: "咖啡", gloss: "cà phê", above: true, portable: true, example: { zh: "我早上喝咖啡。", vi: "Buổi sáng tôi uống cà phê." }, x: 72, y: 64, w: 4, stand: { x: 72, y: 87 } },
    { id: "book", term: "书", gloss: "sách", portable: true, example: { zh: "桌子上有一本书。", vi: "Trên bàn có một quyển sách." }, x: 40, y: 94, w: 6 },
    { id: "bag", term: "包", gloss: "cái túi, cặp", portable: true, example: { zh: "我的包在椅子上。", vi: "Túi của tôi ở trên ghế." }, x: 50, y: 94, w: 5 },
    { id: "chair", term: "椅子", gloss: "cái ghế", example: { zh: "这把椅子很舒服。", vi: "Chiếc ghế này rất thoải mái." }, x: 78, y: 90, w: 8 },
  ],
};
