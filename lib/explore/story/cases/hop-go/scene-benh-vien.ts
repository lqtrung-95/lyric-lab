import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!你不舒服吗?", vi: "Chào bạn! Bạn không khỏe à?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều hôm qua bác sĩ ở đâu?" },
  chatter: [
    { ask: { zh: "我头疼,怎么办?", vi: "Tôi đau đầu, làm sao đây?" }, reply: { zh: "多喝水,多休息。", vi: "Uống nhiều nước, nghỉ ngơi nhiều." } },
    { ask: { zh: "你今天累吗?", vi: "Hôm nay bác sĩ có mệt không?" }, reply: { zh: "有一点儿累。", vi: "Hơi mệt một chút." } },
  ],
  answer: { zh: "昨天我生病了,一天都在医院睡觉。", vi: "Hôm qua tôi bị ốm, cả ngày ngủ ở bệnh viện." },
  check: { vi: "Bác sĩ Cáo nói hôm qua ông làm gì ở bệnh viện?", right: { zh: "睡觉", vi: "Ngủ" }, wrong: [{ zh: "工作", vi: "Làm việc" }, { zh: "吃饭", vi: "Ăn cơm" }], rightAt: 1 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "我现在还有点累。你可以看看桌子和墙上的东西。", vi: "Bây giờ tôi vẫn hơi mệt. Bạn có thể xem đồ trên bàn và trên tường." },
  after: { zh: "我要休息了。你还有事吗?", vi: "Tôi cần nghỉ ngơi. Bạn còn việc gì không?" },
});

/** Bệnh viện: Bác sĩ Cáo khai ốm và ngủ cả ngày; nhưng bảng ký tên cho thấy ông rời bệnh viện từ hai giờ, và trên bàn toàn bút xanh. */
export const BENH_VIEN_STORY: StorySceneDef = {
  sceneId: "benh-vien",
  sceneNpcEntries: fox.entries,
  spots: [
    { id: "sign_sheet", clue: "sign_sheet", label: "Bảng ký tên ra vào", sprite: "clipboard", x: 13, y: 29, w: 5, when: { all: ["met:fox"] }, stand: { x: 13, y: 42 } },
    { id: "pens_jar", clue: "pens_jar", label: "Ống bút trên bàn", sprite: "pens", x: 31, y: 63, w: 4, when: { all: ["met:fox"] }, stand: { x: 31, y: 86 } },
  ],
  dialogues: fox.nodes,
};
