import type { SceneDef } from "../explore-types";

/** Tiệm sửa xe: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const GARAGE_SCENE: SceneDef = {
  id: "garage",
  title: "Tiệm sửa xe",
  subtitle: "Ghé tiệm sửa xe, học tên dụng cụ và bộ phận xe rồi làm nhiệm vụ cho Chú Hổ thợ máy.",
  theme: "garage",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Tiệm hoa", to: "flowershop", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Quán trà sữa", to: "bubbletea", x: 92, y: 60, w: 6 }],
  npc: {
    id: "tiger", name: "Chú Hổ thợ máy", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến tiệm sửa xe! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我的车坏了。", vi: "Xe của tôi hỏng rồi." },
    { zh: "请帮我检查一下。", vi: "Xin kiểm tra giúp tôi." },
    { zh: "要修多长时间?", vi: "Sửa mất bao lâu?" },
    { zh: "明天可以来取车。", vi: "Ngày mai có thể đến lấy xe." },
  ],
  objects: [
    { id: "wrench", term: "扳手", gloss: "cờ lê", above: true, portable: true, example: { zh: "请把扳手递给我。", vi: "Xin đưa cờ lê cho tôi." }, x: 21, y: 48, w: 7, stand: { x: 21, y: 70 } },
    { id: "screwdriver", term: "螺丝刀", gloss: "tua vít", above: true, portable: true, example: { zh: "用螺丝刀拧紧螺丝。", vi: "Dùng tua vít vặn chặt ốc vít." }, x: 28, y: 48, w: 3.5, stand: { x: 28, y: 70 } },
    { id: "motoroil", term: "机油", gloss: "dầu máy", above: true, portable: true, example: { zh: "车需要换机油了。", vi: "Xe cần thay dầu máy rồi." }, x: 35, y: 48, w: 4, stand: { x: 35, y: 70 } },
    { id: "helmet", term: "头盔", gloss: "mũ bảo hiểm", above: true, portable: true, example: { zh: "骑车要戴头盔。", vi: "Đi xe phải đội mũ bảo hiểm." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "screw", term: "螺丝", gloss: "con ốc vít", above: true, portable: true, example: { zh: "这颗螺丝掉了。", vi: "Con ốc vít này rơi mất rồi." }, x: 60, y: 50, w: 3, stand: { x: 60, y: 74 } },
    { id: "hammer", term: "锤子", gloss: "cái búa", above: true, portable: true, example: { zh: "他用锤子敲钉子。", vi: "Anh ấy dùng búa đóng đinh." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "pliers", term: "钳子", gloss: "cái kìm", above: true, portable: true, example: { zh: "请用钳子夹住它。", vi: "Xin dùng kìm kẹp nó lại." }, x: 74, y: 50, w: 4, stand: { x: 74, y: 74 } },
    { id: "jack", term: "千斤顶", gloss: "cái kích xe", above: true, portable: true, example: { zh: "先用千斤顶把车顶起来。", vi: "Trước tiên dùng kích nâng xe lên." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "car", term: "汽车", gloss: "xe ô tô", example: { zh: "这辆汽车是红色的。", vi: "Chiếc ô tô này màu đỏ." }, x: 44, y: 80, w: 12 },
    { id: "tire", term: "轮胎", gloss: "lốp xe", portable: true, example: { zh: "前面的轮胎没气了。", vi: "Lốp trước hết hơi rồi." }, x: 56, y: 94, w: 6 },
    { id: "steeringwheel", term: "方向盘", gloss: "vô lăng", portable: true, example: { zh: "双手要握紧方向盘。", vi: "Hai tay phải nắm chặt vô lăng." }, x: 84, y: 76, w: 6 },
    { id: "toolbox", term: "工具箱", gloss: "hộp dụng cụ", portable: true, example: { zh: "工具都在工具箱里。", vi: "Dụng cụ đều ở trong hộp dụng cụ." }, x: 30, y: 92, w: 7 },
  ],
};
