import type { SceneDef } from "../explore-types";

/** Ngân hàng: quầy giao dịch, máy ATM, két sắt. Câu ví dụ tự viết, đơn giản, dùng được khi giao dịch. */
export const BANK_SCENE: SceneDef = {
  id: "bank",
  title: "Ngân hàng",
  subtitle: "Vào ngân hàng, học từ về thẻ, tiền và giao dịch rồi làm nhiệm vụ cho Cô Cáo nhân viên.",
  theme: "bank",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Bảo tàng", to: "museum", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Rạp chiếu phim", to: "cinema", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "fox", name: "Cô Cáo nhân viên", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến ngân hàng! Hãy đi quanh quầy, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [{ sprite: "counter", x: 52, y: 66, w: 34 }],
  phrases: [
    { zh: "我想取钱。", vi: "Tôi muốn rút tiền." },
    { zh: "我想开一个账户。", vi: "Tôi muốn mở một tài khoản." },
    { zh: "请输入密码。", vi: "Xin hãy nhập mật mã." },
    { zh: "请问,今天的汇率是多少?", vi: "Xin hỏi, tỷ giá hôm nay là bao nhiêu?" },
  ],
  objects: [
    { id: "atm", term: "取款机", gloss: "máy rút tiền ATM", example: { zh: "我在取款机取钱。", vi: "Tôi rút tiền ở máy ATM." }, x: 14, y: 58, w: 8 },
    { id: "safe", term: "保险箱", gloss: "két sắt", example: { zh: "贵重的东西放在保险箱里。", vi: "Đồ quý để trong két sắt." }, x: 80, y: 52, w: 9 },
    { id: "bankcard", term: "银行卡", gloss: "thẻ ngân hàng", above: true, portable: true, example: { zh: "请把银行卡给我。", vi: "Xin đưa thẻ ngân hàng cho tôi." }, x: 38, y: 50, w: 5.5, stand: { x: 38, y: 74 } },
    { id: "cash", term: "现金", gloss: "tiền mặt", above: true, portable: true, example: { zh: "我付现金。", vi: "Tôi trả tiền mặt." }, x: 46, y: 50, w: 6, stand: { x: 46, y: 74 } },
    { id: "passbook", term: "存折", gloss: "sổ tiết kiệm", above: true, portable: true, example: { zh: "存折在抽屉里。", vi: "Sổ tiết kiệm ở trong ngăn kéo." }, x: 53, y: 50, w: 4, stand: { x: 53, y: 74 } },
    { id: "cheque", term: "支票", gloss: "séc", above: true, portable: true, example: { zh: "请在支票上签名。", vi: "Xin ký tên lên tờ séc." }, x: 61, y: 50, w: 6, stand: { x: 61, y: 74 } },
    { id: "posmachine", term: "刷卡机", gloss: "máy quẹt thẻ", above: true, portable: true, example: { zh: "请在刷卡机上刷卡。", vi: "Xin hãy quẹt thẻ ở máy quẹt thẻ." }, x: 69, y: 50, w: 4, stand: { x: 69, y: 74 } },
    { id: "wallet", term: "钱包", gloss: "cái ví", portable: true, example: { zh: "我的钱包不见了。", vi: "Ví của tôi mất rồi." }, x: 30, y: 88, w: 5 },
    { id: "queueticket", term: "号码单", gloss: "phiếu số thứ tự", portable: true, example: { zh: "请先拿号码单。", vi: "Xin hãy lấy phiếu số thứ tự trước." }, x: 64, y: 90, w: 4 },
    { id: "stamp", term: "印章", gloss: "con dấu", portable: true, example: { zh: "请盖一个印章。", vi: "Xin đóng một con dấu." }, x: 72, y: 88, w: 3.5 },
    { id: "lock", term: "锁", gloss: "ổ khóa", portable: true, example: { zh: "保险箱上有一把锁。", vi: "Trên két sắt có một ổ khóa." }, x: 40, y: 94, w: 4 },
    { id: "coinpurse", term: "零钱包", gloss: "ví đựng tiền lẻ", portable: true, example: { zh: "零钱包里有很多硬币。", vi: "Trong ví tiền lẻ có nhiều đồng xu." }, x: 22, y: 92, w: 5 },
  ],
};
