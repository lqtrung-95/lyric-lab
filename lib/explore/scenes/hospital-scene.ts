import type { SceneDef } from "../explore-types";

/** Bệnh viện: giường bệnh, bàn thuốc và đồ dùng khám bệnh. Câu ví dụ tự viết, đơn giản, đủ dùng khi đi khám. */
export const HOSPITAL_SCENE: SceneDef = {
  id: "benh-vien",
  title: "Bệnh viện",
  subtitle: "Đi quanh phòng khám, học từ về thuốc và đồ y tế rồi làm nhiệm vụ cho Bác sĩ Cáo.",
  theme: "hospital",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Công viên", to: "cong-vien", x: 7, y: 58, w: 6 }],
  npc: {
    id: "fox", name: "Bác sĩ Cáo", x: 90, y: 93, w: 9,
    greeting: "Chào mừng đến phòng khám! Hãy đi quanh phòng, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Đi quanh phòng và ghé vài chỗ nhé!",
  },
  decor: [
    { sprite: "table", x: 31, y: 80, w: 26 },
    { sprite: "table", x: 66, y: 80, w: 26 },
  ],
  objects: [
    { id: "clock", wall: true, term: "钟", gloss: "đồng hồ", example: { zh: "墙上的钟很大。", vi: "Cái đồng hồ trên tường rất to." }, x: 50, y: 24, w: 6 },
    { id: "bed", term: "床", gloss: "cái giường", example: { zh: "病人躺在床上。", vi: "Bệnh nhân nằm trên giường." }, x: 78, y: 56, w: 22 },
    { id: "lamp", term: "灯", gloss: "đèn", example: { zh: "请开灯。", vi: "Xin hãy bật đèn." }, x: 93, y: 46, w: 5 },
    { id: "chair", term: "椅子", gloss: "cái ghế", example: { zh: "请坐在椅子上。", vi: "Mời ngồi lên ghế." }, x: 50, y: 92, w: 9 },
    { id: "medicine", term: "药", gloss: "thuốc", above: true, portable: true, example: { zh: "请按时吃药。", vi: "Xin hãy uống thuốc đúng giờ." }, x: 58, y: 63, w: 4.4, stand: { x: 58, y: 88 } },
    { id: "thermometer", term: "体温计", gloss: "nhiệt kế", above: true, portable: true, example: { zh: "我用体温计量体温。", vi: "Tôi dùng nhiệt kế đo thân nhiệt." }, x: 65, y: 63, w: 6.5, stand: { x: 65, y: 88 } },
    { id: "mask", term: "口罩", gloss: "khẩu trang", above: true, portable: true, example: { zh: "请戴口罩。", vi: "Xin hãy đeo khẩu trang." }, x: 72, y: 63, w: 6.5, stand: { x: 72, y: 88 } },
    { id: "glasses", term: "眼镜", gloss: "kính", above: true, portable: true, example: { zh: "他戴着眼镜。", vi: "Anh ấy đeo kính." }, x: 79, y: 63, w: 6.5, stand: { x: 79, y: 88 } },
    { id: "flower", term: "花", gloss: "hoa", portable: true, example: { zh: "我给病人买了花。", vi: "Tôi mua hoa cho bệnh nhân." }, x: 14, y: 90, w: 5 },
    { id: "apple", term: "苹果", gloss: "quả táo", portable: true, example: { zh: "病人想吃苹果。", vi: "Bệnh nhân muốn ăn táo." }, x: 22, y: 94, w: 3.2 },
    { id: "water", term: "水", gloss: "nước", portable: true, example: { zh: "多喝水对身体好。", vi: "Uống nhiều nước tốt cho sức khỏe." }, x: 42, y: 94, w: 2.6 },
  ],
};
