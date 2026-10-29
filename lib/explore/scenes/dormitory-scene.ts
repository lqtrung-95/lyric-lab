import type { SceneDef } from "../explore-types";

/** Ký túc xá: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const DORMITORY_SCENE: SceneDef = {
  id: "dormitory",
  title: "Ký túc xá",
  subtitle: "Ghé phòng ký túc xá sinh viên, học từ về sinh hoạt tập thể rồi làm nhiệm vụ cho Bác Chó quản lý.",
  theme: "dormitory",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Trường mẫu giáo", to: "kindergarten", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Núi Thanh Sơn", to: "mountain", x: 92, y: 60, w: 6 }],
  npc: {
    id: "dog", name: "Bác Chó quản lý ký túc xá", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến ký túc xá! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "晚上十一点熄灯。", vi: "Mười một giờ tối tắt đèn." },
    { zh: "请把脏衣服放进脸盆。", vi: "Xin để quần áo bẩn vào chậu." },
    { zh: "我上铺,你下铺。", vi: "Tôi giường trên, bạn giường dưới." },
    { zh: "别忘了带门禁卡。", vi: "Đừng quên mang thẻ ra vào." },
  ],
  objects: [
    { id: "toothcup", term: "牙缸", gloss: "cốc đánh răng", above: true, portable: true, example: { zh: "他把牙刷放在牙缸里。", vi: "Anh ấy để bàn chải trong cốc đánh răng." }, x: 21, y: 48, w: 4, stand: { x: 21, y: 70 } },
    { id: "basin", term: "脸盆", gloss: "chậu rửa mặt", above: true, portable: true, example: { zh: "她把毛巾放在脸盆里。", vi: "Cô ấy để khăn trong chậu rửa mặt." }, x: 28, y: 48, w: 5, stand: { x: 28, y: 70 } },
    { id: "hotkettle", term: "热水壶", gloss: "bình đun nước", above: true, portable: true, example: { zh: "热水壶里的水开了。", vi: "Nước trong bình đun sôi rồi." }, x: 35, y: 48, w: 5, stand: { x: 35, y: 70 } },
    { id: "powerstrip", term: "插线板", gloss: "ổ cắm kéo dài", above: true, portable: true, example: { zh: "插线板上插满了充电器。", vi: "Ổ cắm kéo dài cắm đầy bộ sạc." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "phonestand", term: "手机支架", gloss: "giá đỡ điện thoại", above: true, portable: true, example: { zh: "躺在床上用手机支架看剧。", vi: "Nằm trên giường dùng giá đỡ điện thoại xem phim." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "coolmat", term: "凉席", gloss: "chiếu mát", above: true, portable: true, example: { zh: "夏天睡凉席特别舒服。", vi: "Mùa hè ngủ chiếu mát rất dễ chịu." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "mosquitonet", term: "蚊帐", gloss: "màn chống muỗi", above: true, portable: true, example: { zh: "夏天挂上蚊帐就不怕蚊子了。", vi: "Mùa hè treo màn lên là không sợ muỗi." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "doorcard", term: "门禁卡", gloss: "thẻ ra vào", above: true, portable: true, example: { zh: "没有门禁卡进不了宿舍楼。", vi: "Không có thẻ ra vào thì không vào được tòa ký túc xá." }, x: 81, y: 50, w: 4.5, stand: { x: 81, y: 74 } },
    { id: "bunkbed", term: "上下铺", gloss: "giường tầng", example: { zh: "我睡上下铺的上铺。", vi: "Tôi ngủ giường trên của giường tầng." }, x: 44, y: 80, w: 13 },
    { id: "shoecabinet", term: "鞋柜", gloss: "tủ giày", example: { zh: "门口的鞋柜里放着大家的鞋。", vi: "Trong tủ giày ở cửa để giày của mọi người." }, x: 56, y: 94, w: 9 },
    { id: "dormstairs", term: "楼梯", gloss: "cầu thang", example: { zh: "宿舍在五楼,要爬楼梯。", vi: "Ký túc xá ở tầng năm, phải leo cầu thang." }, x: 84, y: 76, w: 8 },
    { id: "gate", term: "宿舍大门", gloss: "cổng ký túc xá", example: { zh: "宿舍大门十一点锁门。", vi: "Cổng ký túc xá khóa lúc mười một giờ." }, x: 30, y: 92, w: 8 },
  ],
};
