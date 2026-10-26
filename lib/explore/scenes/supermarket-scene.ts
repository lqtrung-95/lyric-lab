import type { SceneDef } from "../explore-types";

/** Siêu thị: kệ hàng sát tường, quầy thu ngân và xe đẩy. Câu ví dụ tự viết, đơn giản, dùng được khi đi mua sắm. */
export const SUPERMARKET_SCENE: SceneDef = {
  id: "supermarket",
  title: "Siêu thị",
  subtitle: "Đẩy xe đi mua sắm, học tên đồ ăn thức uống rồi làm nhiệm vụ cho Cô Heo thu ngân.",
  theme: "supermarket",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Thư viện", to: "library", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Bãi biển", to: "beach", x: 92, y: 52, w: 6 },
  ],
  npc: {
    id: "pig", name: "Cô Heo thu ngân", x: 88, y: 93, w: 8,
    greeting: "Chào mừng đến siêu thị! Hãy đi dọc các kệ, lại gần món hàng rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "shelf", x: 26, y: 33, w: 30 },
    { sprite: "shelf", x: 70, y: 33, w: 30 },
    { sprite: "counter", x: 78, y: 74, w: 26 },
  ],
  phrases: [
    { zh: "请问,收银台在哪儿?", vi: "Xin hỏi, quầy thu ngân ở đâu?" },
    { zh: "可以刷卡吗?", vi: "Có thể quẹt thẻ không?" },
    { zh: "这个有打折吗?", vi: "Cái này có giảm giá không?" },
    { zh: "请给我小票。", vi: "Cho tôi hóa đơn." },
  ],
  objects: [
    { id: "cart", term: "购物车", gloss: "xe đẩy mua hàng", example: { zh: "请推着购物车。", vi: "Xin hãy đẩy xe đẩy." }, x: 46, y: 80, w: 10 },
    { id: "milk", term: "牛奶", gloss: "sữa bò", above: true, portable: true, example: { zh: "我每天喝一杯牛奶。", vi: "Mỗi ngày tôi uống một ly sữa." }, x: 18, y: 26.5, w: 4, stand: { x: 18, y: 42 } },
    { id: "yogurt", term: "酸奶", gloss: "sữa chua", above: true, portable: true, example: { zh: "我要一杯酸奶。", vi: "Tôi muốn một hộp sữa chua." }, x: 26, y: 26.5, w: 4, stand: { x: 26, y: 42 } },
    { id: "juice", term: "果汁", gloss: "nước ép", above: true, portable: true, example: { zh: "这瓶果汁很甜。", vi: "Chai nước ép này rất ngọt." }, x: 34, y: 26.5, w: 3.5, stand: { x: 34, y: 42 } },
    { id: "instantnoodles", term: "方便面", gloss: "mì ăn liền", above: true, portable: true, example: { zh: "方便面在第三排。", vi: "Mì ăn liền ở dãy thứ ba." }, x: 62, y: 26.5, w: 6.5, stand: { x: 62, y: 42 } },
    { id: "toiletpaper", term: "卫生纸", gloss: "giấy vệ sinh", above: true, portable: true, example: { zh: "请买一包卫生纸。", vi: "Xin mua một gói giấy vệ sinh." }, x: 71, y: 26.5, w: 5, stand: { x: 71, y: 42 } },
    { id: "shampoo", term: "洗发水", gloss: "dầu gội", above: true, portable: true, example: { zh: "洗发水在这边。", vi: "Dầu gội ở bên này." }, x: 79, y: 26.5, w: 4.5, stand: { x: 79, y: 42 } },
    { id: "icecream", term: "冰淇淋", gloss: "kem", above: true, portable: true, example: { zh: "我想吃冰淇淋。", vi: "Tôi muốn ăn kem." }, x: 14, y: 62, w: 4.5, stand: { x: 14, y: 70 } },
    { id: "chips", term: "薯片", gloss: "khoai tây chiên", above: true, portable: true, example: { zh: "孩子爱吃薯片。", vi: "Trẻ con thích ăn khoai tây chiên." }, x: 24, y: 62, w: 5, stand: { x: 24, y: 70 } },
    { id: "scanner", term: "扫码器", gloss: "máy quét mã", above: true, portable: true, example: { zh: "请用扫码器付钱。", vi: "Xin hãy quét mã để thanh toán." }, x: 78, y: 58.5, w: 4.5, stand: { x: 78, y: 80 } },
    { id: "receipt", term: "小票", gloss: "hóa đơn nhỏ", above: true, portable: true, example: { zh: "请给我小票。", vi: "Cho tôi hóa đơn nhỏ." }, x: 86, y: 58.5, w: 4.5, stand: { x: 86, y: 80 } },
  ],
};
