import type { SceneDef } from "../explore-types";

/** Rạp chiếu phim: màn hình lớn, ghế ngồi, quầy bắp nước. Câu ví dụ tự viết, đơn giản, dùng được khi đi xem phim. */
export const CINEMA_SCENE: SceneDef = {
  id: "cinema",
  title: "Rạp chiếu phim",
  subtitle: "Đi xem phim, học từ về vé, ghế và đồ ăn vặt rồi làm nhiệm vụ cho Trưởng ga Thỏ soát vé.",
  theme: "cinema",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Ngân hàng", to: "bank", x: 7, y: 66, w: 6 },
    { sprite: "exit", label: "Sang Phòng gym", to: "gym", x: 92, y: 52, w: 6 },
  ],
  npc: {
    id: "rabbit", name: "Thỏ soát vé", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến rạp chiếu phim! Hãy đi quanh sảnh, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [{ sprite: "counter", x: 78, y: 66, w: 24 }],
  phrases: [
    { zh: "我要买两张电影票。", vi: "Tôi muốn mua hai vé xem phim." },
    { zh: "这部电影几点开始?", vi: "Bộ phim này mấy giờ bắt đầu?" },
    { zh: "我们的座位在第五排。", vi: "Ghế của chúng ta ở hàng thứ năm." },
    { zh: "请把手机调成静音。", vi: "Xin hãy chuyển điện thoại sang chế độ im lặng." },
  ],
  objects: [
    { id: "screen", wall: true, term: "银幕", gloss: "màn ảnh", example: { zh: "银幕很大。", vi: "Màn ảnh rất lớn." }, x: 48, y: 33, w: 32 },
    { id: "curtain", wall: true, term: "幕布", gloss: "tấm màn", example: { zh: "幕布慢慢地拉开了。", vi: "Tấm màn từ từ kéo ra." }, x: 12, y: 36, w: 12 },
    { id: "poster", wall: true, term: "海报", gloss: "áp phích", example: { zh: "墙上有一张电影海报。", vi: "Trên tường có một tấm áp phích phim." }, x: 82, y: 30, w: 7 },
    { id: "projector", term: "放映机", gloss: "máy chiếu phim", example: { zh: "放映机在后面。", vi: "Máy chiếu phim ở phía sau." }, x: 46, y: 58, w: 8 },
    { id: "seat", term: "座位", gloss: "chỗ ngồi", example: { zh: "请找一下你的座位。", vi: "Xin hãy tìm chỗ ngồi của bạn." }, x: 28, y: 76, w: 8 },
    { id: "popcorn", term: "爆米花", gloss: "bắp rang", above: true, portable: true, example: { zh: "看电影要吃爆米花。", vi: "Xem phim phải ăn bắp rang." }, x: 72, y: 50, w: 4.5, stand: { x: 72, y: 74 } },
    { id: "cola", term: "可乐", gloss: "nước ngọt cola", above: true, portable: true, example: { zh: "我要一杯可乐。", vi: "Tôi muốn một ly cola." }, x: 79, y: 50, w: 3, stand: { x: 79, y: 74 } },
    { id: "candy", term: "糖果", gloss: "kẹo", above: true, portable: true, example: { zh: "孩子喜欢吃糖果。", vi: "Trẻ con thích ăn kẹo." }, x: 86, y: 50, w: 5, stand: { x: 86, y: 74 } },
    { id: "movieticket", term: "电影票", gloss: "vé xem phim", portable: true, example: { zh: "电影票在这儿。", vi: "Vé xem phim ở đây." }, x: 60, y: 92, w: 5 },
    { id: "glasses3d", term: "三维眼镜", gloss: "kính 3D", portable: true, example: { zh: "看三维电影要戴三维眼镜。", vi: "Xem phim 3D phải đeo kính 3D." }, x: 68, y: 90, w: 5 },
    { id: "camera", term: "摄像机", gloss: "máy quay phim", portable: true, example: { zh: "导演用摄像机拍电影。", vi: "Đạo diễn quay phim bằng máy quay." }, x: 14, y: 92, w: 7 },
    { id: "clapperboard", term: "场记板", gloss: "bảng clap", portable: true, example: { zh: "开拍前要打场记板。", vi: "Trước khi quay phải gõ bảng clap." }, x: 24, y: 94, w: 6 },
  ],
};
