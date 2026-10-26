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
  phrases: [
    { zh: "老师好!", vi: "Em chào cô ạ!" },
    { zh: "请再说一遍。", vi: "Xin hãy nói lại một lần nữa." },
    { zh: "我不明白。", vi: "Em không hiểu." },
    { zh: "现在下课了。", vi: "Bây giờ tan học rồi." },
  ],
  objects: [
    { id: "blackboard", wall: true, term: "黑板", gloss: "bảng đen", example: { zh: "老师在黑板上写字。", vi: "Cô giáo viết chữ lên bảng." }, x: 36, y: 31, w: 26 },
    { id: "schoolbag", term: "书包", gloss: "cặp sách", portable: true, example: { zh: "他的书包很重。", vi: "Cặp sách của cậu ấy rất nặng." }, x: 42, y: 92, w: 6 },
    { id: "ruler", term: "尺子", gloss: "thước kẻ", above: true, portable: true, example: { zh: "请给我尺子。", vi: "Cho tôi mượn thước kẻ." }, x: 30, y: 64, w: 7, stand: { x: 30, y: 87 } },
    { id: "pen", term: "笔", gloss: "bút", above: true, portable: true, example: { zh: "我有一支笔。", vi: "Tôi có một cây bút." }, x: 22, y: 64, w: 4, stand: { x: 22, y: 87 } },
    { id: "eraser", term: "橡皮", gloss: "cục tẩy", above: true, portable: true, example: { zh: "请借我橡皮。", vi: "Cho mình mượn cục tẩy." }, x: 14, y: 64, w: 4.5, stand: { x: 14, y: 87 } },
    { id: "notebook", term: "本子", gloss: "quyển vở", above: true, portable: true, example: { zh: "请拿出本子。", vi: "Hãy lấy vở ra." }, x: 55, y: 64, w: 5, stand: { x: 55, y: 87 } },
    { id: "chalk", term: "粉笔", gloss: "viên phấn", above: true, portable: true, example: { zh: "老师用粉笔写字。", vi: "Cô giáo viết chữ bằng phấn." }, x: 64, y: 64, w: 4, stand: { x: 64, y: 87 } },
    { id: "globe", term: "地球仪", gloss: "quả địa cầu", above: true, portable: true, example: { zh: "地球仪在桌子上。", vi: "Quả địa cầu ở trên bàn." }, x: 70, y: 64, w: 4.5, stand: { x: 70, y: 87 } },
    { id: "bell", wall: true, term: "铃", gloss: "cái chuông", example: { zh: "下课铃响了。", vi: "Chuông ra chơi đã reo." }, x: 68, y: 24, w: 5.5 },
    { id: "desk", term: "课桌", gloss: "bàn học", example: { zh: "请回到你的课桌。", vi: "Hãy về chỗ bàn học của em." }, x: 80, y: 90, w: 13 },
    { id: "glue", term: "胶水", gloss: "hồ dán", above: true, portable: true, example: { zh: "请借我胶水。", vi: "Cho mình mượn hồ dán." }, x: 74, y: 64, w: 3.5, stand: { x: 74, y: 87 } },
    { id: "paintbrush", term: "画笔", gloss: "bút vẽ", portable: true, example: { zh: "我用画笔画画。", vi: "Tôi dùng bút vẽ để vẽ tranh." }, x: 30, y: 94, w: 9 },
    { id: "textbook", term: "课本", gloss: "sách giáo khoa", portable: true, example: { zh: "请翻开课本第十页。", vi: "Xin hãy mở sách giáo khoa trang mười." }, x: 52, y: 94, w: 6 },
  ],
};
