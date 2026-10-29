import type { SceneDef } from "../explore-types";

/** Núi Thanh Sơn: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const MOUNTAIN_SCENE: SceneDef = {
  id: "mountain",
  title: "Núi Thanh Sơn",
  subtitle: "Leo núi ngắm cảnh, học từ về thiên nhiên và đường lên núi rồi làm nhiệm vụ cho Bác Ngựa hướng dẫn viên.",
  theme: "mountain",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Ký túc xá", to: "dormitory", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Nhà hát kinh kịch", to: "opera", x: 92, y: 60, w: 6 }],
  npc: {
    id: "horse", name: "Bác Ngựa hướng dẫn leo núi", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến núi Thanh Sơn! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "山顶还有多远?", vi: "Đỉnh núi còn bao xa nữa?" },
    { zh: "慢慢走,别着急。", vi: "Đi chậm thôi, đừng vội." },
    { zh: "前面有个凉亭,我们休息一下。", vi: "Phía trước có cái chòi, chúng ta nghỉ một lát." },
    { zh: "早上的日出真美!", vi: "Bình minh buổi sáng đẹp quá!" },
  ],
  objects: [
    { id: "signpost", term: "路标", gloss: "biển chỉ đường", above: true, portable: true, example: { zh: "路标上写着:山顶两公里。", vi: "Biển chỉ đường ghi: đỉnh núi hai cây số." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "wildflower", term: "野花", gloss: "hoa dại", above: true, portable: true, example: { zh: "路边开着一朵朵野花。", vi: "Ven đường nở từng đóa hoa dại." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "boulder", term: "大石头", gloss: "tảng đá lớn", above: true, portable: true, example: { zh: "我们坐在大石头上休息。", vi: "Chúng tôi ngồi nghỉ trên tảng đá lớn." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "pinetree", term: "松树", gloss: "cây thông", above: true, portable: true, example: { zh: "山上有很多高高的松树。", vi: "Trên núi có nhiều cây thông cao." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "stonestep", term: "石阶", gloss: "bậc thang đá", above: true, portable: true, example: { zh: "这段石阶有三百多级。", vi: "Đoạn bậc thang đá này có hơn ba trăm bậc." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "sunrise", term: "日出", gloss: "bình minh", above: true, portable: true, example: { zh: "我们凌晨起床看日出。", vi: "Chúng tôi dậy lúc rạng sáng ngắm bình minh." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "cloudsea", term: "云海", gloss: "biển mây", above: true, portable: true, example: { zh: "山顶的云海像棉花一样。", vi: "Biển mây trên đỉnh núi trông như bông." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "trailmap", term: "登山地图", gloss: "bản đồ leo núi", above: true, portable: true, example: { zh: "门口的登山地图可以免费拿。", vi: "Bản đồ leo núi ở cổng lấy miễn phí." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "cablecar", term: "缆车", gloss: "cáp treo", example: { zh: "我们坐缆车上山,下山再走路。", vi: "Chúng tôi đi cáp treo lên núi, xuống thì đi bộ." }, x: 44, y: 80, w: 14 },
    { id: "waterfall", term: "瀑布", gloss: "thác nước", example: { zh: "瀑布从高高的山上流下来。", vi: "Thác nước đổ xuống từ ngọn núi cao." }, x: 56, y: 94, w: 10 },
    { id: "restpavilion", term: "凉亭", gloss: "chòi nghỉ chân", example: { zh: "走累了就到凉亭里坐一坐。", vi: "Đi mệt thì vào chòi ngồi một lát." }, x: 84, y: 76, w: 10 },
    { id: "brook", term: "小溪", gloss: "dòng suối nhỏ", example: { zh: "小溪里的水清得能看见石头。", vi: "Nước suối trong đến mức thấy cả đá dưới đáy." }, x: 30, y: 92, w: 9 },
  ],
};
