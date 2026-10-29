import type { SceneDef } from "../explore-types";

/** Trạm xe buýt: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const BUSSTOP_SCENE: SceneDef = {
  id: "busstop",
  title: "Trạm xe buýt",
  subtitle: "Chờ xe buýt ở trạm, học từ về đi lại trong thành phố rồi làm nhiệm vụ cho Bác Voi trưởng trạm.",
  theme: "busstop",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Nhà đón Tết", to: "newyear", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Cửa hàng tiện lợi", to: "convenience", x: 92, y: 60, w: 6 }],
  npc: {
    id: "elephant", name: "Bác Voi trưởng trạm", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến trạm xe buýt! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "我要坐三路车。", vi: "Tôi muốn đi xe số ba." },
    { zh: "下一班车几点到?", vi: "Chuyến sau mấy giờ tới?" },
    { zh: "请投币,或者刷卡。", vi: "Vui lòng bỏ tiền xu hoặc quẹt thẻ." },
    { zh: "到站请提前按铃。", vi: "Đến trạm xin bấm chuông trước." },
  ],
  objects: [
    { id: "stopsign", term: "路牌", gloss: "biển tên đường", above: true, portable: true, example: { zh: "路牌上写着前面是中山路。", vi: "Biển tên đường ghi phía trước là đường Trung Sơn." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "linemap", term: "线路图", gloss: "sơ đồ tuyến", above: true, portable: true, example: { zh: "看线路图就知道在哪儿换车。", vi: "Xem sơ đồ tuyến là biết đổi xe ở đâu." }, x: 28, y: 48, w: 6.5, stand: { x: 28, y: 70 } },
    { id: "buscard", term: "公交卡", gloss: "thẻ xe buýt", above: true, portable: true, example: { zh: "我的公交卡里没钱了。", vi: "Thẻ xe buýt của tôi hết tiền rồi." }, x: 35, y: 48, w: 4.5, stand: { x: 35, y: 70 } },
    { id: "coinbox", term: "投币箱", gloss: "hộp bỏ tiền xu", above: true, portable: true, example: { zh: "请把硬币投进投币箱。", vi: "Xin bỏ tiền xu vào hộp." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "handring", term: "扶手", gloss: "tay vịn", above: true, portable: true, example: { zh: "车上人多,请抓好扶手。", vi: "Trên xe đông, xin nắm chắc tay vịn." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "priorityseat", term: "爱心座", gloss: "ghế ưu tiên", above: true, portable: true, example: { zh: "请给老人让爱心座。", vi: "Xin nhường ghế ưu tiên cho người già." }, x: 67, y: 50, w: 5, stand: { x: 67, y: 74 } },
    { id: "stopbell", term: "下车铃", gloss: "chuông xuống xe", above: true, portable: true, example: { zh: "到站了,按一下下车铃。", vi: "Đến trạm rồi, bấm chuông xuống xe." }, x: 74, y: 50, w: 4.5, stand: { x: 74, y: 74 } },
    { id: "change", term: "零钱", gloss: "tiền lẻ", above: true, portable: true, example: { zh: "司机不找零,请准备好零钱。", vi: "Tài xế không thối tiền, xin chuẩn bị tiền lẻ." }, x: 81, y: 50, w: 4.5, stand: { x: 81, y: 74 } },
    { id: "bus", term: "公交车", gloss: "xe buýt", example: { zh: "公交车来了,快上车!", vi: "Xe buýt tới rồi, mau lên xe!" }, x: 44, y: 80, w: 16 },
    { id: "busdoor", term: "车门", gloss: "cửa xe", example: { zh: "车门关了,请等下一班。", vi: "Cửa xe đóng rồi, xin đợi chuyến sau." }, x: 56, y: 94, w: 8 },
    { id: "shelter", term: "候车亭", gloss: "nhà chờ xe", example: { zh: "我们在候车亭里躲雨。", vi: "Chúng tôi trú mưa trong nhà chờ." }, x: 84, y: 76, w: 10 },
    { id: "ledboard", term: "电子站牌", gloss: "bảng điện tử báo xe", example: { zh: "电子站牌显示五分钟后到站。", vi: "Bảng điện tử cho biết năm phút nữa xe tới." }, x: 30, y: 92, w: 9 },
  ],
};
