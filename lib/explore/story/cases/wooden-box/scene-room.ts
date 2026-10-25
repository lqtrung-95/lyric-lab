import type { StorySceneDef } from "../../story-types";

/** Phòng của bạn: nhận vụ án từ Cú Thầy, xem thư và bút xanh, cuối cùng buộc tội và nghe kết thúc. */
export const ROOM_STORY: StorySceneDef = {
  sceneId: "room",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:witness"] }, node: "o_ready" },
    { when: { all: ["met:owl"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "letter", clue: "letter", label: "Lá thư trên giường", sprite: "letter", x: 25, y: 64, w: 4.5, stand: { x: 28, y: 76 } },
    { id: "pen", clue: "pen", label: "Cây bút cạnh cửa sổ", sprite: "pen", x: 30, y: 27.8, w: 3.5, when: { all: ["met:owl"] } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "owl", zh: "你好!我的木盒子不见了!", vi: "Chào bạn! Hộp gỗ của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "盒子里有什么?", vi: "Trong hộp có gì?", next: "o_inside" },
      ],
    },
    o_inside: { id: "o_inside", speaker: "owl", zh: "里面有爷爷的信。", vi: "Bên trong có thư của ông nội.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "owl", zh: "昨天下午三点。", vi: "Ba giờ chiều hôm qua.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Hộp gỗ biến mất lúc nào?",
      choices: [
        { zh: "昨天上午三点", vi: "Ba giờ sáng hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天下午三点", vi: "Ba giờ chiều hôm qua", next: "o_ok", check: "right" },
        { zh: "今天下午三点", vi: "Ba giờ chiều hôm nay", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "owl", zh: "对!请你帮帮我。昨天来我家的有四位朋友:厨师、卖水果的猫、火车站的兔子,还有医生。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Hôm qua có bốn người bạn đến nhà tôi: đầu bếp, mèo bán trái cây, thỏ ở ga tàu, và bác sĩ.",
      effects: [{ flag: "met:owl" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "owl", zh: "请你去问问他们:昨天下午三点,你们在哪儿?", vi: "Xin bạn đi hỏi họ: ba giờ chiều hôm qua, các bạn ở đâu?", next: null },
    o_wait: { id: "o_wait", speaker: "owl", zh: "你找到什么了吗?快去问问他们吧。", vi: "Bạn tìm được gì chưa? Mau đi hỏi họ đi.", next: null },
    o_ready: {
      id: "o_ready", speaker: "owl", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "owl", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "owl", zh: "太好了!盒子找到了!", vi: "Tuyệt quá! Tìm được hộp rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Bác sĩ Cáo đã thú nhận và trả lại chiếc hộp gỗ cho Cú Thầy.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "owl", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: "o_epi4" },
    o_epi4: { id: "o_epi4", speaker: "owl", zh: "爷爷的信还在里面。我们去喝茶吧!", vi: "Thư của ông nội vẫn còn bên trong. Mình đi uống trà nhé!", next: null },
  },
};
