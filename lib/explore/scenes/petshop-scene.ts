import type { SceneDef } from "../explore-types";

/** Tiệm thú cưng: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const PETSHOP_SCENE: SceneDef = {
  id: "petshop",
  title: "Tiệm thú cưng",
  subtitle: "Ghé tiệm thú cưng, học từ về chăm sóc thú nuôi rồi làm nhiệm vụ cho Bé Sóc chủ tiệm.",
  theme: "petshop",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Nhà kính", to: "greenhouse", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Tiệm may", to: "tailor", x: 92, y: 60, w: 6 }],
  npc: {
    id: "squirrel", name: "Bé Sóc chủ tiệm thú cưng", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến tiệm thú cưng! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "请给小狗拴上牵引绳。", vi: "Hãy buộc dây dắt cho chú chó." },
    { zh: "小猫每天都要吃两次。", vi: "Con mèo mỗi ngày phải ăn hai bữa." },
    { zh: "鱼缸里的水要常换。", vi: "Nước trong bể cá phải thay thường xuyên." },
    { zh: "这只仓鼠很怕生。", vi: "Chú chuột hamster này rất nhát người lạ." },
  ],
  objects: [
    { id: "dogfood", term: "狗粮", gloss: "thức ăn cho chó", above: true, portable: true, example: { zh: "这袋狗粮够吃一个月。", vi: "Túi thức ăn này đủ cho chó ăn một tháng." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "leash", term: "牵引绳", gloss: "dây dắt", above: true, portable: true, example: { zh: "出门遛狗要拉好牵引绳。", vi: "Ra ngoài dắt chó phải giữ chắc dây dắt." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "collar", term: "项圈", gloss: "vòng cổ", above: true, portable: true, example: { zh: "小狗的项圈是蓝色的。", vi: "Vòng cổ của chú chó màu xanh." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "catlitter", term: "猫砂", gloss: "cát vệ sinh cho mèo", above: true, portable: true, example: { zh: "猫砂盆要每天打扫。", vi: "Khay cát mèo phải dọn mỗi ngày." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "teaser", term: "逗猫棒", gloss: "cần câu mèo", above: true, portable: true, example: { zh: "小猫最喜欢追逗猫棒。", vi: "Mèo con thích đuổi theo cần câu nhất." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "hamster", term: "仓鼠", gloss: "chuột hamster", above: true, portable: true, example: { zh: "仓鼠晚上很活泼。", vi: "Chuột hamster buổi tối rất hoạt bát." }, x: 67, y: 50, w: 5.5, stand: { x: 67, y: 74 } },
    { id: "cage", term: "鸟笼", gloss: "lồng chim", above: true, portable: true, example: { zh: "鸟笼挂在窗户旁边。", vi: "Lồng chim treo cạnh cửa sổ." }, x: 74, y: 50, w: 5.5, stand: { x: 74, y: 74 } },
    { id: "fishfood", term: "鱼食", gloss: "thức ăn cho cá", above: true, portable: true, example: { zh: "每天只放一点鱼食。", vi: "Mỗi ngày chỉ cho một ít thức ăn cho cá." }, x: 81, y: 50, w: 4.5, stand: { x: 81, y: 74 } },
    { id: "fishtank", term: "鱼缸", gloss: "bể cá", example: { zh: "鱼缸里有五条金鱼。", vi: "Trong bể cá có năm con cá vàng." }, x: 44, y: 80, w: 16 },
    { id: "cattree", term: "猫爬架", gloss: "cây cho mèo leo", example: { zh: "小猫在猫爬架上睡觉。", vi: "Mèo con ngủ trên cây leo." }, x: 56, y: 94, w: 9 },
    { id: "petbowl", term: "食盆", gloss: "bát ăn của thú cưng", portable: true, example: { zh: "食盆里有干净的水。", vi: "Trong bát ăn có nước sạch." }, x: 84, y: 76, w: 6 },
    { id: "petcarrier", term: "宠物包", gloss: "túi vận chuyển thú cưng", portable: true, example: { zh: "带猫去医院要用宠物包。", vi: "Đưa mèo đi bệnh viện phải dùng túi vận chuyển." }, x: 30, y: 92, w: 8 },
  ],
};
