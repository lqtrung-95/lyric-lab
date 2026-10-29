import type { SceneDef } from "../explore-types";

/** Nhà đón Tết: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const NEWYEAR_SCENE: SceneDef = {
  id: "newyear",
  title: "Nhà đón Tết",
  subtitle: "Đón Tết Nguyên đán trong căn nhà đỏ rực, học từ về ngày Tết rồi làm nhiệm vụ cho Bác Cừu chủ nhà.",
  theme: "newyear",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Quán hát karaoke", to: "ktv", x: 7, y: 60, w: 6 }],
  npc: {
    id: "sheep", name: "Bác Cừu chủ nhà đón Tết", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến nhà đón Tết! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "新年快乐!", vi: "Chúc mừng năm mới!" },
    { zh: "恭喜发财,万事如意。", vi: "Chúc phát tài, vạn sự như ý." },
    { zh: "过年好!", vi: "Chúc Tết!" },
    { zh: "一家人团团圆圆。", vi: "Cả nhà đoàn viên sum vầy." },
  ],
  objects: [
    { id: "hongbao", term: "红包", gloss: "bao lì xì", above: true, portable: true, example: { zh: "爷爷给孩子们发红包。", vi: "Ông phát lì xì cho bọn trẻ." }, x: 21, y: 48, w: 4, stand: { x: 21, y: 70 } },
    { id: "couplets", term: "春联", gloss: "câu đối Tết", above: true, portable: true, example: { zh: "大年三十,家家都贴春联。", vi: "Ngày ba mươi Tết nhà nào cũng dán câu đối." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "fuchar", term: "福字", gloss: "chữ Phúc", above: true, portable: true, example: { zh: "门上倒贴着一个福字。", vi: "Trên cửa dán ngược một chữ Phúc." }, x: 35, y: 48, w: 5, stand: { x: 35, y: 70 } },
    { id: "firecracker", term: "鞭炮", gloss: "pháo", above: true, portable: true, example: { zh: "过年的时候,孩子们喜欢放鞭炮。", vi: "Dịp Tết, bọn trẻ thích đốt pháo." }, x: 41, y: 48, w: 4.5, stand: { x: 41, y: 70 } },
    { id: "ricecake", term: "年糕", gloss: "bánh gạo nếp niangao", above: true, portable: true, example: { zh: "吃年糕,象征一年比一年高。", vi: "Ăn bánh niangao tượng trưng cho năm sau hơn năm trước." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "papercuts", term: "窗花", gloss: "hoa giấy cắt dán cửa sổ", above: true, portable: true, example: { zh: "奶奶剪了很多窗花。", vi: "Bà cắt rất nhiều hoa giấy dán cửa sổ." }, x: 67, y: 50, w: 5.5, stand: { x: 67, y: 74 } },
    { id: "sunflowerseeds", term: "瓜子", gloss: "hạt dưa", above: true, portable: true, example: { zh: "大家一边嗑瓜子一边看电视。", vi: "Mọi người vừa cắn hạt dưa vừa xem tivi." }, x: 74, y: 50, w: 5.5, stand: { x: 74, y: 74 } },
    { id: "chineseknot", term: "中国结", gloss: "nút thắt Trung Hoa", above: true, portable: true, example: { zh: "墙上挂着红色的中国结。", vi: "Trên tường treo nút thắt Trung Hoa màu đỏ." }, x: 81, y: 50, w: 4, stand: { x: 81, y: 74 } },
    { id: "roundtable", term: "圆桌", gloss: "bàn tròn", example: { zh: "全家人围坐在圆桌旁。", vi: "Cả nhà ngồi quanh bàn tròn." }, x: 44, y: 80, w: 13 },
    { id: "kumquat", term: "金桔树", gloss: "cây quất", example: { zh: "客厅里摆着一盆金桔树。", vi: "Phòng khách đặt một chậu cây quất." }, x: 56, y: 94, w: 8 },
    { id: "newyearpic", term: "年画", gloss: "tranh Tết", wall: true, example: { zh: "门边贴着一张胖娃娃年画。", vi: "Cạnh cửa dán một bức tranh Tết em bé mũm mĩm." }, x: 50, y: 44, w: 7, stand: { x: 50, y: 70 } },
    { id: "redlantern", term: "红灯笼", gloss: "đèn lồng đỏ", wall: true, example: { zh: "门口挂着两个红灯笼。", vi: "Trước cửa treo hai chiếc đèn lồng đỏ." }, x: 12, y: 42, w: 8, stand: { x: 12, y: 70 } },
  ],
};
