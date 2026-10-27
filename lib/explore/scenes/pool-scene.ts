import type { SceneDef } from "../explore-types";

/** Hồ bơi: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const POOL_SCENE: SceneDef = {
  id: "pool",
  title: "Hồ bơi",
  subtitle: "Xuống hồ bơi, học từ về đồ bơi và an toàn dưới nước rồi làm nhiệm vụ cho Chú Vịt huấn luyện viên.",
  theme: "pool",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Hiệu sách", to: "bookstore", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Trạm cứu hỏa", to: "firestation", x: 92, y: 60, w: 6 }],
  npc: {
    id: "duck", name: "Chú Vịt huấn luyện viên", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến hồ bơi! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "下水以前先做热身。", vi: "Trước khi xuống nước hãy khởi động." },
    { zh: "请戴上泳帽和泳镜。", vi: "Xin hãy đội mũ bơi và đeo kính bơi." },
    { zh: "游完泳要洗澡。", vi: "Bơi xong phải tắm." },
    { zh: "小朋友要在大人旁边玩。", vi: "Trẻ nhỏ phải chơi bên cạnh người lớn." },
  ],
  objects: [
    { id: "swimcap", term: "泳帽", gloss: "mũ bơi", above: true, portable: true, example: { zh: "游泳要戴泳帽,头发才不会湿。", vi: "Đi bơi phải đội mũ bơi để tóc không ướt." }, x: 21, y: 48, w: 6.5, stand: { x: 21, y: 70 } },
    { id: "swimgoggles", term: "泳镜", gloss: "kính bơi", above: true, portable: true, example: { zh: "戴上泳镜,水里看得更清楚。", vi: "Đeo kính bơi vào, dưới nước nhìn rõ hơn." }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "kickboard", term: "浮板", gloss: "phao tập bơi", above: true, portable: true, example: { zh: "练习打水的时候要抱着浮板。", vi: "Khi tập đạp nước phải ôm phao tập bơi." }, x: 35, y: 48, w: 4.5, stand: { x: 35, y: 70 } },
    { id: "armbands", term: "臂圈", gloss: "phao tay", above: true, portable: true, example: { zh: "小朋友戴着臂圈在水里玩。", vi: "Các bé đeo phao tay chơi trong nước." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "bathtowel", term: "浴巾", gloss: "khăn tắm", above: true, portable: true, example: { zh: "上岸以后快用浴巾擦干。", vi: "Lên bờ rồi mau dùng khăn tắm lau khô." }, x: 60, y: 50, w: 5.5, stand: { x: 60, y: 74 } },
    { id: "showerhead", term: "淋浴头", gloss: "vòi sen", above: true, portable: true, example: { zh: "游完泳先在淋浴头下冲一冲。", vi: "Bơi xong hãy tắm qua dưới vòi sen." }, x: 67, y: 50, w: 4.5, stand: { x: 67, y: 74 } },
    { id: "earplugs", term: "耳塞", gloss: "nút tai", above: true, portable: true, example: { zh: "戴上耳塞,耳朵就不会进水。", vi: "Đeo nút tai vào, tai sẽ không vào nước." }, x: 74, y: 50, w: 4.5, stand: { x: 74, y: 74 } },
    { id: "noseclip", term: "鼻夹", gloss: "kẹp mũi", above: true, portable: true, example: { zh: "他用鼻夹夹住鼻子,潜到了水底。", vi: "Anh kẹp mũi bằng kẹp mũi rồi lặn xuống đáy nước." }, x: 81, y: 50, w: 4, stand: { x: 81, y: 74 } },
    { id: "divingboard", term: "跳水板", gloss: "ván nhảy", example: { zh: "他从跳水板上跳了下去。", vi: "Anh nhảy xuống từ ván nhảy." }, x: 44, y: 80, w: 14 },
    { id: "laneropes", term: "泳道线", gloss: "dây phân làn", example: { zh: "每条泳道线中间都有小浮球。", vi: "Mỗi dây phân làn đều có những phao nhỏ." }, x: 56, y: 94, w: 16 },
    { id: "lounger", term: "躺椅", gloss: "ghế dài nằm", example: { zh: "妈妈躺在躺椅上晒太阳。", vi: "Mẹ nằm trên ghế dài phơi nắng." }, x: 84, y: 76, w: 13 },
    { id: "waterslide", term: "滑梯", gloss: "cầu trượt nước", example: { zh: "他从高高的滑梯上冲了下来。", vi: "Cậu lao xuống từ chiếc cầu trượt cao." }, x: 30, y: 92, w: 13 },
  ],
};
