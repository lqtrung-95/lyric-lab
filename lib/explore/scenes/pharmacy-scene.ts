import type { SceneDef } from "../explore-types";

/** Hiệu thuốc: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const PHARMACY_SCENE: SceneDef = {
  id: "pharmacy",
  title: "Hiệu thuốc",
  subtitle: "Ghé hiệu thuốc, học từ về thuốc và đồ sơ cứu rồi làm nhiệm vụ cho Cô Cáo dược sĩ.",
  theme: "pharmacy",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Bưu điện", to: "postoffice", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Cửa hàng điện thoại", to: "phoneshop", x: 92, y: 60, w: 6 }],
  npc: {
    id: "fox", name: "Cô Cáo dược sĩ", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến hiệu thuốc! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我头疼,有药吗?", vi: "Tôi đau đầu, có thuốc không?" },
    { zh: "一天吃三次,饭后吃。", vi: "Một ngày uống ba lần, sau bữa ăn." },
    { zh: "这个药有副作用吗?", vi: "Thuốc này có tác dụng phụ không?" },
    { zh: "请给我一盒创可贴。", vi: "Cho tôi một hộp băng cá nhân." },
  ],
  objects: [
    { id: "pills", term: "药片", gloss: "viên thuốc", above: true, portable: true, example: { zh: "每次吃两片药片。", vi: "Mỗi lần uống hai viên thuốc." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "syrup", term: "药水", gloss: "thuốc nước", above: true, portable: true, example: { zh: "小孩喜欢甜甜的药水。", vi: "Trẻ con thích thuốc nước ngọt." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "bandaid", term: "创可贴", gloss: "băng cá nhân", above: true, portable: true, example: { zh: "手破了,贴一个创可贴。", vi: "Tay bị xước, dán một miếng băng cá nhân." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "ointment", term: "药膏", gloss: "thuốc mỡ", above: true, portable: true, example: { zh: "晚上涂一点药膏。", vi: "Buổi tối bôi một ít thuốc mỡ." }, x: 41, y: 48, w: 3.5, stand: { x: 41, y: 70 } },
    { id: "eyedrops", term: "眼药水", gloss: "thuốc nhỏ mắt", above: true, portable: true, example: { zh: "眼睛干,可以滴眼药水。", vi: "Mắt khô thì có thể nhỏ thuốc nhỏ mắt." }, x: 60, y: 50, w: 3.5, stand: { x: 60, y: 74 } },
    { id: "swab", term: "棉签", gloss: "tăm bông", above: true, portable: true, example: { zh: "用棉签擦一下伤口。", vi: "Dùng tăm bông lau vết thương một chút." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "vitamin", term: "维生素", gloss: "vitamin", above: true, portable: true, example: { zh: "我每天吃维生素。", vi: "Mỗi ngày tôi uống vitamin." }, x: 74, y: 50, w: 5, stand: { x: 74, y: 74 } },
    { id: "disinfectant", term: "消毒水", gloss: "nước sát trùng", above: true, portable: true, example: { zh: "先用消毒水洗一洗。", vi: "Rửa bằng nước sát trùng trước." }, x: 81, y: 50, w: 4.5, stand: { x: 81, y: 74 } },
    { id: "medcabinet", term: "药柜", gloss: "tủ thuốc", example: { zh: "药都放在药柜里。", vi: "Thuốc đều để trong tủ thuốc." }, x: 44, y: 80, w: 9 },
    { id: "firstaid", term: "急救箱", gloss: "hộp sơ cứu", portable: true, example: { zh: "家里应该有一个急救箱。", vi: "Trong nhà nên có một hộp sơ cứu." }, x: 56, y: 94, w: 8 },
    { id: "prescription", term: "药方", gloss: "đơn thuốc", portable: true, example: { zh: "医生给我开了药方。", vi: "Bác sĩ kê cho tôi đơn thuốc." }, x: 84, y: 76, w: 5 },
    { id: "handwash", term: "洗手液", gloss: "nước rửa tay", portable: true, example: { zh: "饭前要用洗手液洗手。", vi: "Trước khi ăn phải rửa tay bằng nước rửa tay." }, x: 30, y: 92, w: 4 },
  ],
};
