import type { SceneDef } from "../explore-types";

/** Nông trại: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const FARM_SCENE: SceneDef = {
  id: "farm",
  title: "Nông trại",
  subtitle: "Ra nông trại, học tên con vật và nông sản rồi làm nhiệm vụ cho Cô Chim chủ trại.",
  theme: "farm",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Công viên giải trí", to: "funfair", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Tiệm giặt là", to: "laundry", x: 92, y: 60, w: 6 }],
  npc: {
    id: "bird", name: "Cô Chim chủ trại", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến nông trại! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "早上要喂鸡。", vi: "Buổi sáng phải cho gà ăn." },
    { zh: "今年的麦子长得很好。", vi: "Lúa mì năm nay lớn rất tốt." },
    { zh: "别靠近那匹马。", vi: "Đừng lại gần con ngựa đó." },
    { zh: "农场里空气真好。", vi: "Không khí ở nông trại thật trong lành." },
  ],
  objects: [
    { id: "wheat", term: "麦子", gloss: "lúa mì", above: true, portable: true, example: { zh: "麦子黄了,可以收割了。", vi: "Lúa mì chín vàng, có thể gặt rồi." }, x: 21, y: 48, w: 4, stand: { x: 21, y: 70 } },
    { id: "pumpkin", term: "南瓜", gloss: "quả bí ngô", above: true, portable: true, example: { zh: "秋天可以收南瓜。", vi: "Mùa thu có thể thu hoạch bí ngô." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "hay", term: "干草", gloss: "cỏ khô", above: true, portable: true, example: { zh: "牛在吃干草。", vi: "Bò đang ăn cỏ khô." }, x: 35, y: 48, w: 6.5, stand: { x: 35, y: 70 } },
    { id: "hen", term: "母鸡", gloss: "gà mái", above: true, portable: true, example: { zh: "母鸡每天下一个蛋。", vi: "Gà mái mỗi ngày đẻ một quả trứng." }, x: 41, y: 48, w: 5.5, stand: { x: 41, y: 70 } },
    { id: "sheep", term: "绵羊", gloss: "cừu", above: true, portable: true, example: { zh: "绵羊的毛很软。", vi: "Lông cừu rất mềm." }, x: 60, y: 50, w: 6.5, stand: { x: 60, y: 74 } },
    { id: "cow", term: "奶牛", gloss: "bò sữa", above: true, portable: true, example: { zh: "奶牛每天产很多奶。", vi: "Bò sữa mỗi ngày cho rất nhiều sữa." }, x: 67, y: 50, w: 7, stand: { x: 67, y: 74 } },
    { id: "scarecrow", term: "稻草人", gloss: "bù nhìn rơm", above: true, portable: true, example: { zh: "稻草人站在田里。", vi: "Bù nhìn rơm đứng giữa ruộng." }, x: 74, y: 50, w: 5, stand: { x: 74, y: 74 } },
    { id: "fence", term: "篱笆", gloss: "hàng rào", above: true, portable: true, example: { zh: "羊都在篱笆里面。", vi: "Cừu đều ở trong hàng rào." }, x: 81, y: 50, w: 7, stand: { x: 81, y: 74 } },
    { id: "tractor", term: "拖拉机", gloss: "máy kéo", example: { zh: "农夫开着拖拉机去田里。", vi: "Bác nông dân lái máy kéo ra ruộng." }, x: 44, y: 80, w: 12 },
    { id: "horse", term: "马", gloss: "con ngựa", example: { zh: "这匹马跑得很快。", vi: "Con ngựa này chạy rất nhanh." }, x: 56, y: 94, w: 9 },
    { id: "barn", term: "谷仓", gloss: "kho thóc", example: { zh: "粮食都放在谷仓里。", vi: "Lương thực đều để trong kho thóc." }, x: 84, y: 76, w: 11 },
    { id: "windmill", term: "风车", gloss: "cối xay gió", example: { zh: "风吹来,风车就转起来。", vi: "Gió thổi tới, cối xay gió liền quay." }, x: 30, y: 92, w: 7 },
  ],
};
