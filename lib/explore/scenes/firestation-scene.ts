import type { SceneDef } from "../explore-types";

/** Trạm cứu hỏa: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const FIRESTATION_SCENE: SceneDef = {
  id: "firestation",
  title: "Trạm cứu hỏa",
  subtitle: "Ghé trạm cứu hỏa, học từ về phòng cháy chữa cháy rồi làm nhiệm vụ cho Chú Chó lính cứu hỏa.",
  theme: "firestation",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Hồ bơi", to: "pool", x: 7, y: 60, w: 6 }],
  npc: {
    id: "dog", name: "Chú Chó lính cứu hỏa", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến trạm cứu hỏa! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "着火了,快打电话!", vi: "Cháy rồi, mau gọi điện thoại!" },
    { zh: "请不要乘电梯。", vi: "Xin đừng đi thang máy." },
    { zh: "用湿毛巾捂住鼻子。", vi: "Dùng khăn ướt bịt mũi." },
    { zh: "听到警报要马上离开。", vi: "Nghe chuông báo phải rời đi ngay." },
  ],
  objects: [
    { id: "firehat", term: "消防帽", gloss: "mũ cứu hỏa", above: true, portable: true, example: { zh: "消防员头上戴着红色的消防帽。", vi: "Lính cứu hỏa đội mũ cứu hỏa màu đỏ." }, x: 21, y: 48, w: 6.5, stand: { x: 21, y: 70 } },
    { id: "extinguisher", term: "灭火器", gloss: "bình chữa cháy", above: true, portable: true, example: { zh: "厨房里一定要放一个灭火器。", vi: "Trong bếp nhất định phải để một bình chữa cháy." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "firehose", term: "水带", gloss: "vòi rồng", above: true, portable: true, example: { zh: "两个人一起抱着水带往前冲。", vi: "Hai người cùng ôm vòi rồng lao về phía trước." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "fireaxe", term: "消防斧", gloss: "rìu cứu hỏa", above: true, portable: true, example: { zh: "他用消防斧劈开了被卡住的门。", vi: "Anh dùng rìu cứu hỏa bổ cánh cửa bị kẹt." }, x: 41, y: 48, w: 4, stand: { x: 41, y: 70 } },
    { id: "firealarm", term: "警报器", gloss: "chuông báo cháy", above: true, portable: true, example: { zh: "警报器一响,大家马上离开房间。", vi: "Chuông báo vừa reo, mọi người lập tức rời phòng." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "firesuit", term: "防护服", gloss: "đồ bảo hộ", above: true, portable: true, example: { zh: "穿上防护服,不怕火也不怕烟。", vi: "Mặc đồ bảo hộ vào, không sợ lửa cũng không sợ khói." }, x: 67, y: 50, w: 6.5, stand: { x: 67, y: 74 } },
    { id: "oxygentank", term: "氧气瓶", gloss: "bình oxy", above: true, portable: true, example: { zh: "背上氧气瓶,在浓烟里也能呼吸。", vi: "Đeo bình oxy lên, trong khói dày vẫn thở được." }, x: 74, y: 50, w: 4.5, stand: { x: 74, y: 74 } },
    { id: "ropecoil", term: "绳子", gloss: "dây thừng", above: true, portable: true, example: { zh: "他把绳子系在窗边,慢慢爬下去。", vi: "Anh buộc dây bên cửa sổ rồi từ từ leo xuống." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "firetruck", term: "消防车", gloss: "xe cứu hỏa", example: { zh: "消防车拉着警报,很快就到了。", vi: "Xe cứu hỏa bật còi, chẳng mấy chốc đã đến." }, x: 44, y: 80, w: 20 },
    { id: "hydrant", term: "消防栓", gloss: "trụ nước chữa cháy", example: { zh: "请不要把车停在消防栓前面。", vi: "Xin đừng đỗ xe trước trụ nước chữa cháy." }, x: 56, y: 94, w: 7 },
    { id: "firepole", term: "滑杆", gloss: "cột trượt", example: { zh: "听到警报,消防员顺着滑杆滑下来。", vi: "Nghe chuông báo, lính cứu hỏa trượt xuống theo cột trượt." }, x: 84, y: 76, w: 7 },
    { id: "turntable", term: "云梯", gloss: "thang xe cứu hỏa", example: { zh: "云梯升得很高,可以救出楼上的人。", vi: "Thang xe cứu hỏa vươn rất cao, cứu được người trên lầu." }, x: 30, y: 92, w: 9 },
  ],
};
