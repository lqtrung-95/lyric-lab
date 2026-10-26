import type { SceneDef } from "../explore-types";

/** Thư viện: giá sách, bàn đọc có sách, báo và máy tính. Câu ví dụ tự viết, đơn giản, dùng được khi đi thư viện. */
export const LIBRARY_SCENE: SceneDef = {
  id: "library",
  title: "Thư viện",
  subtitle: "Vào thư viện yên tĩnh, học từ về sách, báo và đồ đọc rồi làm nhiệm vụ cho Cô Cú thủ thư.",
  theme: "library",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Văn phòng", to: "office", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Siêu thị", to: "supermarket", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "owl", name: "Cô Cú thủ thư", x: 90, y: 93, w: 9,
    greeting: "Suỵt, đây là thư viện! Hãy đi nhẹ, lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp cô để nhận nhiệm vụ nhé.",
    notReady: "Em cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "table", x: 24, y: 80, w: 26 },
    { sprite: "table", x: 64, y: 80, w: 26 },
  ],
  phrases: [
    { zh: "请问,怎么借书?", vi: "Xin hỏi, mượn sách thế nào?" },
    { zh: "这本书可以借多久?", vi: "Cuốn sách này mượn được bao lâu?" },
    { zh: "请保持安静。", vi: "Xin hãy giữ yên lặng." },
    { zh: "我要还书。", vi: "Tôi muốn trả sách." },
  ],
  objects: [
    { id: "bookshelf", wall: true, term: "书架", gloss: "giá sách", example: { zh: "书架上有很多书。", vi: "Trên giá sách có nhiều sách." }, x: 30, y: 33, w: 26 },
    { id: "book", term: "书", gloss: "sách", above: true, portable: true, example: { zh: "我借了一本书。", vi: "Tôi đã mượn một quyển sách." }, x: 16, y: 64, w: 6.5, stand: { x: 16, y: 87 } },
    { id: "newspaper", term: "报纸", gloss: "tờ báo", above: true, portable: true, example: { zh: "爷爷在看报纸。", vi: "Ông đang đọc báo." }, x: 25, y: 64, w: 6.5, stand: { x: 25, y: 87 } },
    { id: "magazine", term: "杂志", gloss: "tạp chí", above: true, portable: true, example: { zh: "我借了一本杂志。", vi: "Tôi đã mượn một cuốn tạp chí." }, x: 32, y: 64, w: 5, stand: { x: 32, y: 87 } },
    { id: "dictionary", term: "词典", gloss: "từ điển", above: true, portable: true, example: { zh: "不懂的字就查词典。", vi: "Chữ nào không hiểu thì tra từ điển." }, x: 58, y: 64, w: 6, stand: { x: 58, y: 87 } },
    { id: "bookmark", term: "书签", gloss: "thẻ đánh dấu sách", above: true, portable: true, example: { zh: "我用书签夹在书里。", vi: "Tôi kẹp thẻ đánh dấu vào sách." }, x: 67, y: 64, w: 3, stand: { x: 67, y: 87 } },
    { id: "libcard", term: "借书证", gloss: "thẻ thư viện", above: true, portable: true, example: { zh: "借书要带借书证。", vi: "Mượn sách phải mang thẻ thư viện." }, x: 74, y: 64, w: 5, stand: { x: 74, y: 87 } },
    { id: "ladder", term: "梯子", gloss: "cái thang", example: { zh: "请用梯子拿上面的书。", vi: "Hãy dùng thang lấy sách ở trên cao." }, x: 7, y: 48, w: 4.5 },
    { id: "bookcart", term: "书车", gloss: "xe đẩy sách", example: { zh: "管理员推着书车。", vi: "Thủ thư đẩy xe đẩy sách." }, x: 44, y: 92, w: 9 },
    { id: "bookend", term: "书立", gloss: "cái chặn sách", above: true, portable: true, example: { zh: "书立让书站得很稳。", vi: "Cái chặn sách giữ cho sách đứng vững." }, x: 36.5, y: 64, w: 5, stand: { x: 36.5, y: 87 } },
    { id: "quietsign", wall: true, term: "安静牌", gloss: "biển giữ yên lặng", example: { zh: "请看安静牌。", vi: "Xin hãy nhìn biển giữ yên lặng." }, x: 52, y: 27, w: 7 },
    { id: "highlighter", term: "荧光笔", gloss: "bút dạ quang", above: true, portable: true, example: { zh: "我用荧光笔画重点。", vi: "Tôi dùng bút dạ quang để tô ý chính." }, x: 63, y: 64, w: 5, stand: { x: 63, y: 87 } },
    { id: "readingtable", term: "阅览桌", gloss: "bàn đọc sách", example: { zh: "请到阅览桌看书。", vi: "Xin hãy ra bàn đọc để đọc sách." }, x: 84, y: 78, w: 12 },
  ],
};
