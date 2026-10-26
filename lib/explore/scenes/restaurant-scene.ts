import type { SceneDef } from "../explore-types";

/**
 * Cảnh thứ hai: quán ăn Trung Hoa. 14 từ đồ ăn thức uống, phần lớn HSK 1–2, đặt trên kệ, hai bàn và quầy. Câu ví dụ tự viết, đơn giản, dùng ngay được.
 * Đồ đặt trên đồ khác (`above`) có điểm đứng `stand` ngay trước bàn/quầy/kệ.
 */
export const EATERY_SCENE: SceneDef = {
  id: "restaurant",
  title: "Quán ăn",
  subtitle: "Đi quanh quán ăn Trung Hoa, học tên đồ ăn thức uống rồi làm nhiệm vụ cho Bếp trưởng Gấu.",
  theme: "eatery",
  start: { x: 50, y: 94 },
  exits: [
    { sprite: "exitLeft", label: "Về Phòng của bạn", to: "room", x: 11, y: 56, w: 6 },
    { sprite: "exit", label: "Sang Chợ", to: "market", x: 92, y: 58, w: 6 },
  ],
  npc: {
    id: "chef", name: "Bếp trưởng Gấu", x: 90, y: 92, w: 10,
    greeting: "Chào mừng đến quán của mình! Hãy đi quanh quán, lại gần đồ ăn thức uống rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Ghé thăm vài món trên bàn và trên quầy nhé!",
  },
  decor: [
    { sprite: "shelf", x: 50, y: 33, w: 30 },
    { sprite: "table", x: 22, y: 76, w: 26 },
    { sprite: "table", x: 52, y: 86, w: 30 },
    { sprite: "counter", x: 75, y: 60, w: 26 },
  ],
  phrases: [
    { zh: "请给我菜单。", vi: "Cho tôi xem thực đơn." },
    { zh: "我要一碗面条。", vi: "Tôi muốn một bát mì." },
    { zh: "很好吃!", vi: "Ngon quá!" },
    { zh: "买单!", vi: "Tính tiền!" },
  ],
  objects: [
    { id: "noodles", term: "面条", gloss: "mì sợi", above: true, portable: true, example: { zh: "他爱吃面条。", vi: "Anh ấy thích ăn mì." }, x: 16, y: 59.5, w: 8, stand: { x: 16, y: 82 } },
    { id: "rice", term: "米饭", gloss: "cơm", above: true, portable: true, example: { zh: "我想吃米饭。", vi: "Tôi muốn ăn cơm." }, x: 23.5, y: 59.5, w: 7, stand: { x: 23.5, y: 82 } },
    { id: "chopsticks", term: "筷子", gloss: "đũa", above: true, portable: true, example: { zh: "请给我一双筷子。", vi: "Cho tôi một đôi đũa." }, x: 30, y: 59.5, w: 6.5, stand: { x: 30, y: 82 } },
    { id: "soup", term: "汤", gloss: "canh, súp", above: true, portable: true, example: { zh: "今天的汤很热。", vi: "Món canh hôm nay rất nóng." }, x: 62, y: 70, w: 6.5, stand: { x: 62, y: 92 } },
    { id: "tea", term: "茶", gloss: "trà", above: true, portable: true, example: { zh: "我喜欢喝茶。", vi: "Tôi thích uống trà." }, x: 50, y: 70, w: 6.5, stand: { x: 50, y: 92 } },
    { id: "menu", term: "菜单", gloss: "thực đơn", above: true, portable: true, example: { zh: "请给我菜单。", vi: "Cho tôi xem thực đơn." }, x: 75, y: 44.5, w: 5.5, stand: { x: 75, y: 66 } },
    { id: "bowl", term: "碗", gloss: "cái bát", above: true, portable: true, example: { zh: "请给我一个碗。", vi: "Cho tôi một cái bát." }, x: 42, y: 26.5, w: 6, stand: { x: 42, y: 42 } },
    { id: "spoon", term: "勺子", gloss: "cái thìa", above: true, portable: true, example: { zh: "请给我一把勺子。", vi: "Cho tôi một cái thìa." }, x: 50, y: 26.5, w: 6, stand: { x: 50, y: 42 } },
    { id: "plate", term: "盘子", gloss: "cái đĩa", above: true, portable: true, example: { zh: "盘子里有菜。", vi: "Trong đĩa có món ăn." }, x: 59, y: 26.5, w: 7, stand: { x: 59, y: 42 } },
    { id: "dumpling", term: "饺子", gloss: "sủi cảo", above: true, portable: true, example: { zh: "我想吃饺子。", vi: "Tôi muốn ăn sủi cảo." }, x: 42.5, y: 70, w: 6.5, stand: { x: 42.5, y: 92 } },
    { id: "bill", term: "账单", gloss: "hóa đơn", above: true, portable: true, example: { zh: "请给我账单。", vi: "Cho tôi hóa đơn." }, x: 56.5, y: 70, w: 4.5, stand: { x: 56.5, y: 92 } },
    { id: "napkin", term: "餐巾", gloss: "khăn ăn", above: true, portable: true, example: { zh: "请给我一张餐巾。", vi: "Cho tôi một tờ khăn ăn." }, x: 67.5, y: 70, w: 5.5, stand: { x: 67.5, y: 92 } },
    { id: "teapot", term: "茶壶", gloss: "ấm trà", above: true, portable: true, example: { zh: "茶壶里有热茶。", vi: "Trong ấm có trà nóng." }, x: 82, y: 44.5, w: 6, stand: { x: 82, y: 66 } },
  ],
};
