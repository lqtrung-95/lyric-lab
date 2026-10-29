import type { SceneDef } from "../explore-types";

/** Công trường: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const CONSTRUCTION_SCENE: SceneDef = {
  id: "construction",
  title: "Công trường",
  subtitle: "Ra công trường, học từ về xây dựng rồi làm nhiệm vụ cho Bác Ngựa đốc công.",
  theme: "construction",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Phòng khám nha khoa", to: "dental", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Quán điểm tâm", to: "breakfast", x: 92, y: 60, w: 6 }],
  npc: {
    id: "horse", name: "Bác Ngựa đốc công", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến công trường! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "进工地一定要戴安全帽。", vi: "Vào công trường nhất định phải đội mũ bảo hiểm." },
    { zh: "请不要靠近挖掘机。", vi: "Xin đừng lại gần máy xúc." },
    { zh: "这面墙明天要砌好。", vi: "Bức tường này ngày mai phải xây xong." },
    { zh: "小心头上的东西!", vi: "Cẩn thận đồ trên đầu!" },
  ],
  objects: [
    { id: "hardhat", term: "安全帽", gloss: "mũ bảo hộ", above: true, portable: true, example: { zh: "工人都戴着黄色的安全帽。", vi: "Công nhân đều đội mũ bảo hộ màu vàng." }, x: 21, y: 48, w: 6, stand: { x: 21, y: 70 } },
    { id: "cement", term: "水泥", gloss: "xi măng", above: true, portable: true, example: { zh: "这袋水泥很重。", vi: "Bao xi măng này rất nặng." }, x: 28, y: 48, w: 5, stand: { x: 28, y: 70 } },
    { id: "brick", term: "砖头", gloss: "gạch", above: true, portable: true, example: { zh: "他一块一块地搬砖头。", vi: "Anh ấy bê từng viên gạch một." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "rebar", term: "钢筋", gloss: "thép xây dựng", above: true, portable: true, example: { zh: "房子里要放很多钢筋。", vi: "Trong nhà phải đặt rất nhiều thép." }, x: 41, y: 48, w: 7, stand: { x: 41, y: 70 } },
    { id: "scaffold", term: "脚手架", gloss: "giàn giáo", above: true, portable: true, example: { zh: "工人站在脚手架上刷墙。", vi: "Công nhân đứng trên giàn giáo quét tường." }, x: 60, y: 50, w: 7, stand: { x: 60, y: 74 } },
    { id: "blueprint", term: "图纸", gloss: "bản vẽ", above: true, portable: true, example: { zh: "工人按图纸盖房子。", vi: "Công nhân xây nhà theo bản vẽ." }, x: 67, y: 50, w: 6, stand: { x: 67, y: 74 } },
    { id: "tapemeasure", term: "卷尺", gloss: "thước cuộn", above: true, portable: true, example: { zh: "用卷尺量一量有多长。", vi: "Dùng thước cuộn đo xem dài bao nhiêu." }, x: 74, y: 50, w: 4.5, stand: { x: 74, y: 74 } },
    { id: "vest", term: "反光衣", gloss: "áo phản quang", above: true, portable: true, example: { zh: "晚上干活要穿反光衣。", vi: "Ban đêm làm việc phải mặc áo phản quang." }, x: 81, y: 50, w: 5, stand: { x: 81, y: 74 } },
    { id: "excavator", term: "挖掘机", gloss: "máy xúc", example: { zh: "挖掘机在挖一个大坑。", vi: "Máy xúc đang đào một cái hố lớn." }, x: 44, y: 80, w: 16 },
    { id: "mixer", term: "搅拌机", gloss: "máy trộn bê tông", example: { zh: "搅拌机一直在转。", vi: "Máy trộn bê tông quay không ngừng." }, x: 56, y: 94, w: 13 },
    { id: "shovel", term: "铁锹", gloss: "xẻng", portable: true, example: { zh: "他用铁锹铲沙子。", vi: "Anh dùng xẻng xúc cát." }, x: 84, y: 76, w: 5 },
    { id: "spiritlevel", term: "水平仪", gloss: "thước thủy", portable: true, example: { zh: "用水平仪看墙直不直。", vi: "Dùng thước thủy xem tường có thẳng không." }, x: 30, y: 92, w: 10 },
  ],
};
