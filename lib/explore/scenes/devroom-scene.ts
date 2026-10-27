import type { SceneDef } from "../explore-types";

/** Công ty phần mềm: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const DEVROOM_SCENE: SceneDef = {
  id: "devroom",
  title: "Công ty phần mềm",
  subtitle: "Vào công ty phần mềm, học từ về lập trình rồi làm nhiệm vụ cho Cô Mèo lập trình viên.",
  theme: "devroom",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Trung tâm dữ liệu", to: "datacenter", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Phòng thí nghiệm AI", to: "ailab", x: 92, y: 60, w: 6 }],
  npc: {
    id: "cat", name: "Cô Mèo lập trình viên", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến công ty phần mềm! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "这段代码有一个漏洞。", vi: "Đoạn mã này có một lỗi." },
    { zh: "请先测试再发布。", vi: "Xin hãy kiểm thử rồi mới phát hành." },
    { zh: "新版本明天上线。", vi: "Phiên bản mới ngày mai ra mắt." },
    { zh: "需求又改了。", vi: "Yêu cầu lại thay đổi rồi." },
  ],
  objects: [
    { id: "code", term: "代码", gloss: "mã nguồn", above: true, portable: true, example: { zh: "他每天写几百行代码。", vi: "Anh viết vài trăm dòng mã mỗi ngày." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "software", term: "软件", gloss: "phần mềm", above: true, portable: true, example: { zh: "这个软件可以帮你学汉语。", vi: "Phần mềm này có thể giúp bạn học tiếng Trung." }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "program", term: "程序", gloss: "chương trình", above: true, portable: true, example: { zh: "程序一运行就出错了。", vi: "Chương trình vừa chạy là báo lỗi." }, x: 35, y: 48, w: 5, stand: { x: 35, y: 70 } },
    { id: "bug", term: "漏洞", gloss: "lỗi (bug)", above: true, portable: true, example: { zh: "我们必须马上修好这个漏洞。", vi: "Chúng ta phải sửa lỗi này ngay." }, x: 41, y: 48, w: 4.5, stand: { x: 41, y: 70 } },
    { id: "testcheck", term: "测试", gloss: "kiểm thử", above: true, portable: true, example: { zh: "测试通过以后才能发布。", vi: "Kiểm thử đạt rồi mới được phát hành." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "versiontag", term: "版本", gloss: "phiên bản", above: true, portable: true, example: { zh: "新版本比旧版本快很多。", vi: "Phiên bản mới nhanh hơn bản cũ nhiều." }, x: 67, y: 50, w: 5.5, stand: { x: 67, y: 74 } },
    { id: "requirement", term: "需求", gloss: "yêu cầu", above: true, portable: true, example: { zh: "客户的需求每周都在变。", vi: "Yêu cầu của khách hàng tuần nào cũng đổi." }, x: 74, y: 50, w: 4.5, stand: { x: 74, y: 74 } },
    { id: "techdoc", term: "文档", gloss: "tài liệu kỹ thuật", above: true, portable: true, example: { zh: "新同事先看文档,再写代码。", vi: "Đồng nghiệp mới đọc tài liệu trước rồi mới viết mã." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "workstation", term: "工位", gloss: "chỗ ngồi làm việc", example: { zh: "我的工位在窗户旁边。", vi: "Chỗ ngồi của tôi ở cạnh cửa sổ." }, x: 44, y: 80, w: 12 },
    { id: "bigscreen", term: "屏幕", gloss: "màn hình lớn", example: { zh: "会议室的屏幕上显示着进度。", vi: "Trên màn hình phòng họp đang hiện tiến độ." }, x: 56, y: 94, w: 10 },
    { id: "projectorbeam", term: "投影仪", gloss: "máy chiếu", portable: true, example: { zh: "投影仪把代码照在墙上。", vi: "Máy chiếu chiếu mã nguồn lên tường." }, x: 84, y: 76, w: 7 },
    { id: "staffcard", term: "工牌", gloss: "thẻ nhân viên", portable: true, example: { zh: "进公司要刷工牌。", vi: "Vào công ty phải quẹt thẻ nhân viên." }, x: 30, y: 92, w: 5 },
  ],
};
