import type { SceneDef } from "../explore-types";

/** Chợ đêm: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const NIGHTMARKET_SCENE: SceneDef = {
  id: "nightmarket",
  title: "Chợ đêm",
  subtitle: "Dạo chợ đêm lung linh đèn màu, học từ về đồ ăn vặt rồi làm nhiệm vụ cho Anh Khỉ bán xiên nướng.",
  theme: "nightmarket",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Quán điểm tâm", to: "breakfast", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Trà quán", to: "teahouse", x: 92, y: 60, w: 6 }],
  npc: {
    id: "monkey", name: "Anh Khỉ bán xiên nướng", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến chợ đêm! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "老板,这个多少钱?", vi: "Ông chủ, cái này bao nhiêu tiền?" },
    { zh: "能不能便宜一点?", vi: "Có thể rẻ hơn chút không?" },
    { zh: "不要辣,谢谢。", vi: "Không cay, cảm ơn." },
    { zh: "这里的人真多!", vi: "Ở đây đông người thật!" },
  ],
  objects: [
    { id: "skewer", term: "烤串", gloss: "xiên nướng", above: true, portable: true, example: { zh: "来十个烤串,多放点辣。", vi: "Cho mười xiên nướng, cho thêm chút cay." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "stinkytofu", term: "臭豆腐", gloss: "đậu phụ thối", above: true, portable: true, example: { zh: "臭豆腐闻起来臭,吃起来香。", vi: "Đậu phụ thối ngửi thì thối, ăn lại thơm." }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "tanghulu", term: "糖葫芦", gloss: "mứt quả xiên đường", above: true, portable: true, example: { zh: "孩子们都爱吃糖葫芦。", vi: "Trẻ con ai cũng thích mứt quả xiên." }, x: 35, y: 48, w: 3.5, stand: { x: 35, y: 70 } },
    { id: "friednoodle", term: "炒面", gloss: "mì xào", above: true, portable: true, example: { zh: "这盘炒面是现炒的。", vi: "Đĩa mì xào này mới xào xong." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "sweetpotato", term: "烤红薯", gloss: "khoai lang nướng", above: true, portable: true, example: { zh: "冬天吃烤红薯最暖和。", vi: "Mùa đông ăn khoai lang nướng ấm nhất." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "squid", term: "烤鱿鱼", gloss: "mực nướng", above: true, portable: true, example: { zh: "烤鱿鱼要刷点酱。", vi: "Mực nướng phải phết chút sốt." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "chickencutlet", term: "鸡排", gloss: "gà chiên xù", above: true, portable: true, example: { zh: "这块鸡排比我的脸还大。", vi: "Miếng gà chiên xù này to hơn cả mặt tôi." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "grilledcorn", term: "烤玉米", gloss: "ngô nướng", above: true, portable: true, example: { zh: "烤玉米又甜又香。", vi: "Ngô nướng vừa ngọt vừa thơm." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "bbqgrill", term: "烤炉", gloss: "lò nướng than", example: { zh: "烤炉上的肉串滋滋响。", vi: "Xiên thịt trên lò nướng kêu xèo xèo." }, x: 44, y: 80, w: 12 },
    { id: "pushcart", term: "小推车", gloss: "xe đẩy bán hàng", example: { zh: "小贩推着小推车来了。", vi: "Người bán hàng rong đẩy xe đến rồi." }, x: 56, y: 94, w: 12 },
    { id: "plasticstool", term: "塑料凳", gloss: "ghế nhựa", example: { zh: "大家坐在塑料凳上吃夜宵。", vi: "Mọi người ngồi trên ghế nhựa ăn đêm." }, x: 84, y: 76, w: 6 },
    { id: "stringlights", term: "彩灯", gloss: "đèn màu", wall: true, example: { zh: "夜市里挂满了彩灯。", vi: "Chợ đêm treo đầy đèn màu." }, x: 50, y: 30, w: 22, stand: { x: 50, y: 70 } },
  ],
};
