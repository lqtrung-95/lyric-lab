import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  owl: { name: "Cô Cú thủ thư", sprite: "owl" },
  dog: { name: "Chú Chó trưởng phòng", sprite: "dog" },
  pig: { name: "Cô Heo thu ngân", sprite: "pig" },
  duck: { name: "Chú Vịt cứu hộ", sprite: "duck" },
};

/** Manh mối vụ dễ: chứng cứ gần như trực tiếp (cát ở nắp bút chỉ có ở bãi biển, sổ cứu hộ cho thấy Vịt rời bãi biển sớm, Chó thấy một con vịt chân dính cát). */
export const CLUES: ClueDef[] = [
  { id: "ink_trail", title: "Vệt mực trên sàn", zh: "地上有蓝色的墨水,一直到门口。", vi: "Trên sàn có vết mực xanh kéo dài tới cửa.", sceneId: "library", kind: "object" },
  { id: "pen_cap", title: "Nắp bút rơi ở cửa", zh: "门口有一个笔帽,上面有白色的细沙。", vi: "Ở cửa có một cái nắp bút, trên đó dính cát trắng mịn.", sceneId: "library", kind: "object" },
  { id: "dog_alibi", title: "Lời khai của Chú Chó", zh: "我在办公室开会。三点前,我看见一只鸭子走过,脚上有沙子。", vi: "Tôi họp ở văn phòng. Trước ba giờ, tôi thấy một con vịt đi qua, chân dính cát.", sceneId: "office", kind: "testimony" },
  { id: "meeting_note", title: "Biên bản cuộc họp", zh: "昨天下午的会议三点二十分才开始。开会以前,小狗一个人在办公室。", vi: "Cuộc họp chiều qua bắt đầu lúc 3 giờ 20. Trước đó Chó ở văn phòng một mình.", sceneId: "office", kind: "document" },
  { id: "office_sand", title: "Khay cát trên bàn Chó", zh: "小狗的桌子上有一个装饰用的沙盘,里面是白色的细沙。", vi: "Trên bàn Chó có một khay cát trang trí, bên trong là cát trắng mịn.", sceneId: "office", kind: "object" },
  { id: "library_card", title: "Phiếu mượn sách", zh: "借书卡:鸭子两点四十分借了一本书,两点五十分离开图书馆。三点的时候,猫头鹰还在用那支金笔写字。", vi: "Phiếu mượn sách: Vịt mượn một cuốn sách lúc 2 giờ 40 và rời thư viện lúc 2 giờ 50. Lúc 3 giờ Cú vẫn còn dùng cây bút vàng để viết.", sceneId: "library", kind: "document" },
  { id: "pig_alibi", title: "Lời khai của Cô Heo", zh: "昨天下午三点,我在超市收钱。", vi: "Ba giờ chiều qua, tôi thu tiền ở siêu thị.", sceneId: "supermarket", kind: "testimony" },
  { id: "receipt", title: "Hóa đơn siêu thị", zh: "昨天下午三点零五分,小猪收了一个客人的钱。", vi: "Ba giờ năm phút chiều qua, Heo thu tiền của một khách.", sceneId: "supermarket", kind: "document" },
  { id: "duck_alibi", title: "Lời khai của Chú Vịt", zh: "昨天下午三点,我在海边工作。", vi: "Ba giờ chiều qua, tôi làm việc ở bãi biển.", sceneId: "beach", kind: "testimony" },
  { id: "beach_sand", title: "Cát ở bãi biển", zh: "海边的沙子是黄色的粗沙。", vi: "Cát ở bãi biển là cát vàng thô.", sceneId: "beach", kind: "object" },
  { id: "dog_slip", title: "Chó đổi lời", zh: "我……我只是想用它写一份报告,明天就还给她。", vi: "Tôi... tôi chỉ muốn dùng nó viết một bản báo cáo, mai trả cô ấy thôi.", sceneId: "office", kind: "testimony" },
  { id: "beach_log", title: "Sổ trực của bãi biển", zh: "鸭子昨天下午两点半就离开海边了。", vi: "Hôm qua Vịt đã rời bãi biển từ hai giờ rưỡi chiều.", sceneId: "beach", kind: "document" },
];

export const SUSPECTS: Suspect[] = [
  { id: "dog", name: "Chú Chó trưởng phòng", sprite: "dog", sceneId: "office", metFlag: "met:dog", note: "Nói ba giờ chiều họp ở văn phòng và thấy một con vịt chân dính cát. Nhưng biên bản nói họp bắt đầu lúc 3 giờ 20." },
  { id: "pig", name: "Cô Heo thu ngân", sprite: "pig", sceneId: "supermarket", metFlag: "met:pig", note: "Nói ba giờ chiều thu tiền ở siêu thị. Hóa đơn xác nhận cô ở quầy." },
  { id: "duck", name: "Chú Vịt cứu hộ", sprite: "duck", sceneId: "beach", metFlag: "met:duck", note: "Nói ba giờ chiều làm việc ở bãi biển nhưng sổ trực ghi anh rời đi từ 2 giờ rưỡi. Anh đã đi đâu?" },
];

export const OBJECTIVES: Objective[] = [
  { id: "talk-owl", sceneId: "library", text: "Nói chuyện với Cô Cú ở Thư viện để nhận vụ án.", done: { all: ["met:owl"] } },
  { id: "inspect-library", sceneId: "library", text: "Xem xét thư viện: tìm vệt mực trên sàn, thứ rơi ở cửa và phiếu mượn sách.", when: { all: ["met:owl"] }, done: { all: ["clue:ink_trail", "clue:pen_cap", "clue:library_card"] } },
  { id: "dog", sceneId: "office", text: "Đến Văn phòng: hỏi Chú Chó, xem biên bản cuộc họp và khay cát trên bàn.", when: { all: ["clue:ink_trail", "clue:pen_cap", "clue:library_card"] }, done: { all: ["met:dog", "clue:meeting_note", "clue:office_sand"] } },
  { id: "pig", sceneId: "supermarket", text: "Đến Siêu thị: hỏi Cô Heo và xem hóa đơn.", when: { all: ["met:dog", "clue:meeting_note", "clue:office_sand"] }, done: { all: ["met:pig", "clue:receipt"] } },
  { id: "duck", sceneId: "beach", text: "Đến Bãi biển: hỏi Chú Vịt, xem sổ trực và nắm cát trên bãi.", when: { all: ["met:pig", "clue:receipt"] }, done: { all: ["met:duck", "clue:beach_log", "clue:beach_sand"] } },
  { id: "confront", sceneId: "office", text: "Về Văn phòng, so cát và mốc giờ rồi hỏi lại Chú Chó.", when: { all: ["met:duck", "clue:beach_log", "clue:beach_sand"] }, done: { all: ["clue:dog_slip"] } },
  { id: "accuse", sceneId: "library", text: "Về Thư viện, nói với Cô Cú bạn biết ai đã lấy chiếc bút máy.", when: { all: ["clue:dog_slip"] }, done: { all: ["case:solved"] } },
];
