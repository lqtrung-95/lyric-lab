import type { SceneDef } from "../explore-types";

/** Nhà kính: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const GREENHOUSE_SCENE: SceneDef = {
  id: "greenhouse",
  title: "Nhà kính",
  subtitle: "Vào nhà kính trồng rau, học từ về nông nghiệp thông minh rồi làm nhiệm vụ cho Bé Thỏ kỹ sư nông nghiệp.",
  theme: "greenhouse",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Cảng xuất nhập khẩu", to: "port", x: 7, y: 60, w: 6 }],
  npc: {
    id: "rabbit", name: "Bé Thỏ kỹ sư nông nghiệp", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến nhà kính! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "温室里的温度要保持稳定。", vi: "Nhiệt độ trong nhà kính phải giữ ổn định." },
    { zh: "每天要给蔬菜浇水。", vi: "Mỗi ngày phải tưới nước cho rau." },
    { zh: "这些番茄快熟了。", vi: "Những quả cà chua này sắp chín rồi." },
    { zh: "请不要踩菜畦。", vi: "Xin đừng giẫm lên luống rau." },
  ],
  objects: [
    { id: "tomato", term: "番茄", gloss: "cà chua", above: true, portable: true, example: { zh: "温室里的番茄红得像小灯笼。", vi: "Cà chua trong nhà kính đỏ như những chiếc đèn lồng nhỏ." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "cucumber", term: "黄瓜", gloss: "dưa chuột", above: true, portable: true, example: { zh: "黄瓜长在架子上,又长又绿。", vi: "Dưa chuột mọc trên giàn, vừa dài vừa xanh." }, x: 28, y: 48, w: 6.5, stand: { x: 28, y: 70 } },
    { id: "seedling", term: "种苗", gloss: "cây giống", above: true, portable: true, example: { zh: "这些种苗下个月可以种到地里。", vi: "Những cây giống này tháng sau có thể trồng xuống đất." }, x: 35, y: 48, w: 5, stand: { x: 35, y: 70 } },
    { id: "fertilizer", term: "肥料", gloss: "phân bón", above: true, portable: true, example: { zh: "给蔬菜施肥料要适量。", vi: "Bón phân cho rau phải vừa đủ." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "hygrometer", term: "湿度计", gloss: "ẩm kế", above: true, portable: true, example: { zh: "湿度计显示今天的湿度是百分之六十。", vi: "Ẩm kế cho thấy độ ẩm hôm nay là sáu mươi phần trăm." }, x: 60, y: 50, w: 4, stand: { x: 60, y: 74 } },
    { id: "seedtray", term: "育苗盘", gloss: "khay ươm", above: true, portable: true, example: { zh: "育苗盘里的小苗长出了第二片叶子。", vi: "Cây con trong khay ươm đã mọc chiếc lá thứ hai." }, x: 67, y: 50, w: 8, stand: { x: 67, y: 74 } },
    { id: "shadenet", term: "遮阳网", gloss: "lưới che nắng", above: true, portable: true, example: { zh: "中午太阳大,要拉上遮阳网。", vi: "Trưa nắng gắt phải kéo lưới che nắng." }, x: 74, y: 50, w: 8, stand: { x: 74, y: 74 } },
    { id: "plasticfilm", term: "薄膜", gloss: "màng phủ", above: true, portable: true, example: { zh: "薄膜能让温室里更暖和。", vi: "Màng phủ làm trong nhà kính ấm hơn." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "dripline", term: "滴灌管", gloss: "ống tưới nhỏ giọt", example: { zh: "滴灌管一滴一滴地给菜浇水。", vi: "Ống tưới nhỏ giọt tưới rau từng giọt một." }, x: 44, y: 80, w: 18 },
    { id: "veggiebed", term: "菜畦", gloss: "luống rau", example: { zh: "一条菜畦里种着一种蔬菜。", vi: "Mỗi luống rau trồng một loại rau." }, x: 56, y: 94, w: 18 },
    { id: "compostbin", term: "堆肥桶", gloss: "thùng ủ phân", portable: true, example: { zh: "菜叶可以放进堆肥桶里。", vi: "Lá rau có thể bỏ vào thùng ủ phân." }, x: 84, y: 76, w: 7 },
    { id: "handcart", term: "手推车", gloss: "xe đẩy tay", portable: true, example: { zh: "他推着手推车把番茄运出去。", vi: "Anh đẩy xe đẩy tay chở cà chua ra ngoài." }, x: 30, y: 92, w: 9 },
  ],
};
