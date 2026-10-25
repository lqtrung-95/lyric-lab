import type { SceneDef } from "../explore-types";

/** Trường học: bảng đen, đồ dùng học tập và hai bàn học. Câu ví dụ tự viết, đơn giản, dùng ngay ở lớp. */
export const SCHOOL_SCENE: SceneDef = {
  id: "school",
  title: "Trường học",
  subtitle: "Vào lớp học, học tên đồ dùng học tập rồi làm nhiệm vụ cho Cô Chim giáo viên.",
  theme: "school",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Bệnh viện", to: "hospital", x: 7, y: 58, w: 6 },
    { sprite: "exit", label: "Sang Cửa hàng", to: "clothing-store", x: 90, y: 58, w: 6 },
  ],
  npc: {
    id: "bird", name: "Cô Chim", x: 90, y: 93, w: 8,
    greeting: "Chào các em! Hãy đi quanh lớp, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp cô để nhận nhiệm vụ nhé.",
    notReady: "Em cần học ít nhất 3 từ trước đã. Đi quanh lớp và ghé vài chỗ nhé!",
  },
  decor: [
    { sprite: "table", x: 22, y: 80, w: 26 },
    { sprite: "table", x: 62, y: 80, w: 26 },
  ],
  objects: [
    { id: "blackboard", wall: true, term: "黑板", gloss: "bảng đen", example: { zh: "老师在黑板上写字。", vi: "Cô giáo viết chữ lên bảng." }, x: 36, y: 31, w: 26 },
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "教室里有一个钟。", vi: "Trong lớp có một cái đồng hồ." }, x: 68, y: 24, w: 6 },
    { id: "map", wall: true, term: "地图", gloss: "bản đồ", example: { zh: "墙上有一张地图。", vi: "Trên tường có một tấm bản đồ." }, x: 82, y: 26, w: 8 },
    { id: "book", term: "书", gloss: "sách", above: true, portable: true, example: { zh: "请打开书。", vi: "Xin hãy mở sách ra." }, x: 14, y: 64, w: 6.5, stand: { x: 14, y: 87 } },
    { id: "pen", term: "笔", gloss: "bút", above: true, portable: true, example: { zh: "我有一支笔。", vi: "Tôi có một cây bút." }, x: 22, y: 64, w: 4, stand: { x: 22, y: 87 } },
    { id: "ruler", term: "尺子", gloss: "thước kẻ", above: true, portable: true, example: { zh: "请给我尺子。", vi: "Cho tôi mượn thước kẻ." }, x: 30, y: 64, w: 7, stand: { x: 30, y: 87 } },
    { id: "laptop", term: "电脑", gloss: "máy tính", above: true, portable: true, example: { zh: "老师在用电脑。", vi: "Cô giáo đang dùng máy tính." }, x: 55, y: 64, w: 8, stand: { x: 55, y: 87 } },
    { id: "cup", term: "杯子", gloss: "cái cốc", above: true, portable: true, example: { zh: "我的杯子是蓝色的。", vi: "Cốc của tôi màu xanh." }, x: 64, y: 64, w: 3.6, stand: { x: 64, y: 87 } },
    { id: "water", term: "水", gloss: "nước", above: true, portable: true, example: { zh: "上课时可以喝水。", vi: "Trong giờ học được uống nước." }, x: 70, y: 64, w: 2.6, stand: { x: 70, y: 87 } },
    { id: "schoolbag", term: "书包", gloss: "cặp sách", portable: true, example: { zh: "他的书包很重。", vi: "Cặp sách của cậu ấy rất nặng." }, x: 42, y: 92, w: 6 },
    { id: "chair", term: "椅子", gloss: "cái ghế", example: { zh: "请坐在椅子上。", vi: "Mời ngồi lên ghế." }, x: 80, y: 90, w: 8 },
  ],
};
