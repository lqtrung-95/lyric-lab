import type { SceneDef } from "../explore-types";

/** Bãi biển: cát, biển, thuyền, vỏ sò và đồ chơi biển. Câu ví dụ tự viết, đơn giản, dùng được khi đi biển. */
export const BEACH_SCENE: SceneDef = {
  id: "beach",
  title: "Bãi biển",
  subtitle: "Dạo bãi biển, học từ về biển, cát và đồ đi biển rồi làm nhiệm vụ cho Chú Vịt cứu hộ.",
  theme: "beach",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Siêu thị", to: "supermarket", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Sân vận động", to: "stadium", x: 92, y: 52, w: 6 },
  ],
  npc: {
    id: "duck", name: "Chú Vịt cứu hộ", x: 88, y: 93, w: 8,
    greeting: "Chào mừng đến bãi biển! Hãy đi dạo trên cát, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Dạo thêm vài vòng nhé!",
  },
  objects: [
    { id: "sun", wall: true, term: "太阳", gloss: "mặt trời", example: { zh: "海边的太阳很大。", vi: "Nắng ở biển rất to." }, x: 18, y: 15, w: 7 },
    { id: "kite", wall: true, portable: true, term: "风筝", gloss: "diều", example: { zh: "海边适合放风筝。", vi: "Bãi biển hợp để thả diều." }, x: 46, y: 28, w: 5 },
    { id: "bird", wall: true, term: "鸟", gloss: "con chim", example: { zh: "海上有很多鸟。", vi: "Trên biển có nhiều chim." }, x: 66, y: 22, w: 5 },
    { id: "boat", wall: true, term: "船", gloss: "con thuyền", example: { zh: "那条船很大。", vi: "Chiếc thuyền đó rất lớn." }, x: 80, y: 38, w: 16 },
    { id: "crab", term: "螃蟹", gloss: "con cua", portable: true, example: { zh: "沙滩上有一只螃蟹。", vi: "Trên bãi cát có một con cua." }, x: 16, y: 70, w: 8 },
    { id: "shell", term: "贝壳", gloss: "vỏ sò", portable: true, example: { zh: "我捡了很多贝壳。", vi: "Tôi nhặt được nhiều vỏ sò." }, x: 30, y: 84, w: 6 },
    { id: "ball", term: "球", gloss: "quả bóng", portable: true, example: { zh: "孩子们在玩球。", vi: "Bọn trẻ đang chơi bóng." }, x: 46, y: 70, w: 4.5 },
    { id: "hat", term: "帽子", gloss: "cái mũ", portable: true, example: { zh: "夏天要戴帽子。", vi: "Mùa hè phải đội mũ." }, x: 58, y: 86, w: 7 },
    { id: "towel", term: "毛巾", gloss: "khăn tắm", portable: true, example: { zh: "请带一条毛巾。", vi: "Xin hãy mang theo một cái khăn." }, x: 68, y: 72, w: 6 },
    { id: "shoes", term: "鞋", gloss: "giày dép", portable: true, example: { zh: "沙滩上不要穿鞋。", vi: "Trên bãi cát đừng đi giày." }, x: 78, y: 82, w: 7 },
    { id: "water", term: "水", gloss: "nước", portable: true, example: { zh: "夏天要多喝水。", vi: "Mùa hè phải uống nhiều nước." }, x: 38, y: 92, w: 2.6 },
    { id: "bag", term: "包", gloss: "cái túi", portable: true, example: { zh: "我的包在沙滩上。", vi: "Túi của tôi ở trên bãi cát." }, x: 90, y: 70, w: 5 },
  ],
};
