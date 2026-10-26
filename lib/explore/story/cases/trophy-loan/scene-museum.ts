import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const owl = buildInterview({
  prefix: "owl", speaker: "owl",
  greeting: { zh: "欢迎来到博物馆!", vi: "Chào mừng đến bảo tàng!" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Chiều qua lúc 3 giờ cô ở đâu?" },
  chatter: [
    { ask: { zh: "这幅画是谁画的?", vi: "Bức tranh này ai vẽ?" }, reply: { zh: "是一位古代的画家。", vi: "Là một họa sĩ cổ đại." } },
    { ask: { zh: "展览几点结束?", vi: "Triển lãm mấy giờ kết thúc?" }, reply: { zh: "下午五点。", vi: "Năm giờ chiều." } },
  ],
  answer: { zh: "昨天下午三点,我在博物馆开会。", vi: "Chiều qua lúc 3 giờ, tôi họp ở bảo tàng." },
  check: { vi: "Cô Cú nói chiều qua lúc 3 giờ cô ở đâu?", right: { zh: "在博物馆开会", vi: "Họp ở bảo tàng" }, wrong: [{ zh: "在健身房", vi: "Ở phòng gym" }, { zh: "在理发店", vi: "Ở hiệu tóc" }], rightAt: 2 },
  clue: "owl_alibi", metFlag: "met:owl",
  closing: { zh: "借展单在展柜旁边。", vi: "Đơn mượn trưng bày ở cạnh tủ trưng bày." },
  after: { zh: "你还想参观吗?", vi: "Bạn còn muốn tham quan không?" },
});

/** Bảo tàng: đơn mượn trưng bày ghi tên Chó là người cho mượn cúp (bước ngoặt của vụ án). */
export const MUSEUM_STORY: StorySceneDef = {
  sceneId: "museum",
  sceneNpcEntries: owl.entries,
  spots: [
    { id: "loan_form", clue: "loan_form", label: "Đơn mượn trưng bày", sprite: "clipboard", x: 22, y: 30, w: 5, when: { all: ["met:owl"] }, stand: { x: 22, y: 46 } },
  ],
  dialogues: owl.nodes,
};
