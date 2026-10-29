import type { SceneDef } from "../explore-types";

/** Phòng khám Đông y: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const TCM_SCENE: SceneDef = {
  id: "tcm",
  title: "Phòng khám Đông y",
  subtitle: "Đến phòng khám Đông y, học từ về thuốc và châm cứu rồi làm nhiệm vụ cho Cụ Rùa thầy thuốc.",
  theme: "tcm",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Trà quán", to: "teahouse", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Lớp thư pháp", to: "calligraphy", x: 92, y: 60, w: 6 }],
  npc: {
    id: "turtle", name: "Cụ Rùa thầy thuốc", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến phòng khám Đông y! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "伸出舌头,我看一看。", vi: "Thè lưỡi ra, tôi xem." },
    { zh: "这服药一天喝两次。", vi: "Thang thuốc này một ngày uống hai lần." },
    { zh: "多喝热水,早点休息。", vi: "Uống nhiều nước ấm, nghỉ ngơi sớm." },
    { zh: "药有点苦。", vi: "Thuốc hơi đắng." },
  ],
  objects: [
    { id: "ginseng", term: "人参", gloss: "nhân sâm", above: true, portable: true, example: { zh: "这根人参已经长了很多年。", vi: "Củ nhân sâm này đã mọc nhiều năm." }, x: 21, y: 48, w: 4.5, stand: { x: 21, y: 70 } },
    { id: "goji", term: "枸杞", gloss: "kỷ tử", above: true, portable: true, example: { zh: "泡茶的时候放几颗枸杞。", vi: "Pha trà thì cho vài quả kỷ tử." }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "herbs", term: "中药", gloss: "thuốc Đông y", above: true, portable: true, example: { zh: "这服中药要煎半个小时。", vi: "Thang thuốc Đông y này phải sắc nửa tiếng." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "acuneedle", term: "银针", gloss: "kim bạc châm cứu", above: true, portable: true, example: { zh: "医生用银针扎在穴位上。", vi: "Thầy thuốc dùng kim bạc châm vào huyệt." }, x: 41, y: 48, w: 6.5, stand: { x: 41, y: 70 } },
    { id: "moxa", term: "艾条", gloss: "điếu ngải cứu", above: true, portable: true, example: { zh: "点上艾条,身体暖暖的。", vi: "Đốt điếu ngải lên, người ấm áp hẳn." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "cupping", term: "火罐", gloss: "ống giác hơi", above: true, portable: true, example: { zh: "拔火罐以后背上有红印。", vi: "Giác hơi xong trên lưng có vết đỏ." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "pulsepillow", term: "脉枕", gloss: "gối bắt mạch", above: true, portable: true, example: { zh: "请把手放在脉枕上。", vi: "Mời đặt tay lên gối bắt mạch." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "herbscale", term: "药秤", gloss: "cân thuốc", above: true, portable: true, example: { zh: "药师用药秤称药材。", vi: "Dược sĩ dùng cân thuốc cân dược liệu." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "herbstove", term: "药炉", gloss: "lò sắc thuốc", example: { zh: "药炉上的药正在煮。", vi: "Thuốc trên lò sắc đang đun." }, x: 44, y: 80, w: 10 },
    { id: "herbpot", term: "药罐", gloss: "nồi sắc thuốc", example: { zh: "药罐里冒出苦苦的香味。", vi: "Trong nồi sắc bốc ra mùi thuốc đắng đắng." }, x: 56, y: 94, w: 8 },
    { id: "meridianchart", term: "经络图", gloss: "hình kinh lạc", wall: true, example: { zh: "墙上挂着一张经络图。", vi: "Trên tường treo một tấm hình kinh lạc." }, x: 50, y: 40, w: 7, stand: { x: 50, y: 70 } },
    { id: "diagdesk", term: "诊桌", gloss: "bàn khám bệnh", example: { zh: "医生坐在诊桌后面。", vi: "Thầy thuốc ngồi sau bàn khám." }, x: 30, y: 92, w: 13 },
  ],
};
