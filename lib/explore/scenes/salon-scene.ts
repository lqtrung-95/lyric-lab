import type { SceneDef } from "../explore-types";

/** Hiệu cắt tóc: ghế cắt, kéo lược, đồ chăm sóc tóc. Câu ví dụ tự viết, đơn giản, dùng được khi cắt tóc. */
export const SALON_SCENE: SceneDef = {
  id: "salon",
  title: "Hiệu cắt tóc",
  subtitle: "Ghé hiệu cắt tóc, học từ về làm tóc rồi làm nhiệm vụ cho Cô Mèo thợ tóc.",
  theme: "salon",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Phòng gym", to: "gym", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Bưu điện", to: "postoffice", x: 92, y: 60, w: 6 }],
  npc: {
    id: "cat", name: "Cô Mèo thợ tóc", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến hiệu cắt tóc! Hãy ngồi chơi, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我想剪头发。", vi: "Tôi muốn cắt tóc." },
    { zh: "请剪短一点。", vi: "Xin cắt ngắn đi một chút." },
    { zh: "我想烫头发,还想染发。", vi: "Tôi muốn uốn tóc và nhuộm tóc." },
    { zh: "这样可以吗?", vi: "Như thế này được không?" },
  ],
  objects: [
    { id: "scissors", term: "剪刀", gloss: "cái kéo", above: true, portable: true, example: { zh: "理发师用剪刀剪头发。", vi: "Thợ tóc cắt tóc bằng kéo." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "comb", term: "梳子", gloss: "cái lược", above: true, portable: true, example: { zh: "请用梳子梳一下。", vi: "Xin hãy chải bằng lược." }, x: 28, y: 48, w: 7, stand: { x: 28, y: 70 } },
    { id: "razor", term: "剃刀", gloss: "dao cạo", above: true, portable: true, example: { zh: "剃刀很锋利。", vi: "Dao cạo rất sắc." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "hairbrush", term: "发刷", gloss: "bàn chải tóc", above: true, portable: true, example: { zh: "发刷在桌子上。", vi: "Bàn chải tóc ở trên bàn." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "conditioner", term: "护发素", gloss: "dầu xả", above: true, portable: true, example: { zh: "洗完头要用护发素。", vi: "Gội đầu xong phải dùng dầu xả." }, x: 60, y: 50, w: 3.5, stand: { x: 60, y: 74 } },
    { id: "hairspray", term: "发胶", gloss: "keo xịt tóc", above: true, portable: true, example: { zh: "喷一点发胶。", vi: "Xịt một chút keo tóc." }, x: 67, y: 50, w: 3.5, stand: { x: 67, y: 74 } },
    { id: "clippers", term: "推子", gloss: "tông đơ", above: true, portable: true, example: { zh: "他用推子剃了光头。", vi: "Anh ấy cạo trọc đầu bằng tông đơ." }, x: 74, y: 50, w: 4, stand: { x: 74, y: 74 } },
    { id: "hairpin", term: "发夹", gloss: "kẹp tóc", above: true, portable: true, example: { zh: "她戴着一个粉色的发夹。", vi: "Cô ấy cài một chiếc kẹp tóc màu hồng." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "salonchair", term: "理发椅", gloss: "ghế cắt tóc", example: { zh: "请坐在理发椅上。", vi: "Mời ngồi lên ghế cắt tóc." }, x: 44, y: 80, w: 9 },
    { id: "cape", term: "围布", gloss: "tấm choàng cắt tóc", portable: true, example: { zh: "先围上围布。", vi: "Hãy choàng tấm choàng cắt tóc trước." }, x: 56, y: 94, w: 8 },
    { id: "wig", term: "假发", gloss: "tóc giả", portable: true, example: { zh: "这顶假发很自然。", vi: "Bộ tóc giả này rất tự nhiên." }, x: 84, y: 76, w: 7 },
    { id: "rubberband", term: "皮筋", gloss: "dây thun buộc tóc", portable: true, example: { zh: "请给我一根皮筋。", vi: "Cho tôi một sợi dây thun." }, x: 30, y: 92, w: 4 },
  ],
};
