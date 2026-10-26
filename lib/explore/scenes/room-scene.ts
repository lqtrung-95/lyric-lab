import type { SceneDef } from "../explore-types";

/** Cảnh đầu tiên: phòng của bạn. 14 vật quen thuộc, phần lớn từ HSK 1–2. Câu ví dụ tự viết, đơn giản, dùng ngay được. */
export const ROOM_SCENE: SceneDef = {
  id: "room",
  theme: "room",
  exits: [{ sprite: "exit", label: "Sang Quán ăn", to: "restaurant", x: 89, y: 51, w: 6 }],
  title: "Phòng của bạn",
  subtitle: "Điều khiển Gấu Trúc đi quanh phòng để học từ mới, rồi gặp Cú Thầy nhận nhiệm vụ.",
  npc: {
    id: "owl", name: "Cú Thầy", x: 9, y: 91, w: 9,
    greeting: "Chào bạn, mình là Cú Thầy! Hãy đi quanh phòng, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung của chúng. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Đi quanh phòng và lại gần vài đồ vật nhé!",
  },
  phrases: [
    { zh: "晚安!", vi: "Chúc ngủ ngon!" },
    { zh: "我回家了。", vi: "Con/tôi về nhà rồi." },
    { zh: "请把灯关上。", vi: "Xin hãy tắt đèn." },
    { zh: "我有点累,想睡觉。", vi: "Tôi hơi mệt, muốn đi ngủ." },
  ],
  objects: [
    { id: "window", wall: true, term: "窗户", gloss: "cửa sổ", example: { zh: "请打开窗户。", vi: "Xin hãy mở cửa sổ." }, x: 30, y: 27, w: 16 },
    { id: "tv", term: "电视", gloss: "ti vi", example: { zh: "我们看电视吧。", vi: "Chúng ta xem ti vi nhé." }, x: 56, y: 34, w: 11 },
    { id: "door", term: "门", gloss: "cửa ra vào", example: { zh: "请关门。", vi: "Xin hãy đóng cửa." }, x: 83, y: 36, w: 12.5 },
    { id: "lamp", term: "灯", gloss: "đèn", example: { zh: "请开灯。", vi: "Xin hãy bật đèn." }, x: 8, y: 46, w: 5 },
    { id: "bed", term: "床", gloss: "cái giường", example: { zh: "我的床很大。", vi: "Giường của tôi rất to." }, x: 20, y: 70, w: 22 },
    { id: "table", term: "桌子", gloss: "cái bàn", example: { zh: "桌子上有一本书。", vi: "Trên bàn có một quyển sách." }, x: 58, y: 78, w: 29 },
    { id: "chair", term: "椅子", gloss: "cái ghế", example: { zh: "请坐这把椅子。", vi: "Mời ngồi chiếc ghế này." }, x: 37, y: 86, w: 9 },
    { id: "cat", term: "猫", gloss: "con mèo", portable: true, example: { zh: "那只猫很可爱。", vi: "Con mèo đó rất đáng yêu." }, x: 84, y: 84, w: 8 },
    { id: "flower", term: "花", gloss: "hoa", portable: true, example: { zh: "这朵花很红。", vi: "Bông hoa này rất đỏ." }, x: 92, y: 68, w: 6 },
    { id: "apple", term: "苹果", gloss: "quả táo", portable: true, example: { zh: "我要一个苹果。", vi: "Tôi muốn một quả táo." }, x: 73, y: 90, w: 3.2 },
    { id: "alarmclock", term: "闹钟", gloss: "đồng hồ báo thức", above: true, portable: true, example: { zh: "我的闹钟七点响。", vi: "Đồng hồ báo thức của tôi reo lúc bảy giờ." }, x: 49, y: 59, w: 4.5, stand: { x: 49, y: 86 } },
    { id: "remote", term: "遥控器", gloss: "điều khiển từ xa", above: true, portable: true, example: { zh: "请把遥控器给我。", vi: "Đưa điều khiển cho tôi." }, x: 57.5, y: 58.5, w: 3.5, stand: { x: 57.5, y: 86 } },
    { id: "photoframe", term: "相框", gloss: "khung ảnh", above: true, portable: true, example: { zh: "相框里是我的家人。", vi: "Trong khung ảnh là gia đình tôi." }, x: 65, y: 59, w: 5, stand: { x: 65, y: 86 } },
    { id: "pillow", term: "枕头", gloss: "cái gối", above: true, portable: true, example: { zh: "我的枕头很软。", vi: "Gối của tôi rất mềm." }, x: 13.5, y: 61, w: 5, stand: { x: 14, y: 80 } },
  ],
};

