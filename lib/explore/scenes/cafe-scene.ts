import type { SceneDef } from "../explore-types";

/** Quán cà phê: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const CAFE_SCENE: SceneDef = {
  id: "cafe",
  title: "Quán cà phê",
  subtitle: "Ghé quán cà phê, học từ về đồ uống và bánh ngọt rồi làm nhiệm vụ cho Cô Mèo pha chế.",
  theme: "cafe",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Phòng thí nghiệm", to: "lab", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Hiệu sách", to: "bookstore", x: 92, y: 60, w: 6 }],
  npc: {
    id: "cat", name: "Cô Mèo pha chế", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến quán cà phê! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我要一杯热拿铁。", vi: "Tôi muốn một ly latte nóng." },
    { zh: "请问可以外带吗?", vi: "Xin hỏi có mang đi được không?" },
    { zh: "可以加一点糖浆吗?", vi: "Có thể thêm một chút siro không?" },
    { zh: "这里的蛋糕很好吃。", vi: "Bánh ở đây rất ngon." },
  ],
  objects: [
    { id: "latte", term: "拿铁", gloss: "cà phê sữa latte", above: true, portable: true, example: { zh: "我想要一杯热拿铁。", vi: "Tôi muốn một ly latte nóng." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "coffeebeans", term: "咖啡豆", gloss: "hạt cà phê", above: true, portable: true, example: { zh: "这种咖啡豆是从云南来的。", vi: "Loại hạt cà phê này đến từ Vân Nam." }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "espressomachine", term: "咖啡机", gloss: "máy pha cà phê", above: true, portable: true, example: { zh: "咖啡机一开,整家店都是香味。", vi: "Máy pha cà phê vừa bật, cả quán thơm lừng." }, x: 35, y: 48, w: 9, stand: { x: 35, y: 70 } },
    { id: "milkfoam", term: "奶泡", gloss: "bọt sữa", above: true, portable: true, example: { zh: "拿铁上面有一层白白的奶泡。", vi: "Phía trên ly latte có một lớp bọt sữa trắng." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "syrupbottle", term: "糖浆", gloss: "siro", above: true, portable: true, example: { zh: "你要不要加一点糖浆?", vi: "Bạn có muốn thêm một chút siro không?" }, x: 60, y: 50, w: 4.5, stand: { x: 60, y: 74 } },
    { id: "tiramisu", term: "提拉米苏", gloss: "bánh tiramisu", above: true, portable: true, example: { zh: "提拉米苏是我最爱吃的甜点。", vi: "Tiramisu là món tráng miệng tôi thích nhất." }, x: 67, y: 50, w: 6.5, stand: { x: 67, y: 74 } },
    { id: "macaron", term: "马卡龙", gloss: "bánh macaron", above: true, portable: true, example: { zh: "粉色的马卡龙又香又甜。", vi: "Bánh macaron màu hồng vừa thơm vừa ngọt." }, x: 74, y: 50, w: 5.5, stand: { x: 74, y: 74 } },
    { id: "togocup", term: "外带杯", gloss: "cốc mang đi", above: true, portable: true, example: { zh: "请给我一个外带杯,我要带走。", vi: "Cho tôi một cốc mang đi, tôi sẽ mang đi." }, x: 81, y: 50, w: 4.5, stand: { x: 81, y: 74 } },
    { id: "barcounter", term: "吧台", gloss: "quầy bar", example: { zh: "咖啡师在吧台后面做咖啡。", vi: "Người pha chế đang làm cà phê sau quầy bar." }, x: 44, y: 80, w: 13 },
    { id: "barstool", term: "高脚凳", gloss: "ghế cao", portable: true, example: { zh: "小孩坐不上这么高的高脚凳。", vi: "Trẻ con không ngồi lên nổi chiếc ghế cao thế này." }, x: 56, y: 94, w: 6 },
    { id: "pastrycase", term: "点心柜", gloss: "tủ bánh ngọt", example: { zh: "点心柜里有很多漂亮的蛋糕。", vi: "Trong tủ bánh có rất nhiều bánh đẹp." }, x: 84, y: 76, w: 9 },
    { id: "potplant", term: "盆栽", gloss: "chậu cây cảnh", portable: true, example: { zh: "窗边的盆栽长得很好。", vi: "Chậu cây cảnh bên cửa sổ lớn rất tốt." }, x: 30, y: 92, w: 6 },
  ],
};
