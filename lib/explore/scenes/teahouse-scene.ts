import type { SceneDef } from "../explore-types";

/** Trà quán: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const TEAHOUSE_SCENE: SceneDef = {
  id: "teahouse",
  title: "Trà quán",
  subtitle: "Ngồi trà quán yên tĩnh, học từ về văn hóa trà rồi làm nhiệm vụ cho Bác Gấu trúc chủ quán.",
  theme: "teahouse",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Chợ đêm", to: "nightmarket", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Phòng khám Đông y", to: "tcm", x: 92, y: 60, w: 6 }],
  npc: {
    id: "pandaanimal", name: "Bác Gấu trúc chủ trà quán", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến trà quán! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "请慢用。", vi: "Mời dùng từ từ." },
    { zh: "这茶有点苦。", vi: "Trà này hơi đắng." },
    { zh: "再续一点水。", vi: "Châm thêm chút nước." },
    { zh: "茶香很特别。", vi: "Hương trà rất đặc biệt." },
  ],
  objects: [
    { id: "tealeaves", term: "茶叶", gloss: "lá trà", above: true, portable: true, example: { zh: "这罐茶叶是今年的新茶。", vi: "Hộp lá trà này là trà mới năm nay." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "gongfucup", term: "茶杯", gloss: "chén trà", above: true, portable: true, example: { zh: "请用茶杯慢慢品。", vi: "Mời dùng chén trà thưởng thức từ từ." }, x: 28, y: 48, w: 4.5, stand: { x: 28, y: 70 } },
    { id: "teatray", term: "茶盘", gloss: "khay trà", above: true, portable: true, example: { zh: "茶具都放在茶盘上。", vi: "Bộ đồ trà đều đặt trên khay trà." }, x: 35, y: 48, w: 6.5, stand: { x: 35, y: 70 } },
    { id: "yixingpot", term: "紫砂壶", gloss: "ấm tử sa", above: true, portable: true, example: { zh: "他用紫砂壶泡茶。", vi: "Ông ấy dùng ấm tử sa pha trà." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "teapet", term: "茶宠", gloss: "tượng thú nhỏ nuôi bằng nước trà", above: true, portable: true, example: { zh: "倒茶的时候别忘了浇茶宠。", vi: "Lúc rót trà đừng quên rưới lên tượng thú trà." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "teacaddy", term: "茶罐", gloss: "hộp đựng trà", above: true, portable: true, example: { zh: "茶罐盖紧才不会受潮。", vi: "Đậy chặt hộp trà thì mới không bị ẩm." }, x: 67, y: 50, w: 4, stand: { x: 67, y: 74 } },
    { id: "teasnack", term: "茶点", gloss: "điểm tâm ăn kèm trà", above: true, portable: true, example: { zh: "喝茶的时候来一碟茶点。", vi: "Uống trà thì dùng kèm một đĩa điểm tâm." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "fanbamboo", term: "蒲扇", gloss: "quạt cọ", above: true, portable: true, example: { zh: "夏天,老人手里摇着蒲扇。", vi: "Mùa hè, người già phe phẩy quạt cọ." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "teatable", term: "茶桌", gloss: "bàn trà", example: { zh: "我们围着茶桌坐下。", vi: "Chúng tôi ngồi quanh bàn trà." }, x: 44, y: 80, w: 13 },
    { id: "teafurnace", term: "茶炉", gloss: "lò đun nước pha trà", example: { zh: "茶炉上的水开了。", vi: "Nước trên lò pha trà sôi rồi." }, x: 56, y: 94, w: 9 },
    { id: "teascreen", term: "屏风", gloss: "bình phong", example: { zh: "屏风后面是安静的包间。", vi: "Phía sau bình phong là phòng riêng yên tĩnh." }, x: 84, y: 76, w: 9 },
    { id: "guqin", term: "古琴", gloss: "đàn cổ cầm", example: { zh: "茶馆里有人在弹古琴。", vi: "Trong trà quán có người gảy đàn cổ cầm." }, x: 30, y: 92, w: 11 },
  ],
};
