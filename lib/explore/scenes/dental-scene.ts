import type { SceneDef } from "../explore-types";

/** Phòng khám nha khoa: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const DENTAL_SCENE: SceneDef = {
  id: "dental",
  title: "Phòng khám nha khoa",
  subtitle: "Đến phòng khám nha khoa, học từ về chăm sóc răng rồi làm nhiệm vụ cho Bác sĩ Voi.",
  theme: "dental",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Tiệm ảnh", to: "photostudio", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Công trường", to: "construction", x: 92, y: 60, w: 6 }],
  npc: {
    id: "elephant", name: "Bác sĩ Voi nha khoa", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến phòng khám nha khoa! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "请张开嘴,啊——", vi: "Xin há miệng ra, a——" },
    { zh: "你每天刷几次牙?", vi: "Mỗi ngày bạn đánh răng mấy lần?" },
    { zh: "这颗牙需要补一补。", vi: "Chiếc răng này cần trám lại." },
    { zh: "一个月以后再来检查。", vi: "Một tháng sau hãy đến kiểm tra lại." },
  ],
  objects: [
    { id: "toothbrush", term: "牙刷", gloss: "bàn chải đánh răng", above: true, portable: true, example: { zh: "这把牙刷的毛很软。", vi: "Bàn chải này lông rất mềm." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "toothpaste", term: "牙膏", gloss: "kem đánh răng", above: true, portable: true, example: { zh: "早晚都要用牙膏刷牙。", vi: "Sáng tối đều phải dùng kem đánh răng." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "floss", term: "牙线", gloss: "chỉ nha khoa", above: true, portable: true, example: { zh: "吃完饭可以用牙线。", vi: "Ăn xong có thể dùng chỉ nha khoa." }, x: 35, y: 48, w: 4.5, stand: { x: 35, y: 70 } },
    { id: "tooth", term: "牙齿", gloss: "răng", above: true, portable: true, example: { zh: "小孩的牙齿换了一颗。", vi: "Răng của em bé thay mất một chiếc." }, x: 41, y: 48, w: 4.5, stand: { x: 41, y: 70 } },
    { id: "braces", term: "牙套", gloss: "niềng răng", above: true, portable: true, example: { zh: "她戴了一年牙套。", vi: "Cô ấy đeo niềng răng một năm." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "rinsecup", term: "漱口杯", gloss: "cốc súc miệng", above: true, portable: true, example: { zh: "请用漱口杯漱一漱口。", vi: "Mời dùng cốc súc miệng súc miệng." }, x: 67, y: 50, w: 4, stand: { x: 67, y: 74 } },
    { id: "dentalmirror", term: "口镜", gloss: "gương nha khoa", above: true, portable: true, example: { zh: "医生用口镜看里面的牙。", vi: "Bác sĩ dùng gương nha khoa xem răng bên trong." }, x: 74, y: 50, w: 5, stand: { x: 74, y: 74 } },
    { id: "xray", term: "牙片", gloss: "phim chụp răng", above: true, portable: true, example: { zh: "医生看了看你的牙片。", vi: "Bác sĩ xem phim chụp răng của bạn." }, x: 81, y: 50, w: 5.5, stand: { x: 81, y: 74 } },
    { id: "dentalchair", term: "牙科椅", gloss: "ghế nha khoa", example: { zh: "请躺在牙科椅上。", vi: "Mời nằm lên ghế nha khoa." }, x: 44, y: 80, w: 13 },
    { id: "surgerylamp", term: "无影灯", gloss: "đèn không bóng", example: { zh: "无影灯照得很亮。", vi: "Đèn không bóng chiếu rất sáng." }, x: 56, y: 94, w: 11 },
    { id: "drill", term: "牙钻", gloss: "mũi khoan răng", portable: true, example: { zh: "牙钻的声音有点吵。", vi: "Tiếng mũi khoan răng hơi ồn." }, x: 84, y: 76, w: 7 },
    { id: "instrtray", term: "器械盘", gloss: "khay dụng cụ", portable: true, example: { zh: "器械盘里放着小镜子。", vi: "Trong khay dụng cụ có chiếc gương nhỏ." }, x: 30, y: 92, w: 9 },
  ],
};
