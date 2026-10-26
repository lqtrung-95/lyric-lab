import type { SceneDef } from "../explore-types";

/** Tiệm hoa: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const FLOWERSHOP_SCENE: SceneDef = {
  id: "flowershop",
  title: "Tiệm hoa",
  subtitle: "Ghé tiệm hoa, học tên các loài hoa rồi làm nhiệm vụ cho Cô Mèo chủ tiệm.",
  theme: "flowershop",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Sở thú", to: "zoo", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Tiệm sửa xe", to: "garage", x: 92, y: 60, w: 6 }],
  npc: {
    id: "cat", name: "Cô Mèo chủ tiệm", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến tiệm hoa! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我想买一束花。", vi: "Tôi muốn mua một bó hoa." },
    { zh: "这是送给妈妈的。", vi: "Cái này tặng mẹ." },
    { zh: "请帮我包一下。", vi: "Xin gói giúp tôi." },
    { zh: "这些花要天天浇水。", vi: "Những bông hoa này phải tưới nước mỗi ngày." },
  ],
  objects: [
    { id: "rose", term: "玫瑰", gloss: "hoa hồng", above: true, portable: true, example: { zh: "他送了我一朵玫瑰。", vi: "Anh ấy tặng tôi một đóa hoa hồng." }, x: 21, y: 48, w: 4.5, stand: { x: 21, y: 70 } },
    { id: "tulip", term: "郁金香", gloss: "hoa tulip", above: true, portable: true, example: { zh: "春天郁金香开了。", vi: "Mùa xuân hoa tulip nở." }, x: 28, y: 48, w: 4, stand: { x: 28, y: 70 } },
    { id: "sunflower", term: "向日葵", gloss: "hoa hướng dương", above: true, portable: true, example: { zh: "向日葵总是朝着太阳。", vi: "Hoa hướng dương luôn hướng về mặt trời." }, x: 35, y: 48, w: 5, stand: { x: 35, y: 70 } },
    { id: "lily", term: "百合", gloss: "hoa bách hợp", above: true, portable: true, example: { zh: "百合的味道很香。", vi: "Hoa bách hợp có mùi rất thơm." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "seeds", term: "种子", gloss: "hạt giống", above: true, portable: true, example: { zh: "春天要种种子。", vi: "Mùa xuân phải gieo hạt giống." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "ribbon", term: "彩带", gloss: "dải ruy băng", above: true, portable: true, example: { zh: "礼物上有一条红彩带。", vi: "Trên món quà có một dải ruy băng đỏ." }, x: 67, y: 50, w: 5.5, stand: { x: 67, y: 74 } },
    { id: "greetcard", term: "贺卡", gloss: "thiệp chúc mừng", above: true, portable: true, example: { zh: "请在贺卡上写几句话。", vi: "Xin viết vài câu lên thiệp chúc mừng." }, x: 74, y: 50, w: 5, stand: { x: 74, y: 74 } },
    { id: "trowel", term: "铲子", gloss: "cái xẻng nhỏ", above: true, portable: true, example: { zh: "用铲子把土挖开。", vi: "Dùng xẻng nhỏ xới đất lên." }, x: 81, y: 50, w: 3.5, stand: { x: 81, y: 74 } },
    { id: "bouquet", term: "花束", gloss: "bó hoa", portable: true, example: { zh: "这个花束送给你。", vi: "Bó hoa này tặng bạn." }, x: 44, y: 80, w: 7 },
    { id: "flowerpot", term: "花盆", gloss: "chậu hoa", portable: true, example: { zh: "花盆放在窗台上。", vi: "Chậu hoa đặt trên bệ cửa sổ." }, x: 56, y: 94, w: 6 },
    { id: "wateringcan", term: "浇水壶", gloss: "bình tưới nước", portable: true, example: { zh: "请用浇水壶给花浇水。", vi: "Hãy dùng bình tưới nước tưới hoa." }, x: 84, y: 76, w: 8 },
    { id: "cactus", term: "仙人掌", gloss: "cây xương rồng", portable: true, example: { zh: "仙人掌不用天天浇水。", vi: "Cây xương rồng không cần tưới mỗi ngày." }, x: 30, y: 92, w: 5.5 },
  ],
};
