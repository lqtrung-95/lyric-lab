import type { SceneDef } from "../explore-types";

/** Tiệm may: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const TAILOR_SCENE: SceneDef = {
  id: "tailor",
  title: "Tiệm may",
  subtitle: "Vào tiệm may, học từ về may đo quần áo rồi làm nhiệm vụ cho Cô Cừu thợ may.",
  theme: "tailor",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Tiệm thú cưng", to: "petshop", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Tiệm ảnh", to: "photostudio", x: 92, y: 60, w: 6 }],
  npc: {
    id: "sheep", name: "Cô Cừu thợ may", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến tiệm may! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "这件衣服需要改一改。", vi: "Bộ đồ này cần sửa lại một chút." },
    { zh: "请你站好,我给你量尺寸。", vi: "Bạn đứng thẳng, tôi đo số đo cho." },
    { zh: "三天以后可以来取。", vi: "Ba ngày sau có thể đến lấy." },
    { zh: "裤子有点儿长。", vi: "Quần hơi dài một chút." },
  ],
  objects: [
    { id: "needle", term: "缝衣针", gloss: "kim may", above: true, portable: true, example: { zh: "缝衣针很尖,要小心。", vi: "Kim may rất nhọn, phải cẩn thận." }, x: 21, y: 48, w: 5.5, stand: { x: 21, y: 70 } },
    { id: "thread", term: "缝线", gloss: "chỉ may", above: true, portable: true, example: { zh: "这卷缝线是红色的。", vi: "Cuộn chỉ này màu đỏ." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "fabric", term: "布料", gloss: "vải", above: true, portable: true, example: { zh: "这块布料摸起来很软。", vi: "Miếng vải này sờ vào rất mềm." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "button", term: "纽扣", gloss: "cúc áo", above: true, portable: true, example: { zh: "衬衫掉了一颗纽扣。", vi: "Áo sơ mi rụng mất một chiếc cúc." }, x: 41, y: 48, w: 4.5, stand: { x: 41, y: 70 } },
    { id: "zipper", term: "拉链", gloss: "khóa kéo", above: true, portable: true, example: { zh: "裤子的拉链坏了。", vi: "Khóa kéo của quần bị hỏng." }, x: 60, y: 50, w: 3.5, stand: { x: 60, y: 74 } },
    { id: "measuretape", term: "软尺", gloss: "thước dây", above: true, portable: true, example: { zh: "裁缝用软尺量腰围。", vi: "Thợ may dùng thước dây đo vòng eo." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "pattern", term: "纸样", gloss: "mẫu giấy rập", above: true, portable: true, example: { zh: "先画纸样,再剪布。", vi: "Vẽ mẫu giấy rập trước rồi mới cắt vải." }, x: 74, y: 50, w: 5.5, stand: { x: 74, y: 74 } },
    { id: "thimble", term: "顶针", gloss: "cái đê", above: true, portable: true, example: { zh: "缝衣服时手指戴着顶针。", vi: "Lúc may, ngón tay đeo cái đê." }, x: 81, y: 50, w: 4, stand: { x: 81, y: 74 } },
    { id: "sewingbox", term: "针线盒", gloss: "hộp kim chỉ", example: { zh: "妈妈的针线盒里什么都有。", vi: "Trong hộp kim chỉ của mẹ cái gì cũng có." }, x: 44, y: 80, w: 9 },
    { id: "mannequin", term: "人台", gloss: "ma-nơ-canh", example: { zh: "新做的裙子穿在人台上。", vi: "Chiếc váy mới may mặc trên ma-nơ-canh." }, x: 56, y: 94, w: 7 },
    { id: "fittingroom", term: "试衣间", gloss: "phòng thử đồ", example: { zh: "请到试衣间里试一试。", vi: "Mời vào phòng thử đồ mặc thử." }, x: 84, y: 76, w: 8 },
    { id: "chalk", term: "画粉", gloss: "phấn may", portable: true, example: { zh: "裁缝先用画粉做记号。", vi: "Thợ may dùng phấn may đánh dấu trước." }, x: 30, y: 92, w: 5 },
  ],
};
