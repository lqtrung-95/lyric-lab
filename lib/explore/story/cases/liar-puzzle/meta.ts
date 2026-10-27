import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  dog: { name: "Chú Chó cảnh sát", sprite: "dog" },
  owl: { name: "Cụ Cú nhà khoa học", sprite: "owl" },
  pig: { name: "Anh Heo soát vé", sprite: "pig" },
  fox: { name: "Cô Cáo kiểm lâm", sprite: "fox" },
  bird: { name: "Cô Chim chủ trại", sprite: "bird" },
  duck: { name: "Chú Vịt thợ giặt", sprite: "duck" },
};

/** Đố nói thật nói dối: chỉ kẻ trộm nói dối. Cú: không phải Heo; Heo: là Cáo; Cáo: Heo nói dối; Chim: không phải tôi; Vịt: không phải tôi, cũng không phải Cú. Chỉ giả sử thủ phạm là Cáo thì mọi câu còn lại đều đúng và câu của Cáo sai. */
export const CLUES: ClueDef[] = [
  { id: "report", title: "Lời báo của Chú Chó", zh: "昨天晚上,派出所的金奖章不见了。", vi: "Tối qua, huy chương vàng của đồn công an biến mất.", sceneId: "police", kind: "testimony" },
  { id: "rule", title: "Quy tắc của vụ án", zh: "只有小偷会说谎,其他人说的都是真话。", vi: "Chỉ kẻ trộm mới nói dối, những người khác đều nói thật.", sceneId: "police", kind: "document" },
  { id: "cctv_broken", title: "Ghi chú về camera", zh: "监控昨天晚上坏了,什么也没拍到。", vi: "Camera đêm qua bị hỏng, không quay được gì.", sceneId: "police", kind: "document" },
  { id: "owl_say", title: "Lời khai của Cụ Cú", zh: "不是小猪干的。", vi: "Không phải Heo làm.", sceneId: "lab", kind: "testimony" },
  { id: "smudge", title: "Dấu vân tay mờ", zh: "桌子上的指纹太模糊了,看不清是谁的。", vi: "Dấu vân tay trên bàn quá mờ, không nhìn ra của ai.", sceneId: "lab", kind: "object" },
  { id: "pig_say", title: "Lời khai của Anh Heo", zh: "是狐狸干的。", vi: "Là Cáo làm.", sceneId: "subway", kind: "testimony" },
  { id: "fox_say", title: "Lời khai của Cô Cáo", zh: "小猪在说谎。", vi: "Heo đang nói dối.", sceneId: "camping", kind: "testimony" },
  { id: "bird_say", title: "Lời khai của Cô Chim", zh: "不是我干的。", vi: "Không phải tôi làm.", sceneId: "farm", kind: "testimony" },
  { id: "duck_say", title: "Lời khai của Chú Vịt", zh: "不是我,也不是猫头鹰。", vi: "Không phải tôi, cũng không phải Cú.", sceneId: "laundry", kind: "testimony" },
  { id: "laundry_note", title: "Phiếu của tiệm giặt", zh: "昨天晚上,洗衣店八点就关门了。", vi: "Tối qua, tiệm giặt là đóng cửa từ tám giờ.", sceneId: "laundry", kind: "document" },
];

export const SUSPECTS: Suspect[] = [
  { id: "owl", name: "Cụ Cú nhà khoa học", sprite: "owl", sceneId: "lab", metFlag: "met:owl", note: "Nói một câu về Heo." },
  { id: "pig", name: "Anh Heo soát vé", sprite: "pig", sceneId: "subway", metFlag: "met:pig", note: "Nói một câu về Cáo." },
  { id: "fox", name: "Cô Cáo kiểm lâm", sprite: "fox", sceneId: "camping", metFlag: "met:fox", note: "Nói một câu về Heo." },
  { id: "bird", name: "Cô Chim chủ trại", sprite: "bird", sceneId: "farm", metFlag: "met:bird", note: "Nói một câu về chính mình." },
  { id: "duck", name: "Chú Vịt thợ giặt", sprite: "duck", sceneId: "laundry", metFlag: "met:duck", note: "Nói một câu về mình và Cú." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-dog", sceneId: "police", text: "Nói chuyện với Chú Chó ở Đồn cảnh sát để nhận vụ án.", done: { all: ["met:dog"] } },
  { id: "inspect", sceneId: "police", text: "Xem xét đồn: đọc lời báo, quy tắc của vụ án và ghi chú về camera.", when: { all: ["met:dog"] }, done: { all: ["clue:report", "clue:rule", "clue:cctv_broken"] } },
  { id: "owl", sceneId: "lab", text: "Đến Phòng thí nghiệm: hỏi Cụ Cú, xem dấu vân tay.", when: { all: ["clue:report", "clue:rule", "clue:cctv_broken"] }, done: { all: ["met:owl", "clue:smudge"] } },
  { id: "pig", sceneId: "subway", text: "Đến Ga tàu điện ngầm: hỏi Anh Heo.", when: { all: ["met:owl", "clue:smudge"] }, done: { all: ["met:pig"] } },
  { id: "fox", sceneId: "camping", text: "Đến Khu cắm trại: hỏi Cô Cáo.", when: { all: ["met:pig"] }, done: { all: ["met:fox"] } },
  { id: "bird", sceneId: "farm", text: "Đến Nông trại: hỏi Cô Chim.", when: { all: ["met:fox"] }, done: { all: ["met:bird"] } },
  { id: "duck", sceneId: "laundry", text: "Đến Tiệm giặt là: hỏi Chú Vịt và xem phiếu của tiệm.", when: { all: ["met:bird"] }, done: { all: ["met:duck", "clue:laundry_note"] } },
  { id: "accuse", sceneId: "police", text: "Về Đồn cảnh sát. Nhớ quy tắc: chỉ kẻ trộm nói dối. Xét từng câu để biết ai nói dối, rồi nói với Chú Chó.", when: { all: ["met:duck", "clue:laundry_note"] }, done: { all: ["case:solved"] } },
];
