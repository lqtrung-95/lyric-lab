import type { SceneDef } from "../explore-types";

/** Bưu điện: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const POSTOFFICE_SCENE: SceneDef = {
  id: "postoffice",
  title: "Bưu điện",
  subtitle: "Ghé bưu điện, học từ về gửi thư và gửi hàng rồi làm nhiệm vụ cho Bác Thỏ bưu tá.",
  theme: "postoffice",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Hiệu cắt tóc", to: "salon", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Hiệu thuốc", to: "pharmacy", x: 92, y: 60, w: 6 }],
  npc: {
    id: "rabbit", name: "Bác Thỏ bưu tá", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến bưu điện! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我想寄一个包裹。", vi: "Tôi muốn gửi một bưu kiện." },
    { zh: "寄到北京要几天?", vi: "Gửi đến Bắc Kinh mất mấy ngày?" },
    { zh: "请填一下快递单。", vi: "Xin điền phiếu gửi hàng." },
    { zh: "请问哪里有邮筒?", vi: "Xin hỏi hòm thư ở đâu?" },
  ],
  objects: [
    { id: "envelope", term: "信封", gloss: "phong bì", above: true, portable: true, example: { zh: "请给我两个信封。", vi: "Cho tôi hai cái phong bì." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "postage", term: "邮票", gloss: "tem thư", above: true, portable: true, example: { zh: "信封上要贴一张邮票。", vi: "Trên phong bì phải dán một con tem." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "postcard", term: "明信片", gloss: "bưu thiếp", above: true, portable: true, example: { zh: "我给朋友寄了一张明信片。", vi: "Tôi gửi cho bạn một tấm bưu thiếp." }, x: 35, y: 48, w: 6.5, stand: { x: 35, y: 70 } },
    { id: "tape", term: "胶带", gloss: "băng keo", above: true, portable: true, example: { zh: "用胶带把盒子封好。", vi: "Dùng băng keo dán kín cái hộp." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "waybill", term: "快递单", gloss: "phiếu gửi hàng", above: true, portable: true, example: { zh: "先填快递单,再付钱。", vi: "Điền phiếu gửi hàng trước rồi trả tiền." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "label", term: "标签", gloss: "nhãn", above: true, portable: true, example: { zh: "请在包裹上贴标签。", vi: "Xin dán nhãn lên bưu kiện." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "mail", term: "信件", gloss: "thư từ", above: true, portable: true, example: { zh: "今天有三封信件。", vi: "Hôm nay có ba lá thư." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "postscale", term: "邮件秤", gloss: "cân bưu kiện", above: true, portable: true, example: { zh: "先把包裹放在邮件秤上。", vi: "Hãy đặt bưu kiện lên cân trước." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "mailbox", term: "邮筒", gloss: "hòm thư công cộng", example: { zh: "信放进邮筒里了。", vi: "Thư đã bỏ vào hòm thư rồi." }, x: 44, y: 80, w: 6 },
    { id: "parcel", term: "包裹", gloss: "bưu kiện", portable: true, example: { zh: "这个包裹很重。", vi: "Bưu kiện này rất nặng." }, x: 56, y: 94, w: 8 },
    { id: "mailbag", term: "邮袋", gloss: "túi thư", portable: true, example: { zh: "邮递员背着一个大邮袋。", vi: "Người đưa thư đeo một chiếc túi thư to." }, x: 84, y: 76, w: 7 },
    { id: "pobox", term: "信箱", gloss: "hộp thư", example: { zh: "我家门口有一个信箱。", vi: "Trước cửa nhà tôi có một hộp thư." }, x: 30, y: 92, w: 6 },
  ],
};
