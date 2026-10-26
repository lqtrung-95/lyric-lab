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
  phrases: [
    { zh: "小心,海浪很大!", vi: "Cẩn thận, sóng lớn lắm!" },
    { zh: "我们去游泳吧。", vi: "Chúng ta đi bơi nhé." },
    { zh: "请涂防晒霜。", vi: "Xin hãy thoa kem chống nắng." },
    { zh: "我想堆沙堡。", vi: "Tôi muốn xây lâu đài cát." },
  ],
  objects: [
    { id: "sun", wall: true, term: "太阳", gloss: "mặt trời", example: { zh: "海边的太阳很大。", vi: "Nắng ở biển rất to." }, x: 18, y: 15, w: 7 },
    { id: "boat", wall: true, term: "船", gloss: "con thuyền", example: { zh: "那条船很大。", vi: "Chiếc thuyền đó rất lớn." }, x: 80, y: 38, w: 16 },
    { id: "crab", term: "螃蟹", gloss: "con cua", portable: true, example: { zh: "沙滩上有一只螃蟹。", vi: "Trên bãi cát có một con cua." }, x: 16, y: 70, w: 8 },
    { id: "shell", term: "贝壳", gloss: "vỏ sò", portable: true, example: { zh: "我捡了很多贝壳。", vi: "Tôi nhặt được nhiều vỏ sò." }, x: 30, y: 84, w: 6 },
    { id: "lifebuoy", term: "救生圈", gloss: "phao cứu sinh", portable: true, example: { zh: "请带上救生圈。", vi: "Xin hãy mang theo phao cứu sinh." }, x: 46, y: 70, w: 6.5 },
    { id: "sunscreen", term: "防晒霜", gloss: "kem chống nắng", portable: true, example: { zh: "请涂防晒霜。", vi: "Xin hãy thoa kem chống nắng." }, x: 58, y: 86, w: 4 },
    { id: "bucket", term: "水桶", gloss: "cái xô", portable: true, example: { zh: "孩子用水桶装沙子。", vi: "Em bé dùng xô để xúc cát." }, x: 68, y: 72, w: 6 },
    { id: "starfish", term: "海星", gloss: "sao biển", portable: true, example: { zh: "沙滩上有一只海星。", vi: "Trên bãi cát có một con sao biển." }, x: 78, y: 82, w: 6 },
    { id: "swimsuit", term: "泳衣", gloss: "đồ bơi", portable: true, example: { zh: "我穿着泳衣去游泳。", vi: "Tôi mặc đồ bơi đi bơi." }, x: 38, y: 92, w: 5 },
    { id: "sandcastle", term: "沙堡", gloss: "lâu đài cát", example: { zh: "我们一起堆沙堡吧。", vi: "Chúng ta cùng xây lâu đài cát nhé." }, x: 90, y: 70, w: 10 },
  ],
};
