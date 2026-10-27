import type { SceneDef } from "../explore-types";

/** Phòng thí nghiệm: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const LAB_SCENE: SceneDef = {
  id: "lab",
  title: "Phòng thí nghiệm",
  subtitle: "Vào phòng thí nghiệm, học từ về dụng cụ khoa học rồi làm nhiệm vụ cho Cụ Cú nhà khoa học.",
  theme: "lab",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Khu cắm trại", to: "camping", x: 7, y: 60, w: 6 }],
  npc: {
    id: "owl", name: "Cụ Cú nhà khoa học", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến phòng thí nghiệm! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "做实验要小心。", vi: "Làm thí nghiệm phải cẩn thận." },
    { zh: "请戴上护目镜。", vi: "Xin hãy đeo kính bảo hộ." },
    { zh: "结果是什么?", vi: "Kết quả là gì?" },
    { zh: "请把数字写在本子上。", vi: "Xin ghi con số vào vở." },
  ],
  objects: [
    { id: "testtube", term: "试管", gloss: "ống nghiệm", above: true, portable: true, example: { zh: "他把水倒进试管里。", vi: "Cậu rót nước vào ống nghiệm." }, x: 21, y: 48, w: 3.5, stand: { x: 21, y: 70 } },
    { id: "beaker", term: "烧杯", gloss: "cốc đốt", above: true, portable: true, example: { zh: "烧杯里有半杯蓝色的水。", vi: "Trong cốc đốt có nửa cốc nước màu xanh." }, x: 28, y: 48, w: 5, stand: { x: 28, y: 70 } },
    { id: "dropper", term: "滴管", gloss: "ống nhỏ giọt", above: true, portable: true, example: { zh: "用滴管滴三滴水。", vi: "Dùng ống nhỏ giọt nhỏ ba giọt nước." }, x: 35, y: 48, w: 3, stand: { x: 35, y: 70 } },
    { id: "cylinder", term: "量筒", gloss: "ống đong", above: true, portable: true, example: { zh: "用量筒量一百毫升水。", vi: "Dùng ống đong đo một trăm mililít nước." }, x: 41, y: 48, w: 4, stand: { x: 41, y: 70 } },
    { id: "labthermo", term: "温度计", gloss: "nhiệt kế", above: true, portable: true, example: { zh: "温度计显示水是八十度。", vi: "Nhiệt kế cho thấy nước là tám mươi độ." }, x: 60, y: 50, w: 3.5, stand: { x: 60, y: 74 } },
    { id: "reagent", term: "试剂", gloss: "thuốc thử", above: true, portable: true, example: { zh: "这种试剂不能用手摸。", vi: "Loại thuốc thử này không được sờ bằng tay." }, x: 67, y: 50, w: 4.5, stand: { x: 67, y: 74 } },
    { id: "goggles", term: "护目镜", gloss: "kính bảo hộ", above: true, portable: true, example: { zh: "做实验要戴上护目镜。", vi: "Làm thí nghiệm phải đeo kính bảo hộ." }, x: 74, y: 50, w: 6.5, stand: { x: 74, y: 74 } },
    { id: "specimen", term: "标本", gloss: "mẫu vật", above: true, portable: true, example: { zh: "桌上有一只蝴蝶标本。", vi: "Trên bàn có một mẫu vật con bướm." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "microscope", term: "显微镜", gloss: "kính hiển vi", example: { zh: "用显微镜可以看清很小的东西。", vi: "Dùng kính hiển vi có thể nhìn rõ những thứ rất nhỏ." }, x: 44, y: 80, w: 7 },
    { id: "balance", term: "天平", gloss: "cân thăng bằng", example: { zh: "用天平称一称这块石头。", vi: "Dùng cân thăng bằng cân hòn đá này." }, x: 56, y: 94, w: 9 },
    { id: "labcoat", term: "白大褂", gloss: "áo choàng trắng", portable: true, example: { zh: "科学家穿着白大褂工作。", vi: "Nhà khoa học mặc áo choàng trắng làm việc." }, x: 84, y: 76, w: 8 },
    { id: "alcohollamp", term: "酒精灯", gloss: "đèn cồn", portable: true, example: { zh: "请小心,酒精灯是热的。", vi: "Xin cẩn thận, đèn cồn đang nóng." }, x: 30, y: 92, w: 6 },
  ],
};
