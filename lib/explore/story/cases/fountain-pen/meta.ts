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
  { id: "pen_cap", title: "Nắp bút rơi ở cửa", zh: "门口有一个笔帽,上面有沙子。", vi: "Ở cửa có một cái nắp bút, trên đó dính cát.", sceneId: "library", kind: "object" },
  { id: "dog_alibi", title: "Lời khai của Chú Chó", zh: "我在办公室开会。三点前,我看见一只鸭子走过,脚上有沙子。", vi: "Tôi họp ở văn phòng. Trước ba giờ, tôi thấy một con vịt đi qua, chân dính cát.", sceneId: "office", kind: "testimony" },
  { id: "meeting_note", title: "Biên bản cuộc họp", zh: "昨天下午三点,办公室有一个会。小狗一直在会议室里。", vi: "Ba giờ chiều qua, văn phòng có một cuộc họp. Chó ở phòng họp suốt.", sceneId: "office", kind: "document" },
  { id: "pig_alibi", title: "Lời khai của Cô Heo", zh: "昨天下午三点,我在超市收钱。", vi: "Ba giờ chiều qua, tôi thu tiền ở siêu thị.", sceneId: "supermarket", kind: "testimony" },
  { id: "receipt", title: "Hóa đơn siêu thị", zh: "昨天下午三点零五分,小猪收了一个客人的钱。", vi: "Ba giờ năm phút chiều qua, Heo thu tiền của một khách.", sceneId: "supermarket", kind: "document" },
  { id: "duck_alibi", title: "Lời khai của Chú Vịt", zh: "昨天下午三点,我在海边工作。", vi: "Ba giờ chiều qua, tôi làm việc ở bãi biển.", sceneId: "beach", kind: "testimony" },
  { id: "beach_log", title: "Sổ trực của bãi biển", zh: "鸭子昨天下午两点半就离开海边了。", vi: "Hôm qua Vịt đã rời bãi biển từ hai giờ rưỡi chiều.", sceneId: "beach", kind: "document" },
];

export const SUSPECTS: Suspect[] = [
  { id: "dog", name: "Chú Chó trưởng phòng", sprite: "dog", sceneId: "office", metFlag: "met:dog", note: "Nói ba giờ chiều họp ở văn phòng. Biên bản họp xác nhận, và ông thấy một con vịt chân dính cát." },
  { id: "pig", name: "Cô Heo thu ngân", sprite: "pig", sceneId: "supermarket", metFlag: "met:pig", note: "Nói ba giờ chiều thu tiền ở siêu thị. Hóa đơn xác nhận cô ở quầy." },
  { id: "duck", name: "Chú Vịt cứu hộ", sprite: "duck", sceneId: "beach", metFlag: "met:duck", note: "Nói ba giờ chiều làm việc ở bãi biển. Nhưng có điều gì đó không khớp…" },
];

export const OBJECTIVES: Objective[] = [
  { id: "talk-owl", sceneId: "library", text: "Nói chuyện với Cô Cú ở Thư viện để nhận vụ án.", done: { all: ["met:owl"] } },
  { id: "inspect-library", sceneId: "library", text: "Xem xét thư viện: tìm vệt mực trên sàn và thứ rơi ở cửa.", when: { all: ["met:owl"] }, done: { all: ["clue:ink_trail", "clue:pen_cap"] } },
  { id: "dog", sceneId: "office", text: "Đến Văn phòng: hỏi Chú Chó và xem biên bản cuộc họp.", when: { all: ["clue:ink_trail", "clue:pen_cap"] }, done: { all: ["met:dog", "clue:meeting_note"] } },
  { id: "pig", sceneId: "supermarket", text: "Đến Siêu thị: hỏi Cô Heo và xem hóa đơn.", when: { all: ["met:dog", "clue:meeting_note"] }, done: { all: ["met:pig", "clue:receipt"] } },
  { id: "duck", sceneId: "beach", text: "Đến Bãi biển: hỏi Chú Vịt và xem sổ trực.", when: { all: ["met:pig", "clue:receipt"] }, done: { all: ["met:duck", "clue:beach_log"] } },
  { id: "accuse", sceneId: "library", text: "Về Thư viện, nói với Cô Cú bạn biết ai đã lấy chiếc bút máy.", when: { all: ["clue:beach_log"] }, done: { all: ["case:solved"] } },
];
