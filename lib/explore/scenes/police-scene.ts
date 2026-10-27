import type { SceneDef } from "../explore-types";

/** Đồn cảnh sát: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const POLICE_SCENE: SceneDef = {
  id: "police",
  title: "Đồn cảnh sát",
  subtitle: "Ghé đồn cảnh sát, học từ về điều tra rồi làm nhiệm vụ cho Chú Chó cảnh sát.",
  theme: "police",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Cửa hàng đồ chơi", to: "toyshop", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Ga tàu điện ngầm", to: "subway", x: 92, y: 60, w: 6 }],
  npc: {
    id: "dog", name: "Chú Chó cảnh sát", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến đồn cảnh sát! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我要报警。", vi: "Tôi muốn báo cảnh sát." },
    { zh: "我的钱包丢了。", vi: "Ví của tôi bị mất." },
    { zh: "请问发生了什么事?", vi: "Xin hỏi đã xảy ra chuyện gì?" },
    { zh: "请把你看到的告诉我。", vi: "Xin kể cho tôi những gì bạn thấy." },
  ],
  objects: [
    { id: "fingerprint", term: "指纹", gloss: "dấu vân tay", above: true, portable: true, example: { zh: "警察在杯子上找到了一个指纹。", vi: "Cảnh sát tìm thấy một dấu vân tay trên chiếc cốc." }, x: 21, y: 48, w: 4.5, stand: { x: 21, y: 70 } },
    { id: "idcard", term: "证件", gloss: "giấy tờ tùy thân", above: true, portable: true, example: { zh: "请出示您的证件。", vi: "Xin xuất trình giấy tờ của ông." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "policecap", term: "警帽", gloss: "mũ cảnh sát", above: true, portable: true, example: { zh: "警察戴着一顶蓝色的警帽。", vi: "Cảnh sát đội một chiếc mũ cảnh sát màu xanh." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "badge", term: "警徽", gloss: "huy hiệu cảnh sát", above: true, portable: true, example: { zh: "警徽在帽子的正中间。", vi: "Huy hiệu cảnh sát nằm chính giữa chiếc mũ." }, x: 41, y: 48, w: 4.5, stand: { x: 41, y: 70 } },
    { id: "handcuffs", term: "手铐", gloss: "còng tay", above: true, portable: true, example: { zh: "小偷被戴上了手铐。", vi: "Tên trộm bị đeo còng tay." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "walkietalkie", term: "对讲机", gloss: "bộ đàm", above: true, portable: true, example: { zh: "警察用对讲机叫来了同事。", vi: "Cảnh sát dùng bộ đàm gọi đồng nghiệp đến." }, x: 67, y: 50, w: 3.5, stand: { x: 67, y: 74 } },
    { id: "magnifier", term: "放大镜", gloss: "kính lúp", above: true, portable: true, example: { zh: "他用放大镜看那个脚印。", vi: "Anh dùng kính lúp xem dấu chân đó." }, x: 74, y: 50, w: 5, stand: { x: 74, y: 74 } },
    { id: "record", term: "笔录", gloss: "biên bản lời khai", above: true, portable: true, example: { zh: "他把你说的话写进了笔录。", vi: "Anh ghi những lời bạn nói vào biên bản lời khai." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "policecar", term: "警车", gloss: "xe cảnh sát", example: { zh: "警车开得很快,灯一直在闪。", vi: "Xe cảnh sát chạy rất nhanh, đèn nhấp nháy liên tục." }, x: 44, y: 80, w: 12 },
    { id: "cctv", term: "监控", gloss: "camera giám sát", example: { zh: "监控拍下了昨晚的事情。", vi: "Camera giám sát đã quay lại chuyện tối qua." }, x: 56, y: 94, w: 8 },
    { id: "file", term: "档案", gloss: "hồ sơ lưu trữ", portable: true, example: { zh: "这份档案里有所有人的名字。", vi: "Trong bộ hồ sơ này có tên của tất cả mọi người." }, x: 84, y: 76, w: 6 },
    { id: "lostbox", term: "失物招领箱", gloss: "hòm đồ thất lạc", example: { zh: "你的钱包在失物招领箱里。", vi: "Ví của bạn nằm trong hòm đồ thất lạc." }, x: 30, y: 92, w: 7 },
  ],
};
