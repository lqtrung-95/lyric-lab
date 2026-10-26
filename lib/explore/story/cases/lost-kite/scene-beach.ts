import type { StorySceneDef } from "../../story-types";

/** Bãi biển: nhận vụ án từ Chú Vịt, xem dây diều và dấu chân trên cát, cuối cùng buộc tội và nghe kết thúc. */
export const BEACH_STORY: StorySceneDef = {
  sceneId: "beach",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "b_done" },
    { when: { all: ["clue:witness_turtle"] }, node: "b_ready" },
    { when: { all: ["met:duck"] }, node: "b_wait" },
    { node: "b_hi" },
  ],
  spots: [
    { id: "kite_string", clue: "kite_string", label: "Đoạn dây đỏ", sprite: "note", x: 38, y: 78, w: 4, when: { all: ["met:duck"] } },
    { id: "paw_print", clue: "paw_print", label: "Dấu chân trên cát", sprite: "note", x: 52, y: 80, w: 4, when: { all: ["met:duck"] } },
  ],
  dialogues: {
    b_hi: { id: "b_hi", speaker: "duck", zh: "你好!我的风筝不见了!", vi: "Chào bạn! Con diều của tôi biến mất rồi!", next: "b_ask" },
    b_ask: {
      id: "b_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "风筝什么时候不见的?", vi: "Diều mất lúc nào?", next: "b_when" },
        { zh: "风筝是什么颜色的?", vi: "Con diều màu gì?", next: "b_color" },
      ],
    },
    b_color: { id: "b_color", speaker: "duck", zh: "是红色的。", vi: "Màu đỏ.", next: "b_ask" },
    b_when: { id: "b_when", speaker: "duck", zh: "昨天中午十二点。", vi: "Mười hai giờ trưa hôm qua.", next: "b_check" },
    b_check: {
      id: "b_check", speaker: "player", zh: "", vi: "Con diều biến mất lúc nào?",
      choices: [
        { zh: "昨天晚上十二点", vi: "Mười hai giờ đêm qua", next: "b_again", check: "wrong" },
        { zh: "昨天中午十二点", vi: "Mười hai giờ trưa hôm qua", next: "b_ok", check: "right" },
        { zh: "今天早上八点", vi: "Tám giờ sáng nay", next: "b_again", check: "wrong" },
      ],
    },
    b_again: { id: "b_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "b_when" },
    b_ok: {
      id: "b_ok", speaker: "duck", zh: "对!请你帮帮我。我怀疑四位朋友:卖衣服的狗、超市的猪、学校的鸟和市场的猫。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Tôi nghi bốn người bạn: chó bán quần áo, heo ở siêu thị, chim ở trường và mèo ở chợ.",
      effects: [{ flag: "met:duck" }], next: "b_task",
    },
    b_task: { id: "b_task", speaker: "duck", zh: "你先看看沙滩上有什么。", vi: "Bạn xem trên bãi cát có gì trước đã nhé.", next: null },
    b_wait: { id: "b_wait", speaker: "duck", zh: "你找到什么了吗?要小心比较脚印。", vi: "Bạn tìm được gì chưa? Nhớ so sánh các dấu chân cho cẩn thận.", next: null },
    b_ready: {
      id: "b_ready", speaker: "duck", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    b_done: { id: "b_done", speaker: "duck", zh: "谢谢你!你是最好的侦探。", vi: "Cảm ơn bạn! Bạn là thám tử giỏi nhất.", next: null },
    b_epi1: { id: "b_epi1", speaker: "duck", zh: "风筝找到了!谢谢你!", vi: "Tìm được diều rồi! Cảm ơn bạn!", next: "b_epi2" },
    b_epi2: { id: "b_epi2", speaker: "player", zh: "", vi: "Cô Mèo thú nhận: cô muốn mượn diều cho mèo con chơi trong giờ nghỉ trưa nhưng quên xin phép.", next: "b_epi3" },
    b_epi3: { id: "b_epi3", speaker: "duck", zh: "没关系。下次先问我。", vi: "Không sao. Lần sau hãy hỏi tôi trước.", next: "b_epi4" },
    b_epi4: { id: "b_epi4", speaker: "duck", zh: "我们一起放风筝吧!", vi: "Mình cùng thả diều nhé!", next: null },
  },
};
