import type { SceneDef } from "../explore-types";

/** Khu cắm trại: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const CAMPING_SCENE: SceneDef = {
  id: "camping",
  title: "Khu cắm trại",
  subtitle: "Lên khu cắm trại trên núi, học từ về đồ dùng dã ngoại rồi làm nhiệm vụ cho Cô Cáo kiểm lâm.",
  theme: "camping",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Ga tàu điện ngầm", to: "subway", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Phòng thí nghiệm", to: "lab", x: 92, y: 60, w: 6 }],
  npc: {
    id: "fox", name: "Cô Cáo kiểm lâm", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến khu cắm trại! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我们在这里搭帐篷吧。", vi: "Mình dựng lều ở đây nhé." },
    { zh: "天黑以前要生火。", vi: "Phải nhóm lửa trước khi trời tối." },
    { zh: "别忘了带手电筒。", vi: "Đừng quên mang đèn pin." },
    { zh: "今晚我们看星星吧。", vi: "Tối nay mình ngắm sao nhé." },
  ],
  objects: [
    { id: "matches", term: "火柴", gloss: "diêm", above: true, portable: true, example: { zh: "划一根火柴点燃篝火。", vi: "Quẹt một que diêm để đốt lửa trại." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "compass", term: "指南针", gloss: "la bàn", above: true, portable: true, example: { zh: "指南针可以告诉我们方向。", vi: "La bàn có thể cho chúng ta biết phương hướng." }, x: 28, y: 48, w: 5, stand: { x: 28, y: 70 } },
    { id: "flashlight", term: "手电筒", gloss: "đèn pin", above: true, portable: true, example: { zh: "天黑了,请打开手电筒。", vi: "Trời tối rồi, xin bật đèn pin." }, x: 35, y: 48, w: 7, stand: { x: 35, y: 70 } },
    { id: "mosquitocoil", term: "蚊香", gloss: "nhang muỗi", above: true, portable: true, example: { zh: "点一盘蚊香,蚊子就不来了。", vi: "Đốt một cuộn nhang muỗi thì muỗi không đến nữa." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "star", term: "星星", gloss: "ngôi sao", above: true, portable: true, example: { zh: "晚上的星星又多又亮。", vi: "Ban đêm các ngôi sao vừa nhiều vừa sáng." }, x: 60, y: 50, w: 4, stand: { x: 60, y: 74 } },
    { id: "moon", term: "月亮", gloss: "mặt trăng", above: true, portable: true, example: { zh: "今晚的月亮很圆。", vi: "Mặt trăng tối nay rất tròn." }, x: 67, y: 50, w: 4.5, stand: { x: 67, y: 74 } },
    { id: "hikingboot", term: "登山鞋", gloss: "giày leo núi", above: true, portable: true, example: { zh: "爬山要穿登山鞋。", vi: "Leo núi phải đi giày leo núi." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "backpack", term: "背包", gloss: "ba lô", above: true, portable: true, example: { zh: "他的背包里有水和面包。", vi: "Trong ba lô của anh có nước và bánh mì." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "campfire", term: "篝火", gloss: "lửa trại", example: { zh: "大家围着篝火唱歌。", vi: "Mọi người quây quanh lửa trại hát." }, x: 44, y: 80, w: 9 },
    { id: "sleepingbag", term: "睡袋", gloss: "túi ngủ", portable: true, example: { zh: "晚上很冷,我钻进了睡袋。", vi: "Buổi tối rất lạnh, tôi chui vào túi ngủ." }, x: 56, y: 94, w: 9 },
    { id: "foldchair", term: "折叠椅", gloss: "ghế xếp", portable: true, example: { zh: "折叠椅可以放进小包里。", vi: "Ghế xếp có thể bỏ vào chiếc túi nhỏ." }, x: 84, y: 76, w: 7 },
    { id: "grill", term: "烧烤架", gloss: "vỉ nướng", example: { zh: "烧烤架上有香香的肉。", vi: "Trên vỉ nướng có thịt thơm phức." }, x: 30, y: 92, w: 9 },
  ],
};
