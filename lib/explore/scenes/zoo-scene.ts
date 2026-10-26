import type { SceneDef } from "../explore-types";

/** Sở thú: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const ZOO_SCENE: SceneDef = {
  id: "zoo",
  title: "Sở thú",
  subtitle: "Đi dạo sở thú, học tên các con vật rồi làm nhiệm vụ cho Cô Cáo nhân viên sở thú.",
  theme: "zoo",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Quán lẩu", to: "hotpot", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Tiệm hoa", to: "flowershop", x: 92, y: 60, w: 6 }],
  npc: {
    id: "fox", name: "Cô Cáo nhân viên", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến sở thú! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我想看大象。", vi: "Tôi muốn xem voi." },
    { zh: "请问熊猫在哪儿?", vi: "Xin hỏi gấu trúc ở đâu?" },
    { zh: "请不要喂动物。", vi: "Xin đừng cho động vật ăn." },
    { zh: "这里可以拍照吗?", vi: "Ở đây được chụp ảnh không?" },
  ],
  objects: [
    { id: "tiger", term: "老虎", gloss: "con hổ", above: true, portable: true, example: { zh: "老虎很大,也很可怕。", vi: "Con hổ rất to, cũng rất đáng sợ." }, x: 21, y: 48, w: 6.5, stand: { x: 21, y: 70 } },
    { id: "elephant", term: "大象", gloss: "con voi", above: true, portable: true, example: { zh: "大象的鼻子很长。", vi: "Cái vòi của voi rất dài." }, x: 28, y: 48, w: 7, stand: { x: 28, y: 70 } },
    { id: "monkey", term: "猴子", gloss: "con khỉ", above: true, portable: true, example: { zh: "猴子爱吃香蕉。", vi: "Khỉ thích ăn chuối." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "lion", term: "狮子", gloss: "sư tử", above: true, portable: true, example: { zh: "狮子是森林里的王。", vi: "Sư tử là vua của khu rừng." }, x: 41, y: 48, w: 6.5, stand: { x: 41, y: 70 } },
    { id: "zebra", term: "斑马", gloss: "ngựa vằn", above: true, portable: true, example: { zh: "斑马身上有黑白条纹。", vi: "Trên người ngựa vằn có sọc đen trắng." }, x: 60, y: 50, w: 5.5, stand: { x: 60, y: 74 } },
    { id: "penguin", term: "企鹅", gloss: "chim cánh cụt", above: true, portable: true, example: { zh: "企鹅走路摇摇摆摆。", vi: "Chim cánh cụt đi lạch bạch." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "pandaanimal", term: "熊猫", gloss: "gấu trúc", above: true, portable: true, example: { zh: "熊猫每天吃很多竹子。", vi: "Gấu trúc mỗi ngày ăn rất nhiều tre." }, x: 74, y: 50, w: 5.5, stand: { x: 74, y: 74 } },
    { id: "telescope", term: "望远镜", gloss: "ống nhòm", above: true, portable: true, example: { zh: "用望远镜可以看得很远。", vi: "Dùng ống nhòm có thể nhìn rất xa." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "giraffe", term: "长颈鹿", gloss: "hươu cao cổ", example: { zh: "长颈鹿的脖子最长。", vi: "Cổ của hươu cao cổ dài nhất." }, x: 44, y: 80, w: 6 },
    { id: "cage", term: "笼子", gloss: "cái lồng", example: { zh: "鸟在笼子里唱歌。", vi: "Chim hót trong lồng." }, x: 56, y: 94, w: 7 },
    { id: "zooticket", term: "门票", gloss: "vé vào cửa", portable: true, example: { zh: "门票一张五十块。", vi: "Vé vào cửa năm mươi tệ một tấm." }, x: 84, y: 76, w: 5 },
    { id: "feed", term: "饲料", gloss: "thức ăn chăn nuôi", portable: true, example: { zh: "工作人员正在拿饲料。", vi: "Nhân viên đang lấy thức ăn cho thú." }, x: 30, y: 92, w: 5.5 },
  ],
};
