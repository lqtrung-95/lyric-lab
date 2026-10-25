import type { SceneDef } from "../explore-types";

/** Công viên: cây, ghế dài, chim, chó và đồ chơi ngoài trời. Câu ví dụ tự viết, đơn giản. */
export const PARK_SCENE: SceneDef = {
  id: "cong-vien",
  title: "Công viên",
  subtitle: "Đi dạo công viên, học từ về cây cối, thú cưng và đồ chơi rồi làm nhiệm vụ cho Cụ Rùa.",
  theme: "park",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Nhà ga", to: "nha-ga", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Bệnh viện", to: "benh-vien", x: 90, y: 60, w: 6 },
  ],
  npc: {
    id: "turtle", name: "Cụ Rùa", x: 88, y: 92, w: 9,
    greeting: "Chào bạn nhỏ! Hãy đi dạo công viên, lại gần mọi thứ rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp ta để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Đi dạo thêm vài vòng nhé!",
  },
  objects: [
    { id: "sun", wall: true, term: "太阳", gloss: "mặt trời", example: { zh: "今天的太阳很大。", vi: "Hôm nay nắng rất to." }, x: 80, y: 15, w: 7 },
    { id: "kite", wall: true, portable: true, term: "风筝", gloss: "diều", example: { zh: "孩子在放风筝。", vi: "Em bé đang thả diều." }, x: 55, y: 28, w: 5 },
    { id: "tree", term: "树", gloss: "cây", example: { zh: "公园里有很多树。", vi: "Trong công viên có nhiều cây." }, x: 15, y: 56, w: 13 },
    { id: "bench", term: "长椅", gloss: "ghế dài", example: { zh: "我们坐在长椅上。", vi: "Chúng ta ngồi trên ghế dài." }, x: 40, y: 62, w: 16 },
    { id: "bird", above: true, portable: true, term: "鸟", gloss: "con chim", example: { zh: "树上有一只鸟。", vi: "Trên cây có một con chim." }, x: 36, y: 53, w: 5, stand: { x: 36, y: 68 } },
    { id: "dog", term: "狗", gloss: "con chó", portable: true, example: { zh: "那只狗很可爱。", vi: "Con chó đó rất dễ thương." }, x: 66, y: 76, w: 9 },
    { id: "ball", term: "球", gloss: "quả bóng", portable: true, example: { zh: "他在踢球。", vi: "Cậu ấy đang đá bóng." }, x: 78, y: 90, w: 4.5 },
    { id: "bicycle", term: "自行车", gloss: "xe đạp", example: { zh: "我骑自行车去公园。", vi: "Tôi đạp xe đến công viên." }, x: 28, y: 86, w: 13 },
    { id: "umbrella", term: "雨伞", gloss: "cái ô", portable: true, example: { zh: "下雨了,请带雨伞。", vi: "Trời mưa rồi, hãy mang theo ô." }, x: 58, y: 94, w: 7 },
    { id: "flower", term: "花", gloss: "hoa", portable: true, example: { zh: "公园里的花很漂亮。", vi: "Hoa trong công viên rất đẹp." }, x: 50, y: 82, w: 5 },
    { id: "water", term: "水", gloss: "nước", portable: true, example: { zh: "请喝点水。", vi: "Mời uống chút nước." }, x: 8, y: 90, w: 2.6 },
  ],
};
