import type { SceneDef } from "../explore-types";

/** Bệnh viện: giường bệnh, bàn thuốc và đồ dùng khám bệnh. Câu ví dụ tự viết, đơn giản, đủ dùng khi đi khám. */
export const HOSPITAL_SCENE: SceneDef = {
  id: "hospital",
  title: "Bệnh viện",
  subtitle: "Đi quanh phòng khám, học từ về thuốc và đồ y tế rồi làm nhiệm vụ cho Bác sĩ Cáo.",
  theme: "hospital",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Công viên", to: "park", x: 7, y: 58, w: 6 },
    { sprite: "exit", label: "Sang Trường học", to: "school", x: 90, y: 66, w: 6 },
  ],
  npc: {
    id: "fox", name: "Bác sĩ Cáo", x: 90, y: 93, w: 9,
    greeting: "Chào mừng đến phòng khám! Hãy đi quanh phòng, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Đi quanh phòng và ghé vài chỗ nhé!",
  },
  decor: [
    { sprite: "table", x: 31, y: 80, w: 26 },
    { sprite: "table", x: 66, y: 80, w: 26 },
  ],
  phrases: [
    { zh: "我不舒服。", vi: "Tôi thấy không khỏe." },
    { zh: "我头疼,还发烧了。", vi: "Tôi đau đầu và còn bị sốt." },
    { zh: "请问,挂号处在哪儿?", vi: "Xin hỏi, quầy đăng ký khám ở đâu?" },
    { zh: "多喝水,好好休息。", vi: "Uống nhiều nước, nghỉ ngơi cho tốt." },
  ],
  objects: [
    { id: "medicine", term: "药", gloss: "thuốc", above: true, portable: true, example: { zh: "请按时吃药。", vi: "Xin hãy uống thuốc đúng giờ." }, x: 58, y: 63, w: 4.4, stand: { x: 58, y: 88 } },
    { id: "thermometer", term: "体温计", gloss: "nhiệt kế", above: true, portable: true, example: { zh: "我用体温计量体温。", vi: "Tôi dùng nhiệt kế đo thân nhiệt." }, x: 65, y: 63, w: 6.5, stand: { x: 65, y: 88 } },
    { id: "mask", term: "口罩", gloss: "khẩu trang", above: true, portable: true, example: { zh: "请戴口罩。", vi: "Xin hãy đeo khẩu trang." }, x: 72, y: 63, w: 6.5, stand: { x: 72, y: 88 } },
    { id: "hospitalbed", term: "病床", gloss: "giường bệnh", example: { zh: "病人躺在病床上。", vi: "Bệnh nhân nằm trên giường bệnh." }, x: 78, y: 56, w: 22 },
    { id: "chart", term: "病历", gloss: "bệnh án", above: true, portable: true, example: { zh: "这是你的病历。", vi: "Đây là bệnh án của bạn." }, x: 79, y: 63, w: 5, stand: { x: 79, y: 88 } },
    { id: "stethoscope", term: "听诊器", gloss: "ống nghe", portable: true, example: { zh: "医生用听诊器听心跳。", vi: "Bác sĩ dùng ống nghe để nghe nhịp tim." }, x: 50, y: 92, w: 6 },
    { id: "wheelchair", term: "轮椅", gloss: "xe lăn", example: { zh: "他坐在轮椅上。", vi: "Anh ấy ngồi trên xe lăn." }, x: 14, y: 90, w: 9 },
    { id: "bandage", term: "绷带", gloss: "băng gạc", portable: true, example: { zh: "请用绷带包一下。", vi: "Xin hãy băng lại bằng gạc." }, x: 22, y: 94, w: 6 },
    { id: "drip", term: "输液瓶", gloss: "bình truyền dịch", example: { zh: "他在用输液瓶打点滴。", vi: "Anh ấy đang truyền dịch bằng bình truyền." }, x: 93, y: 46, w: 3.5 },
  ],
};
