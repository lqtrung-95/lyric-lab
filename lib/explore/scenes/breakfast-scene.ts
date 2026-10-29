import type { SceneDef } from "../explore-types";

/** Quán điểm tâm: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const BREAKFAST_SCENE: SceneDef = {
  id: "breakfast",
  title: "Quán điểm tâm",
  subtitle: "Ghé quán điểm tâm buổi sáng, học từ về đồ ăn sáng rồi làm nhiệm vụ cho Cô Heo bán điểm tâm.",
  theme: "breakfast",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Công trường", to: "construction", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Chợ đêm", to: "nightmarket", x: 92, y: 60, w: 6 }],
  npc: {
    id: "pig", name: "Cô Heo bán điểm tâm", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến quán điểm tâm! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "来两个包子,一杯豆浆。", vi: "Cho hai cái bánh bao và một ly sữa đậu nành." },
    { zh: "您要甜的还是咸的?", vi: "Bạn muốn ngọt hay mặn?" },
    { zh: "趁热吃吧,凉了就不好吃了。", vi: "Ăn lúc còn nóng đi, nguội rồi sẽ không ngon." },
    { zh: "在这儿吃还是带走?", vi: "Ăn ở đây hay mang đi?" },
  ],
  objects: [
    { id: "baozi", term: "包子", gloss: "bánh bao", above: true, portable: true, example: { zh: "这个包子里面是肉馅。", vi: "Bánh bao này nhân thịt." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "mantou", term: "馒头", gloss: "màn thầu (bánh bao không nhân)", above: true, portable: true, example: { zh: "馒头配咸菜很好吃。", vi: "Màn thầu ăn với dưa muối rất ngon." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "soymilk", term: "豆浆", gloss: "sữa đậu nành", above: true, portable: true, example: { zh: "早上我喜欢喝热豆浆。", vi: "Buổi sáng tôi thích uống sữa đậu nành nóng." }, x: 35, y: 48, w: 4.5, stand: { x: 35, y: 70 } },
    { id: "youtiao", term: "油条", gloss: "quẩy", above: true, portable: true, example: { zh: "油条蘸着豆浆吃。", vi: "Quẩy chấm với sữa đậu nành ăn." }, x: 41, y: 48, w: 6.5, stand: { x: 41, y: 70 } },
    { id: "congee", term: "粥", gloss: "cháo", above: true, portable: true, example: { zh: "这碗粥又热又香。", vi: "Bát cháo này vừa nóng vừa thơm." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "pickles", term: "咸菜", gloss: "dưa muối", above: true, portable: true, example: { zh: "白粥配一点咸菜。", vi: "Cháo trắng ăn kèm chút dưa muối." }, x: 67, y: 50, w: 4.5, stand: { x: 67, y: 74 } },
    { id: "teaegg", term: "茶叶蛋", gloss: "trứng luộc nước trà", above: true, portable: true, example: { zh: "老板,我要一个茶叶蛋。", vi: "Ông chủ, tôi muốn một quả trứng trà." }, x: 74, y: 50, w: 5.5, stand: { x: 74, y: 74 } },
    { id: "papernapkin", term: "餐巾纸", gloss: "khăn giấy", above: true, portable: true, example: { zh: "请给我两张餐巾纸。", vi: "Cho tôi hai tờ khăn giấy." }, x: 81, y: 50, w: 4.5, stand: { x: 81, y: 74 } },
    { id: "steamer", term: "蒸笼", gloss: "xửng hấp", example: { zh: "蒸笼一打开,热气就冒出来。", vi: "Xửng hấp vừa mở, hơi nóng bốc ra." }, x: 44, y: 80, w: 11 },
    { id: "fryer", term: "油锅", gloss: "chảo dầu", example: { zh: "小心,油锅里的油很烫。", vi: "Cẩn thận, dầu trong chảo rất nóng." }, x: 56, y: 94, w: 10 },
    { id: "jianbing", term: "煎饼", gloss: "bánh kếp Trung Hoa", portable: true, example: { zh: "煎饼里可以加鸡蛋。", vi: "Bánh kếp có thể cho thêm trứng." }, x: 84, y: 76, w: 8 },
    { id: "soymachine", term: "豆浆机", gloss: "máy làm sữa đậu nành", example: { zh: "豆浆机每天早上都很忙。", vi: "Máy làm sữa đậu nành sáng nào cũng bận." }, x: 30, y: 92, w: 8 },
  ],
};
