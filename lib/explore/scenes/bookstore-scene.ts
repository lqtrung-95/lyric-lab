import type { SceneDef } from "../explore-types";

/** Hiệu sách: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const BOOKSTORE_SCENE: SceneDef = {
  id: "bookstore",
  title: "Hiệu sách",
  subtitle: "Vào hiệu sách, học từ về sách và đồ dùng viết rồi làm nhiệm vụ cho Cụ Cú chủ hiệu.",
  theme: "bookstore",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Quán cà phê", to: "cafe", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Hồ bơi", to: "pool", x: 92, y: 60, w: 6 }],
  npc: {
    id: "owl", name: "Cụ Cú chủ hiệu sách", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến hiệu sách! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "请问有没有这本书?", vi: "Xin hỏi có cuốn sách này không?" },
    { zh: "这本书多少钱?", vi: "Cuốn sách này bao nhiêu tiền?" },
    { zh: "我想买一本笔记本。", vi: "Tôi muốn mua một cuốn sổ tay." },
    { zh: "请到收银台付钱。", vi: "Xin ra quầy thu ngân thanh toán." },
  ],
  objects: [
    { id: "novel", term: "小说", gloss: "tiểu thuyết", above: true, portable: true, example: { zh: "这本小说我昨晚一口气看完了。", vi: "Tôi đọc một mạch hết cuốn tiểu thuyết này tối qua." }, x: 21, y: 48, w: 5.5, stand: { x: 21, y: 70 } },
    { id: "comic", term: "漫画", gloss: "truyện tranh", above: true, portable: true, example: { zh: "弟弟最喜欢看漫画。", vi: "Em trai thích đọc truyện tranh nhất." }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "fairytale", term: "童话", gloss: "truyện cổ tích", above: true, portable: true, example: { zh: "妈妈每晚给我讲一个童话。", vi: "Mẹ kể cho tôi một truyện cổ tích mỗi tối." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "cookbook", term: "食谱", gloss: "sách nấu ăn", above: true, portable: true, example: { zh: "我照着食谱做了一个蛋糕。", vi: "Tôi làm theo sách nấu ăn để làm một cái bánh." }, x: 41, y: 48, w: 5.5, stand: { x: 41, y: 70 } },
    { id: "calendar", term: "日历", gloss: "lịch", above: true, portable: true, example: { zh: "日历上圈出了他的生日。", vi: "Trên lịch khoanh ngày sinh nhật của anh." }, x: 60, y: 50, w: 5.5, stand: { x: 60, y: 74 } },
    { id: "stickynotes", term: "便利贴", gloss: "giấy nhớ", above: true, portable: true, example: { zh: "他把电话号码写在便利贴上。", vi: "Anh viết số điện thoại lên giấy nhớ." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "fountainpen", term: "钢笔", gloss: "bút máy", above: true, portable: true, example: { zh: "爷爷用钢笔写字,字很漂亮。", vi: "Ông viết bằng bút máy, chữ rất đẹp." }, x: 74, y: 50, w: 3.5, stand: { x: 74, y: 74 } },
    { id: "journal", term: "笔记本", gloss: "sổ tay", above: true, portable: true, example: { zh: "我在笔记本上记下新学的词。", vi: "Tôi ghi từ mới học vào sổ tay." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "cashdesk", term: "收银台", gloss: "quầy thu ngân", example: { zh: "请到收银台付钱。", vi: "Xin ra quầy thu ngân thanh toán." }, x: 44, y: 80, w: 12 },
    { id: "bookpile", term: "书堆", gloss: "chồng sách", portable: true, example: { zh: "桌上的书堆越来越高,快要倒了。", vi: "Chồng sách trên bàn càng lúc càng cao, sắp đổ rồi." }, x: 56, y: 94, w: 8 },
    { id: "revolveshelf", term: "旋转书架", gloss: "giá sách xoay", example: { zh: "旋转书架上全是新书。", vi: "Giá sách xoay toàn sách mới." }, x: 84, y: 76, w: 8 },
    { id: "readlamp", term: "阅读灯", gloss: "đèn đọc sách", portable: true, example: { zh: "我打开阅读灯,安静地看书。", vi: "Tôi bật đèn đọc sách, yên tĩnh đọc." }, x: 30, y: 92, w: 5 },
  ],
};
