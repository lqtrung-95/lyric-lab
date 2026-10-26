import type { SceneDef } from "../explore-types";

/** Tiệm giặt là: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const LAUNDRY_SCENE: SceneDef = {
  id: "laundry",
  title: "Tiệm giặt là",
  subtitle: "Ghé tiệm giặt là, học tên đồ giặt và máy móc rồi làm nhiệm vụ cho Chú Vịt thợ giặt.",
  theme: "laundry",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Nông trại", to: "farm", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Cửa hàng đồ chơi", to: "toyshop", x: 92, y: 60, w: 6 }],
  npc: {
    id: "duck", name: "Chú Vịt thợ giặt", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến tiệm giặt là! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "这件衣服能洗干净吗?", vi: "Bộ đồ này giặt sạch được không?" },
    { zh: "请帮我熨一下。", vi: "Xin ủi giúp tôi." },
    { zh: "明天下午可以来取。", vi: "Chiều mai có thể đến lấy." },
    { zh: "衣服要晾干。", vi: "Quần áo phải phơi khô." },
  ],
  objects: [
    { id: "detergent", term: "洗衣粉", gloss: "bột giặt", above: true, portable: true, example: { zh: "洗衣粉放多了会有泡沫。", vi: "Cho nhiều bột giặt sẽ có bọt." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "hanger", term: "衣架", gloss: "móc áo", above: true, portable: true, example: { zh: "请把衬衫挂在衣架上。", vi: "Xin treo áo sơ mi lên móc." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "iron", term: "熨斗", gloss: "bàn ủi", above: true, portable: true, example: { zh: "熨斗很烫,小心!", vi: "Bàn ủi rất nóng, cẩn thận!" }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "shirt", term: "衬衫", gloss: "áo sơ mi", above: true, portable: true, example: { zh: "这件衬衫是白色的。", vi: "Chiếc áo sơ mi này màu trắng." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "coat", term: "外套", gloss: "áo khoác", above: true, portable: true, example: { zh: "外面冷,穿上外套。", vi: "Bên ngoài lạnh, mặc áo khoác vào." }, x: 60, y: 50, w: 6, stand: { x: 60, y: 74 } },
    { id: "soap", term: "肥皂", gloss: "xà phòng", above: true, portable: true, example: { zh: "用肥皂洗手。", vi: "Dùng xà phòng rửa tay." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "clothespin", term: "衣夹", gloss: "kẹp quần áo", above: true, portable: true, example: { zh: "用衣夹夹住袜子。", vi: "Dùng kẹp quần áo kẹp tất lại." }, x: 74, y: 50, w: 3, stand: { x: 74, y: 74 } },
    { id: "sheetcloth", term: "床单", gloss: "ga giường", above: true, portable: true, example: { zh: "床单要每个星期洗。", vi: "Ga giường phải giặt mỗi tuần." }, x: 81, y: 50, w: 7, stand: { x: 81, y: 74 } },
    { id: "washer", term: "洗衣机", gloss: "máy giặt", example: { zh: "洗衣机正在洗衣服。", vi: "Máy giặt đang giặt quần áo." }, x: 44, y: 80, w: 9 },
    { id: "dryer", term: "烘干机", gloss: "máy sấy", example: { zh: "烘干机很快就好了。", vi: "Máy sấy sắp xong rồi." }, x: 56, y: 94, w: 9 },
    { id: "sewingmachine", term: "缝纫机", gloss: "máy khâu", example: { zh: "她用缝纫机补裤子。", vi: "Cô ấy dùng máy khâu vá quần." }, x: 84, y: 76, w: 9 },
    { id: "clothesline", term: "晾衣绳", gloss: "dây phơi", example: { zh: "衣服挂在晾衣绳上。", vi: "Quần áo treo trên dây phơi." }, x: 30, y: 92, w: 12 },
  ],
};
