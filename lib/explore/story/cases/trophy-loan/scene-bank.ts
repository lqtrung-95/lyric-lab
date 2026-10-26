import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!需要办什么业务?", vi: "Chào bạn! Cần làm giao dịch gì?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Chiều qua lúc 3 giờ cô ở đâu?" },
  chatter: [
    { ask: { zh: "现在人多吗?", vi: "Bây giờ có đông không?" }, reply: { zh: "不多。", vi: "Không đông." } },
    { ask: { zh: "你们几点关门?", vi: "Mấy giờ ngân hàng đóng cửa?" }, reply: { zh: "下午五点。", vi: "Năm giờ chiều." } },
  ],
  answer: { zh: "昨天下午三点,我在银行上班。", vi: "Chiều qua lúc 3 giờ, tôi làm việc ở ngân hàng." },
  check: { vi: "Cô Cáo nói chiều qua lúc 3 giờ cô ở đâu?", right: { zh: "在银行上班", vi: "Làm việc ở ngân hàng" }, wrong: [{ zh: "在博物馆", vi: "Ở bảo tàng" }, { zh: "在健身房", vi: "Ở phòng gym" }], rightAt: 0 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "你可以再问我别的事。", vi: "Bạn có thể hỏi tôi việc khác." },
  after: { zh: "还想问什么?", vi: "Bạn còn muốn hỏi gì?" },
});

/** Ngân hàng: Cáo có lời khai bình thường; khi bạn đã thấy lớp bụi, câu hỏi về lần cuối thấy cúp mở ra và Cáo kể đã thấy Chó mang hộp vàng đi bảo tàng tuần trước. */
export const BANK_STORY: StorySceneDef = {
  sceneId: "bank",
  sceneNpcEntries: [
    { when: { all: ["met:fox", "clue:dust_shelf"], none: ["saw:fox"] }, node: "fox2_hi" },
    ...fox.entries,
  ],
  spots: [

  ],
  dialogues: {
    ...fox.nodes,
    fox2_hi: { id: "fox2_hi", speaker: "fox", zh: "你又来了?有什么事?", vi: "Bạn lại đến à? Có việc gì?", next: "fox2_ask" },
    fox2_ask: {
      id: "fox2_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "您还记得最后一次看见奖杯是什么时候吗?", vi: "Cô còn nhớ lần cuối cô thấy chiếc cúp là khi nào không?", next: "fox2_ans" },
        { zh: "没事,再见。", vi: "Không có gì, tạm biệt cô.", next: null },
      ],
    },
    fox2_ans: { id: "fox2_ans", speaker: "fox", zh: "上个星期二,我看见小狗拿着一个金色的盒子走向博物馆。", vi: "Thứ Ba tuần trước, tôi thấy Chó cầm một cái hộp màu vàng đi về phía bảo tàng.", next: "fox2_check" },
    fox2_check: {
      id: "fox2_check", speaker: "player", zh: "", vi: "Cô Cáo thấy ai, khi nào, đi đâu?",
      choices: [
        { zh: "昨天,小兔子,走向电影院", vi: "Hôm qua, Thỏ, đi về rạp phim", next: "fox2_again", check: "wrong" },
        { zh: "上星期二,小狗,走向博物馆", vi: "Thứ Ba tuần trước, Chó, đi về bảo tàng", next: "fox2_ok", check: "right" },
        { zh: "今天,小猫,走向银行", vi: "Hôm nay, Mèo, đi về ngân hàng", next: "fox2_again", check: "wrong" },
      ],
    },
    fox2_again: { id: "fox2_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại lời khai nào…", next: "fox2_ans" },
    fox2_ok: { id: "fox2_ok", speaker: "player", zh: "", vi: "Đã ghi lời khai vào sổ vụ án.", effects: [{ clue: "witness_fox" }, { flag: "saw:fox" }], next: "fox2_close" },
    fox2_close: { id: "fox2_close", speaker: "fox", zh: "那个盒子在太阳下很亮。", vi: "Cái hộp ấy dưới nắng sáng lóa.", next: null },
  },
};
