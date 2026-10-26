import type { SceneDef } from "../explore-types";

/** Công viên: cây, ghế dài, chim, chó và đồ chơi ngoài trời. Câu ví dụ tự viết, đơn giản. */
export const PARK_SCENE: SceneDef = {
  id: "park",
  title: "Công viên",
  subtitle: "Đi dạo công viên, học từ về cây cối, thú cưng và đồ chơi rồi làm nhiệm vụ cho Cụ Rùa.",
  theme: "park",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Nhà ga", to: "station", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Bệnh viện", to: "hospital", x: 90, y: 60, w: 6 },
  ],
  npc: {
    id: "turtle", name: "Cụ Rùa", x: 88, y: 92, w: 9,
    greeting: "Chào bạn nhỏ! Hãy đi dạo công viên, lại gần mọi thứ rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp ta để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Đi dạo thêm vài vòng nhé!",
  },
  phrases: [
    { zh: "今天天气真好!", vi: "Hôm nay trời đẹp thật!" },
    { zh: "我们去散步吧。", vi: "Chúng ta đi dạo nhé." },
    { zh: "请不要踩草地。", vi: "Xin đừng giẫm lên cỏ." },
    { zh: "我们在这儿拍张照吧。", vi: "Chúng ta chụp một tấm ảnh ở đây nhé." },
  ],
  objects: [
    { id: "tree", term: "树", gloss: "cây", example: { zh: "公园里有很多树。", vi: "Trong công viên có nhiều cây." }, x: 15, y: 56, w: 13 },
    { id: "bench", term: "长椅", gloss: "ghế dài", example: { zh: "我们坐在长椅上。", vi: "Chúng ta ngồi trên ghế dài." }, x: 40, y: 62, w: 16 },
    { id: "bird", term: "鸟", gloss: "con chim", above: true, portable: true, example: { zh: "树上有一只鸟。", vi: "Trên cây có một con chim." }, x: 36, y: 53, w: 5, stand: { x: 36, y: 68 } },
    { id: "dog", term: "狗", gloss: "con chó", portable: true, example: { zh: "那只狗很可爱。", vi: "Con chó đó rất dễ thương." }, x: 66, y: 76, w: 9 },
    { id: "bicycle", term: "自行车", gloss: "xe đạp", example: { zh: "我骑自行车去公园。", vi: "Tôi đạp xe đến công viên." }, x: 28, y: 86, w: 13 },
    { id: "kite", wall: true, term: "风筝", gloss: "diều", portable: true, example: { zh: "孩子在放风筝。", vi: "Em bé đang thả diều." }, x: 55, y: 28, w: 5 },
    { id: "umbrella", term: "雨伞", gloss: "cái ô", portable: true, example: { zh: "下雨了,请带雨伞。", vi: "Trời mưa rồi, hãy mang theo ô." }, x: 58, y: 94, w: 7 },
    { id: "squirrel", term: "松鼠", gloss: "con sóc", portable: true, example: { zh: "树上有一只松鼠。", vi: "Trên cây có một con sóc." }, x: 78, y: 90, w: 7 },
    { id: "fountain", term: "喷泉", gloss: "đài phun nước", example: { zh: "公园中间有一个喷泉。", vi: "Giữa công viên có một đài phun nước." }, x: 50, y: 82, w: 10 },
    { id: "pavilion", term: "亭子", gloss: "cái đình", example: { zh: "我们在亭子里休息。", vi: "Chúng tôi nghỉ trong đình." }, x: 70, y: 58, w: 14 },
    { id: "pond", term: "池塘", gloss: "cái ao", example: { zh: "池塘里有很多鱼。", vi: "Trong ao có nhiều cá." }, x: 76, y: 88, w: 12 },
  ],
};
