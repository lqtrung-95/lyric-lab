import type { SceneDef } from "../explore-types";

/** Trung tâm dữ liệu: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const DATACENTER_SCENE: SceneDef = {
  id: "datacenter",
  title: "Trung tâm dữ liệu",
  subtitle: "Vào trung tâm dữ liệu, học từ về máy chủ và mạng rồi làm nhiệm vụ cho Chú Chó quản trị hệ thống.",
  theme: "datacenter",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Trạm cứu hỏa", to: "firestation", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Công ty phần mềm", to: "devroom", x: 92, y: 60, w: 6 }],
  npc: {
    id: "dog", name: "Chú Chó quản trị hệ thống", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến trung tâm dữ liệu! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "服务器出问题了。", vi: "Máy chủ gặp sự cố rồi." },
    { zh: "请先备份重要的文件。", vi: "Xin hãy sao lưu các tệp quan trọng trước." },
    { zh: "你的密码不能告诉别人。", vi: "Mật khẩu của bạn không được nói cho người khác." },
    { zh: "网速太慢了。", vi: "Tốc độ mạng chậm quá." },
  ],
  objects: [
    { id: "server", term: "服务器", gloss: "máy chủ", above: true, portable: true, example: { zh: "公司所有的资料都放在服务器里。", vi: "Mọi tài liệu của công ty đều để trong máy chủ." }, x: 21, y: 48, w: 5.5, stand: { x: 21, y: 70 } },
    { id: "harddisk", term: "硬盘", gloss: "ổ cứng", above: true, portable: true, example: { zh: "这个硬盘可以存一千部电影。", vi: "Ổ cứng này lưu được một nghìn bộ phim." }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "firewall", term: "防火墙", gloss: "tường lửa", above: true, portable: true, example: { zh: "防火墙能挡住坏人进来。", vi: "Tường lửa có thể chặn kẻ xấu xâm nhập." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "netswitch", term: "交换机", gloss: "bộ chuyển mạch", above: true, portable: true, example: { zh: "交换机把很多台电脑连在一起。", vi: "Bộ chuyển mạch nối nhiều máy tính lại với nhau." }, x: 41, y: 48, w: 8, stand: { x: 41, y: 70 } },
    { id: "networkcable", term: "网线", gloss: "cáp mạng", above: true, portable: true, example: { zh: "这根网线断了,所以上不了网。", vi: "Sợi cáp mạng này đứt nên không vào mạng được." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "monitor", term: "显示器", gloss: "màn hình", above: true, portable: true, example: { zh: "这台显示器又大又清楚。", vi: "Màn hình này vừa to vừa rõ." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "password", term: "密码", gloss: "mật khẩu", above: true, portable: true, example: { zh: "密码要长一点,还要有数字。", vi: "Mật khẩu nên dài một chút và có số." }, x: 74, y: 50, w: 4.5, stand: { x: 74, y: 74 } },
    { id: "backupfiles", term: "备份", gloss: "bản sao lưu", above: true, portable: true, example: { zh: "每天晚上系统会自动做备份。", vi: "Mỗi tối hệ thống tự động sao lưu." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "rack", term: "机柜", gloss: "tủ rack", example: { zh: "机柜里放着十台服务器。", vi: "Trong tủ rack có mười máy chủ." }, x: 44, y: 80, w: 9 },
    { id: "aircon", term: "空调", gloss: "điều hòa", example: { zh: "机房里的空调一直开着。", vi: "Điều hòa trong phòng máy luôn bật." }, x: 56, y: 94, w: 12 },
    { id: "fan", term: "风扇", gloss: "quạt", portable: true, example: { zh: "风扇转得很快,机器就不会太热。", vi: "Quạt quay nhanh, máy sẽ không quá nóng." }, x: 84, y: 76, w: 8 },
    { id: "powersupply", term: "电源", gloss: "nguồn điện", portable: true, example: { zh: "停电的时候,备用电源会自动开启。", vi: "Khi mất điện, nguồn điện dự phòng tự bật." }, x: 30, y: 92, w: 6 },
  ],
};
