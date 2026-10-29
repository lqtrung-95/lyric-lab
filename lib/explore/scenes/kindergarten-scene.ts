import type { SceneDef } from "../explore-types";

/** Trường mẫu giáo: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const KINDERGARTEN_SCENE: SceneDef = {
  id: "kindergarten",
  title: "Trường mẫu giáo",
  subtitle: "Vào trường mẫu giáo đầy màu sắc, học từ về đồ chơi và giờ học của bé rồi làm nhiệm vụ cho Cô Mèo giáo viên.",
  theme: "kindergarten",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Cửa hàng tiện lợi", to: "convenience", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Ký túc xá", to: "dormitory", x: 92, y: 60, w: 6 }],
  npc: {
    id: "cat", name: "Cô Mèo giáo viên mẫu giáo", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến trường mẫu giáo! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "小朋友们,排好队!", vi: "Các bạn nhỏ, xếp hàng nào!" },
    { zh: "现在是午睡时间。", vi: "Bây giờ là giờ ngủ trưa." },
    { zh: "谁想听故事?", vi: "Ai muốn nghe kể chuyện nào?" },
    { zh: "做得真棒,奖励一张贴纸!", vi: "Giỏi lắm, thưởng một hình dán!" },
  ],
  objects: [
    { id: "playdough", term: "彩泥", gloss: "đất nặn màu", above: true, portable: true, example: { zh: "他用彩泥捏了一只小兔子。", vi: "Bé dùng đất nặn màu nặn một chú thỏ." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "crayons", term: "蜡笔", gloss: "bút sáp màu", above: true, portable: true, example: { zh: "她用蜡笔画了一个大太阳。", vi: "Cô bé dùng bút sáp màu vẽ một mặt trời to." }, x: 28, y: 48, w: 5, stand: { x: 28, y: 70 } },
    { id: "bib", term: "围兜", gloss: "yếm ăn", above: true, portable: true, example: { zh: "宝宝吃饭要戴围兜。", vi: "Em bé ăn cơm phải đeo yếm." }, x: 35, y: 48, w: 5, stand: { x: 35, y: 70 } },
    { id: "napmat", term: "午睡垫", gloss: "nệm ngủ trưa", above: true, portable: true, example: { zh: "小朋友们躺在午睡垫上。", vi: "Các bạn nhỏ nằm trên nệm ngủ trưa." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "littlechair", term: "小椅子", gloss: "ghế nhỏ", above: true, portable: true, example: { zh: "孩子们搬着自己的小椅子。", vi: "Bọn trẻ bê chiếc ghế nhỏ của mình." }, x: 60, y: 50, w: 4.5, stand: { x: 60, y: 74 } },
    { id: "picturebook", term: "绘本", gloss: "sách tranh", above: true, portable: true, example: { zh: "老师给我们讲了一本绘本。", vi: "Cô giáo kể cho chúng tôi nghe một cuốn sách tranh." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "sticker", term: "贴纸", gloss: "hình dán", above: true, portable: true, example: { zh: "做对了就奖励一张贴纸。", vi: "Làm đúng thì thưởng một hình dán." }, x: 74, y: 50, w: 4.5, stand: { x: 74, y: 74 } },
    { id: "waterCup", term: "水杯", gloss: "cốc nước", above: true, portable: true, example: { zh: "每个小朋友都有自己的水杯。", vi: "Bạn nhỏ nào cũng có cốc nước riêng." }, x: 81, y: 50, w: 4, stand: { x: 81, y: 74 } },
    { id: "slide", term: "攀爬架", gloss: "khung leo trèo", example: { zh: "小朋友们排队玩攀爬架。", vi: "Các bạn nhỏ xếp hàng chơi khung leo trèo." }, x: 44, y: 80, w: 12 },
    { id: "seesaw", term: "跷跷板", gloss: "bập bênh", example: { zh: "两个孩子在玩跷跷板。", vi: "Hai đứa trẻ đang chơi bập bênh." }, x: 56, y: 94, w: 11 },
    { id: "sandpit", term: "沙坑", gloss: "hố cát", example: { zh: "他在沙坑里堆了一座小山。", vi: "Bé đắp một ngọn đồi nhỏ trong hố cát." }, x: 84, y: 76, w: 9 },
    { id: "cubby", term: "储物格", gloss: "ngăn đựng đồ của bé", example: { zh: "书包要放进自己的储物格。", vi: "Cặp sách phải để vào ngăn đồ của mình." }, x: 30, y: 92, w: 8 },
  ],
};
