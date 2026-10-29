import type { SceneDef } from "../explore-types";

/** Trạm chuyển phát: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const COURIER_SCENE: SceneDef = {
  id: "courier",
  title: "Trạm chuyển phát",
  subtitle: "Đến trạm chuyển phát nhanh, học từ về gửi và nhận hàng rồi làm nhiệm vụ cho Chú Thỏ nhân viên.",
  theme: "courier",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Lớp thư pháp", to: "calligraphy", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Quán hát karaoke", to: "ktv", x: 92, y: 60, w: 6 }],
  npc: {
    id: "rabbit", name: "Chú Thỏ nhân viên chuyển phát", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến trạm chuyển phát! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "请问我的快递到了吗?", vi: "Xin hỏi kiện hàng của tôi đến chưa?" },
    { zh: "取件码是多少?", vi: "Mã nhận hàng là bao nhiêu?" },
    { zh: "易碎物品,请轻拿轻放。", vi: "Hàng dễ vỡ, xin nhẹ tay." },
    { zh: "请在这里签收。", vi: "Xin ký nhận ở đây." },
  ],
  objects: [
    { id: "carton", term: "纸箱", gloss: "thùng carton", above: true, portable: true, example: { zh: "请把东西放进纸箱里。", vi: "Hãy cho đồ vào thùng carton." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "shipslip", term: "面单", gloss: "phiếu gửi hàng", above: true, portable: true, example: { zh: "面单上要写清楚地址。", vi: "Trên phiếu gửi phải ghi rõ địa chỉ." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "barcode", term: "条形码", gloss: "mã vạch", above: true, portable: true, example: { zh: "扫一下条形码就知道包裹在哪儿。", vi: "Quét mã vạch là biết gói hàng ở đâu." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "scangun", term: "扫描枪", gloss: "súng quét mã", above: true, portable: true, example: { zh: "工作人员用扫描枪扫了一下。", vi: "Nhân viên dùng súng quét mã quét một cái." }, x: 41, y: 48, w: 5.5, stand: { x: 41, y: 70 } },
    { id: "courierbag", term: "快递袋", gloss: "túi chuyển phát", above: true, portable: true, example: { zh: "小东西可以装进快递袋。", vi: "Đồ nhỏ có thể cho vào túi chuyển phát." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "foam", term: "泡沫", gloss: "xốp chèn hàng", above: true, portable: true, example: { zh: "易碎的东西要垫上泡沫。", vi: "Đồ dễ vỡ phải lót xốp." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "sealtape", term: "封箱带", gloss: "băng dính dán thùng", above: true, portable: true, example: { zh: "他用封箱带把纸箱封好。", vi: "Anh dùng băng dính dán thùng dán kín thùng carton." }, x: 74, y: 50, w: 5, stand: { x: 74, y: 74 } },
    { id: "logbook", term: "登记本", gloss: "sổ đăng ký", above: true, portable: true, example: { zh: "取件以前要在登记本上签名。", vi: "Trước khi lấy hàng phải ký tên vào sổ đăng ký." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "parcellocker", term: "快递柜", gloss: "tủ nhận hàng tự động", example: { zh: "快递柜里有我的快递。", vi: "Trong tủ nhận hàng có kiện hàng của tôi." }, x: 44, y: 80, w: 13 },
    { id: "digitalscale", term: "电子秤", gloss: "cân điện tử", example: { zh: "先用电子秤称一下重量。", vi: "Hãy dùng cân điện tử cân trọng lượng trước." }, x: 56, y: 94, w: 9 },
    { id: "totebox", term: "周转箱", gloss: "thùng luân chuyển", portable: true, example: { zh: "包裹都装在周转箱里。", vi: "Các gói hàng đều đựng trong thùng luân chuyển." }, x: 84, y: 76, w: 8 },
    { id: "sortingtable", term: "分拣台", gloss: "bàn phân loại hàng", example: { zh: "工作人员在分拣台上整理包裹。", vi: "Nhân viên sắp xếp gói hàng trên bàn phân loại." }, x: 30, y: 92, w: 13 },
  ],
};
