import type { SceneDef } from "../explore-types";

/** Cảng xuất nhập khẩu: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const PORT_SCENE: SceneDef = {
  id: "port",
  title: "Cảng xuất nhập khẩu",
  subtitle: "Ra cảng xuất nhập khẩu, học từ về hàng hóa và hải quan rồi làm nhiệm vụ cho Chú Hổ điều phối cảng.",
  theme: "port",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Phòng thí nghiệm AI", to: "ailab", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Nhà kính", to: "greenhouse", x: 92, y: 60, w: 6 }],
  npc: {
    id: "tiger", name: "Chú Hổ điều phối cảng", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến cảng xuất nhập khẩu! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "这批货什么时候到港?", vi: "Lô hàng này khi nào cập cảng?" },
    { zh: "请填写报关单。", vi: "Xin điền tờ khai hải quan." },
    { zh: "进口的东西要交关税。", vi: "Hàng nhập khẩu phải nộp thuế quan." },
    { zh: "运费怎么算?", vi: "Cước vận chuyển tính thế nào?" },
  ],
  objects: [
    { id: "container", term: "集装箱", gloss: "container", above: true, portable: true, example: { zh: "一艘大船能装几千个集装箱。", vi: "Một con tàu lớn chở được mấy nghìn container." }, x: 21, y: 48, w: 8, stand: { x: 21, y: 70 } },
    { id: "cargoship", term: "货轮", gloss: "tàu hàng", above: true, portable: true, example: { zh: "货轮明天早上到港。", vi: "Tàu hàng sáng mai cập cảng." }, x: 28, y: 48, w: 7, stand: { x: 28, y: 70 } },
    { id: "customsform", term: "报关单", gloss: "tờ khai hải quan", above: true, portable: true, example: { zh: "报关单上要写清楚货物的名字。", vi: "Trên tờ khai hải quan phải ghi rõ tên hàng." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "tariff", term: "关税", gloss: "thuế quan", above: true, portable: true, example: { zh: "这种水果的关税很高。", vi: "Thuế quan của loại trái cây này rất cao." }, x: 41, y: 48, w: 4.5, stand: { x: 41, y: 70 } },
    { id: "importgoods", term: "进口", gloss: "nhập khẩu", above: true, portable: true, example: { zh: "这些咖啡豆是从巴西进口的。", vi: "Những hạt cà phê này nhập khẩu từ Brazil." }, x: 60, y: 50, w: 5.5, stand: { x: 60, y: 74 } },
    { id: "freight", term: "运费", gloss: "cước vận chuyển", above: true, portable: true, example: { zh: "海运的运费比空运便宜。", vi: "Cước đường biển rẻ hơn đường hàng không." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "billoflading", term: "提单", gloss: "vận đơn", above: true, portable: true, example: { zh: "没有提单就不能提货。", vi: "Không có vận đơn thì không nhận được hàng." }, x: 74, y: 50, w: 5, stand: { x: 74, y: 74 } },
    { id: "sample", term: "样品", gloss: "hàng mẫu", above: true, portable: true, example: { zh: "客人先要一个样品看看。", vi: "Khách muốn xem thử một hàng mẫu trước." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "crane", term: "起重机", gloss: "cần cẩu", example: { zh: "起重机把集装箱吊到了船上。", vi: "Cần cẩu nhấc container lên tàu." }, x: 44, y: 80, w: 20 },
    { id: "shelving", term: "货架", gloss: "giá kho", example: { zh: "仓库里的货架有三层。", vi: "Giá trong kho có ba tầng." }, x: 56, y: 94, w: 10 },
    { id: "forklift", term: "叉车", gloss: "xe nâng", example: { zh: "叉车一次能搬很多箱子。", vi: "Xe nâng mỗi lần chở được nhiều thùng." }, x: 84, y: 76, w: 11 },
    { id: "wharf", term: "码头", gloss: "bến cảng", example: { zh: "码头上停着好几艘船。", vi: "Ở bến cảng đang đậu mấy chiếc tàu." }, x: 30, y: 92, w: 20 },
  ],
};
