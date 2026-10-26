import type { SceneDef } from "../explore-types";

/** Bảo tàng: tranh, tượng, bình hoa và băng ghế ngắm tranh. Câu ví dụ tự viết, đơn giản, dùng được khi đi tham quan. */
export const MUSEUM_SCENE: SceneDef = {
  id: "museum",
  title: "Bảo tàng",
  subtitle: "Tham quan bảo tàng yên tĩnh, học từ về tranh, tượng và vé rồi làm nhiệm vụ cho Cô Cú giám đốc.",
  theme: "museum",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Nhà bếp", to: "kitchen", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Ngân hàng", to: "bank", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "owl", name: "Cô Cú giám đốc", x: 90, y: 93, w: 9,
    greeting: "Chào mừng đến bảo tàng! Hãy đi nhẹ, lại gần tác phẩm rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp cô để nhận nhiệm vụ nhé.",
    notReady: "Em cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  phrases: [
    { zh: "请问,展览几点开门?", vi: "Xin hỏi, triển lãm mấy giờ mở cửa?" },
    { zh: "这幅画很有名。", vi: "Bức tranh này rất nổi tiếng." },
    { zh: "请不要触摸展品。", vi: "Xin đừng chạm vào hiện vật." },
    { zh: "我想租一个讲解器。", vi: "Tôi muốn thuê một máy thuyết minh." },
  ],
  objects: [
    { id: "painting", wall: true, term: "画", gloss: "bức tranh", example: { zh: "这幅画很漂亮。", vi: "Bức tranh này rất đẹp." }, x: 34, y: 31, w: 16 },
    { id: "statue", term: "雕像", gloss: "bức tượng", example: { zh: "这座雕像很有名。", vi: "Bức tượng này rất nổi tiếng." }, x: 18, y: 72, w: 9 },
    { id: "vase", term: "花瓶", gloss: "bình hoa", portable: true, example: { zh: "花瓶里有花。", vi: "Trong bình có hoa." }, x: 40, y: 74, w: 6 },
    { id: "fossil", term: "化石", gloss: "hóa thạch", portable: true, example: { zh: "这块化石有一亿年。", vi: "Hóa thạch này một trăm triệu năm tuổi." }, x: 44, y: 94, w: 7 },
    { id: "scroll", term: "卷轴", gloss: "cuộn tranh", portable: true, example: { zh: "墙上挂着一幅卷轴。", vi: "Trên tường treo một cuộn tranh." }, x: 30, y: 92, w: 8 },
    { id: "armor", term: "盔甲", gloss: "bộ giáp", example: { zh: "古代战士穿盔甲。", vi: "Chiến binh xưa mặc giáp." }, x: 64, y: 78, w: 7 },
    { id: "showcase", term: "展柜", gloss: "tủ trưng bày", example: { zh: "玉器放在展柜里。", vi: "Đồ ngọc đặt trong tủ trưng bày." }, x: 22, y: 94, w: 10 },
    { id: "audioguide", term: "讲解器", gloss: "máy thuyết minh", portable: true, example: { zh: "请租一个讲解器。", vi: "Xin hãy thuê một máy thuyết minh." }, x: 64, y: 90, w: 3.5, stand: { x: 64, y: 86 } },
    { id: "exhibitboard", wall: true, term: "展板", gloss: "bảng triển lãm", example: { zh: "展板上有介绍。", vi: "Trên bảng triển lãm có phần giới thiệu." }, x: 76, y: 26, w: 12 },
    { id: "dinosaur", term: "恐龙", gloss: "khủng long", example: { zh: "这是一只恐龙的骨架。", vi: "Đây là bộ xương của một con khủng long." }, x: 80, y: 70, w: 18 },
    { id: "barrier", term: "围栏", gloss: "hàng rào chắn", example: { zh: "请不要越过围栏。", vi: "Xin đừng vượt qua hàng rào chắn." }, x: 50, y: 58, w: 14 },
    { id: "lantern", wall: true, term: "灯笼", gloss: "đèn lồng", example: { zh: "墙上挂着红灯笼。", vi: "Trên tường treo đèn lồng đỏ." }, x: 90, y: 34, w: 4.5 },
    { id: "ancientcoin", term: "古币", gloss: "đồng tiền cổ", portable: true, example: { zh: "这是一枚古币。", vi: "Đây là một đồng tiền cổ." }, x: 10, y: 86, w: 3.5 },
  ],
};
