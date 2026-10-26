import type { SceneDef } from "../explore-types";

/** Quán lẩu: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const HOTPOT_SCENE: SceneDef = {
  id: "hotpot",
  title: "Quán lẩu",
  subtitle: "Ghé quán lẩu, học tên nguyên liệu và đồ ăn rồi làm nhiệm vụ cho Ông Rùa chủ quán.",
  theme: "hotpot",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Cửa hàng điện thoại", to: "phoneshop", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Sở thú", to: "zoo", x: 92, y: 60, w: 6 }],
  npc: {
    id: "turtle", name: "Ông Rùa chủ quán", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến quán lẩu! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我们要一个火锅。", vi: "Chúng tôi gọi một nồi lẩu." },
    { zh: "不要太辣。", vi: "Đừng cay quá." },
    { zh: "再来一盘肉。", vi: "Cho thêm một đĩa thịt." },
    { zh: "买单!", vi: "Tính tiền!" },
  ],
  objects: [
    { id: "meatslice", term: "肉片", gloss: "thịt thái lát", above: true, portable: true, example: { zh: "肉片煮一分钟就好。", vi: "Thịt thái lát nhúng một phút là chín." }, x: 21, y: 48, w: 6.5, stand: { x: 21, y: 70 } },
    { id: "mushroom", term: "蘑菇", gloss: "nấm", above: true, portable: true, example: { zh: "蘑菇吃起来很香。", vi: "Nấm ăn rất thơm." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "cabbage", term: "白菜", gloss: "cải thảo", above: true, portable: true, example: { zh: "白菜要最后放。", vi: "Cải thảo phải cho vào sau cùng." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "meatball", term: "丸子", gloss: "viên", above: true, portable: true, example: { zh: "这些丸子是牛肉做的。", vi: "Những viên này làm bằng thịt bò." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "vermicelli", term: "粉丝", gloss: "miến", above: true, portable: true, example: { zh: "粉丝很容易煮熟。", vi: "Miến rất dễ chín." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "shrimp", term: "虾", gloss: "tôm", above: true, portable: true, example: { zh: "今天的虾很新鲜。", vi: "Tôm hôm nay rất tươi." }, x: 67, y: 50, w: 5.5, stand: { x: 67, y: 74 } },
    { id: "corn", term: "玉米", gloss: "bắp ngô", above: true, portable: true, example: { zh: "玉米放进汤里很甜。", vi: "Ngô cho vào nước lẩu rất ngọt." }, x: 74, y: 50, w: 3.5, stand: { x: 74, y: 74 } },
    { id: "dip", term: "蘸料", gloss: "nước chấm", above: true, portable: true, example: { zh: "我的蘸料里有香菜。", vi: "Nước chấm của tôi có rau mùi." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "hotpot", term: "火锅", gloss: "nồi lẩu", example: { zh: "天冷的时候,大家爱吃火锅。", vi: "Trời lạnh, mọi người thích ăn lẩu." }, x: 44, y: 80, w: 14 },
    { id: "strainer", term: "漏勺", gloss: "muôi lọc", portable: true, example: { zh: "请用漏勺捞一下。", vi: "Xin dùng muôi lọc vớt lên." }, x: 56, y: 94, w: 5 },
    { id: "beer", term: "啤酒", gloss: "bia", portable: true, example: { zh: "爸爸点了一瓶啤酒。", vi: "Bố gọi một chai bia." }, x: 84, y: 76, w: 5 },
    { id: "plumdrink", term: "酸梅汤", gloss: "nước ô mai", portable: true, example: { zh: "吃火锅要喝酸梅汤。", vi: "Ăn lẩu phải uống nước ô mai." }, x: 30, y: 92, w: 5 },
  ],
};
