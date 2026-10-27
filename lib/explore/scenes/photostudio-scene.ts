import type { SceneDef } from "../explore-types";

/** Tiệm ảnh: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const PHOTOSTUDIO_SCENE: SceneDef = {
  id: "photostudio",
  title: "Tiệm ảnh",
  subtitle: "Ghé tiệm ảnh, học từ về chụp ảnh rồi làm nhiệm vụ cho Cô Cáo nhiếp ảnh.",
  theme: "photostudio",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Tiệm may", to: "tailor", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Phòng khám nha khoa", to: "dental", x: 92, y: 60, w: 6 }],
  npc: {
    id: "fox", name: "Cô Cáo nhiếp ảnh", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến tiệm ảnh! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "请看这里,笑一笑。", vi: "Hãy nhìn vào đây, cười lên nào." },
    { zh: "再来一张,好吗?", vi: "Chụp thêm một tấm nữa nhé?" },
    { zh: "照片明天可以取。", vi: "Ảnh ngày mai có thể lấy." },
    { zh: "请站到白布前面。", vi: "Mời đứng trước tấm vải trắng." },
  ],
  objects: [
    { id: "tripod", term: "三脚架", gloss: "chân máy ảnh", above: true, portable: true, example: { zh: "相机放在三脚架上不会晃。", vi: "Máy ảnh đặt trên chân máy sẽ không rung." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "flash", term: "闪光灯", gloss: "đèn flash", above: true, portable: true, example: { zh: "晚上拍照要开闪光灯。", vi: "Chụp buổi tối phải bật đèn flash." }, x: 28, y: 48, w: 4, stand: { x: 28, y: 70 } },
    { id: "lens", term: "镜头", gloss: "ống kính", above: true, portable: true, example: { zh: "这个镜头可以拍很远。", vi: "Ống kính này chụp được rất xa." }, x: 35, y: 48, w: 5, stand: { x: 35, y: 70 } },
    { id: "film", term: "底片", gloss: "phim âm bản", above: true, portable: true, example: { zh: "老照片的底片放在盒子里。", vi: "Phim âm bản của ảnh cũ để trong hộp." }, x: 41, y: 48, w: 5.5, stand: { x: 41, y: 70 } },
    { id: "album", term: "相册", gloss: "album ảnh", above: true, portable: true, example: { zh: "相册里有很多旧照片。", vi: "Trong album có rất nhiều ảnh cũ." }, x: 60, y: 50, w: 5.5, stand: { x: 60, y: 74 } },
    { id: "backdropcloth", term: "背景布", gloss: "phông nền", above: true, portable: true, example: { zh: "请换一块蓝色的背景布。", vi: "Xin đổi sang tấm phông nền màu xanh." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "idphoto", term: "证件照", gloss: "ảnh thẻ", above: true, portable: true, example: { zh: "办护照要交两张证件照。", vi: "Làm hộ chiếu phải nộp hai tấm ảnh thẻ." }, x: 74, y: 50, w: 4, stand: { x: 74, y: 74 } },
    { id: "camera", term: "单反相机", gloss: "máy ảnh DSLR", above: true, portable: true, example: { zh: "摄影师背着一台单反相机。", vi: "Thợ ảnh đeo một chiếc máy ảnh DSLR." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "softbox", term: "柔光箱", gloss: "hộp tản sáng", example: { zh: "柔光箱让脸上的光很柔和。", vi: "Hộp tản sáng làm ánh sáng trên mặt rất dịu." }, x: 44, y: 80, w: 10 },
    { id: "reflector", term: "反光板", gloss: "tấm hắt sáng", example: { zh: "助手举着反光板。", vi: "Trợ lý giơ tấm hắt sáng." }, x: 56, y: 94, w: 10 },
    { id: "photopaper", term: "相纸", gloss: "giấy in ảnh", portable: true, example: { zh: "这种相纸洗出来很亮。", vi: "Loại giấy in ảnh này rửa ra rất sáng." }, x: 84, y: 76, w: 6 },
    { id: "prophat", term: "道具帽", gloss: "mũ đạo cụ", portable: true, example: { zh: "拍照时可以戴道具帽。", vi: "Lúc chụp ảnh có thể đội mũ đạo cụ." }, x: 30, y: 92, w: 6 },
  ],
};
