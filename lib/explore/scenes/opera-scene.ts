import type { SceneDef } from "../explore-types";

/** Nhà hát kinh kịch: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const OPERA_SCENE: SceneDef = {
  id: "opera",
  title: "Nhà hát kinh kịch",
  subtitle: "Vào nhà hát xem kinh kịch, học từ về sân khấu truyền thống rồi làm nhiệm vụ cho Ông Hổ nghệ sĩ.",
  theme: "opera",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Núi Thanh Sơn", to: "mountain", x: 7, y: 60, w: 6 }],
  npc: {
    id: "tiger", name: "Ông Hổ nghệ sĩ kinh kịch", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến nhà hát kinh kịch! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "好戏马上开场了。", vi: "Vở hay sắp mở màn rồi." },
    { zh: "他唱得真好,大家都鼓掌。", vi: "Anh ấy hát hay thật, mọi người đều vỗ tay." },
    { zh: "这个脸谱是红色的,代表忠勇。", vi: "Mặt nạ vẽ này màu đỏ, tượng trưng cho trung dũng." },
    { zh: "请把手机调成静音。", vi: "Xin để điện thoại ở chế độ im lặng." },
  ],
  objects: [
    { id: "operamask", term: "脸谱", gloss: "mặt nạ vẽ (kinh kịch)", above: true, portable: true, example: { zh: "红脸的脸谱代表忠勇。", vi: "Mặt nạ vẽ mặt đỏ tượng trưng cho trung dũng." }, x: 21, y: 48, w: 5, stand: { x: 21, y: 70 } },
    { id: "foldfan", term: "折扇", gloss: "quạt gấp", above: true, portable: true, example: { zh: "他手里拿着一把折扇。", vi: "Trong tay ông cầm một chiếc quạt gấp." }, x: 28, y: 48, w: 5, stand: { x: 28, y: 70 } },
    { id: "waterSleeve", term: "水袖", gloss: "tay áo thủy tụ (dài, phất)", above: true, portable: true, example: { zh: "她轻轻一甩水袖,台下响起掌声。", vi: "Cô khẽ phất tay áo dài, dưới sân khấu vang lên tiếng vỗ tay." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "gong", term: "锣", gloss: "cồng", above: true, portable: true, example: { zh: "一声锣响,大幕拉开了。", vi: "Một tiếng cồng vang lên, màn lớn kéo ra." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "drum", term: "鼓", gloss: "trống", above: true, portable: true, example: { zh: "鼓声越来越急。", vi: "Tiếng trống mỗi lúc một gấp." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "jinghu", term: "京胡", gloss: "đàn nhị kinh kịch", above: true, portable: true, example: { zh: "京胡的声音又高又亮。", vi: "Tiếng đàn nhị kinh kịch vừa cao vừa trong." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "opcostume", term: "戏服", gloss: "trang phục kịch", above: true, portable: true, example: { zh: "这件戏服上绣着金色的龙。", vi: "Bộ trang phục kịch này thêu rồng vàng." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "headdress", term: "头饰", gloss: "đồ cài đầu của nghệ sĩ", above: true, portable: true, example: { zh: "她的头饰上有很多小珠子。", vi: "Đồ cài đầu của cô có rất nhiều hạt nhỏ." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "stage", term: "戏台", gloss: "sân khấu kinh kịch", example: { zh: "戏台上挂着红色的大灯笼。", vi: "Trên sân khấu treo đèn lồng đỏ lớn." }, x: 44, y: 80, w: 16 },
    { id: "subtitlescreen", term: "字幕屏", gloss: "màn phụ đề", example: { zh: "戏台两边的字幕屏上有歌词。", vi: "Màn phụ đề hai bên sân khấu có lời hát." }, x: 56, y: 94, w: 10 },
    { id: "makeupmirror", term: "化妆镜", gloss: "gương trang điểm", example: { zh: "演员对着化妆镜画脸谱。", vi: "Diễn viên đối diện gương vẽ mặt nạ." }, x: 84, y: 76, w: 8 },
    { id: "audience", term: "观众席", gloss: "khán đài", example: { zh: "观众席上坐满了人。", vi: "Khán đài ngồi đầy người." }, x: 30, y: 92, w: 11 },
  ],
};
