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
  phrases: [
    { zh: "你好,我是新同事。", vi: "Xin chào, tôi là đồng nghiệp mới." },
    { zh: "请问,会议几点开始?", vi: "Xin hỏi, mấy giờ họp bắt đầu?" },
    { zh: "请把文件发给我。", vi: "Xin gửi tài liệu cho tôi." },
    { zh: "辛苦了!", vi: "Anh/chị vất vả rồi!" },
  ],
  objects: [
    { id: "laptop", term: "电脑", gloss: "máy tính", above: true, portable: true, example: { zh: "我用电脑工作。", vi: "Tôi làm việc bằng máy tính." }, x: 14, y: 64, w: 8, stand: { x: 14, y: 87 } },
    { id: "phone", term: "手机", gloss: "điện thoại", above: true, portable: true, example: { zh: "请关手机。", vi: "Xin hãy tắt điện thoại." }, x: 22, y: 64, w: 3.4, stand: { x: 22, y: 87 } },
    { id: "printer", term: "打印机", gloss: "máy in", above: true, example: { zh: "打印机坏了。", vi: "Máy in hỏng rồi." }, x: 56, y: 64, w: 9, stand: { x: 56, y: 87 } },
    { id: "document", term: "文件", gloss: "tài liệu", above: true, portable: true, example: { zh: "这个文件很重要。", vi: "Tài liệu này rất quan trọng." }, x: 65, y: 64, w: 5.5, stand: { x: 65, y: 87 } },
    { id: "stapler", term: "订书机", gloss: "cái dập ghim", above: true, portable: true, example: { zh: "请借我订书机。", vi: "Cho tôi mượn cái dập ghim." }, x: 28, y: 64, w: 5, stand: { x: 28, y: 87 } },
    { id: "folder", term: "文件夹", gloss: "cặp hồ sơ", above: true, portable: true, example: { zh: "文件在文件夹里。", vi: "Tài liệu ở trong cặp hồ sơ." }, x: 72, y: 64, w: 6, stand: { x: 72, y: 87 } },
    { id: "calculator", term: "计算器", gloss: "máy tính bỏ túi", portable: true, example: { zh: "请用计算器算一下。", vi: "Xin hãy tính bằng máy tính bỏ túi." }, x: 40, y: 94, w: 4.5 },
    { id: "namecard", term: "名片", gloss: "danh thiếp", portable: true, example: { zh: "这是我的名片。", vi: "Đây là danh thiếp của tôi." }, x: 50, y: 94, w: 5.5 },
    { id: "whiteboard", wall: true, term: "白板", gloss: "bảng trắng", example: { zh: "白板上有今天的计划。", vi: "Trên bảng trắng có kế hoạch hôm nay." }, x: 28, y: 27, w: 16 },
    { id: "meetingtable", term: "会议桌", gloss: "bàn họp", example: { zh: "大家在会议桌旁开会。", vi: "Mọi người họp quanh bàn họp." }, x: 78, y: 90, w: 18 },
    { id: "desklamp", term: "台灯", gloss: "đèn bàn", example: { zh: "请打开台灯。", vi: "Xin hãy bật đèn bàn." }, x: 92, y: 50, w: 5 },
    { id: "waterdispenser", term: "饮水机", gloss: "máy nước uống", example: { zh: "饮水机在走廊里。", vi: "Máy nước uống ở hành lang." }, x: 90, y: 80, w: 5.5 },
    { id: "mouse", term: "鼠标", gloss: "con chuột máy tính", above: true, portable: true, example: { zh: "我的鼠标没电了。", vi: "Chuột máy tính của tôi hết pin rồi." }, x: 32, y: 64, w: 3, stand: { x: 32, y: 87 } },
    { id: "keyboard", term: "键盘", gloss: "bàn phím", portable: true, example: { zh: "请别把水倒在键盘上。", vi: "Đừng đổ nước lên bàn phím." }, x: 20, y: 94, w: 9 },
  ],
};
