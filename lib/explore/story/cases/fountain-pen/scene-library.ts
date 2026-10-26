import type { StorySceneDef } from "../../story-types";

/** Thư viện: nhận vụ án từ Cô Cú, xem vệt mực và nắp bút dính cát, cuối cùng buộc tội và nghe kết thúc. */
export const LIBRARY_STORY: StorySceneDef = {
  sceneId: "library",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "l_done" },
    { when: { all: ["clue:beach_log"] }, node: "l_ready" },
    { when: { all: ["met:owl"] }, node: "l_wait" },
    { node: "l_hi" },
  ],
  spots: [
    { id: "ink_trail", clue: "ink_trail", label: "Vệt mực trên sàn", sprite: "note", x: 46, y: 72, w: 4, when: { all: ["met:owl"] }, stand: { x: 46, y: 80 } },
    { id: "pen_cap", clue: "pen_cap", label: "Nắp bút ở cửa", sprite: "pen", x: 80, y: 88, w: 3.5, when: { all: ["met:owl"] } },
  ],
  dialogues: {
    l_hi: { id: "l_hi", speaker: "owl", zh: "你好!我的金笔不见了!", vi: "Chào bạn! Chiếc bút máy vàng của tôi biến mất rồi!", next: "l_ask" },
    l_ask: {
      id: "l_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "l_when" },
        { zh: "那支笔有什么特别?", vi: "Cây bút có gì đặc biệt?", next: "l_what" },
      ],
    },
    l_what: { id: "l_what", speaker: "owl", zh: "那是我奶奶送给我的。", vi: "Đó là bà nội tặng tôi.", next: "l_ask" },
    l_when: { id: "l_when", speaker: "owl", zh: "昨天下午三点。", vi: "Ba giờ chiều hôm qua.", next: "l_check" },
    l_check: {
      id: "l_check", speaker: "player", zh: "", vi: "Chiếc bút biến mất lúc nào?",
      choices: [
        { zh: "昨天上午三点", vi: "Ba giờ sáng hôm qua", next: "l_again", check: "wrong" },
        { zh: "昨天下午三点", vi: "Ba giờ chiều hôm qua", next: "l_ok", check: "right" },
        { zh: "今天下午三点", vi: "Ba giờ chiều hôm nay", next: "l_again", check: "wrong" },
      ],
    },
    l_again: { id: "l_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "l_when" },
    l_ok: {
      id: "l_ok", speaker: "owl", zh: "对!请你帮帮我。我怀疑三位朋友:办公室的狗、超市的猪和海边的鸭子。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Tôi nghi ba người bạn: chó ở văn phòng, heo ở siêu thị và vịt ở bãi biển.",
      effects: [{ flag: "met:owl" }], next: "l_task",
    },
    l_task: { id: "l_task", speaker: "owl", zh: "你先看看图书馆里有什么。", vi: "Bạn xem trong thư viện có gì trước đã nhé.", next: null },
    l_wait: { id: "l_wait", speaker: "owl", zh: "你找到什么了吗?快去问问他们吧。", vi: "Bạn tìm được gì chưa? Mau đi hỏi họ đi.", next: null },
    l_ready: {
      id: "l_ready", speaker: "owl", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    l_done: { id: "l_done", speaker: "owl", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    l_epi1: { id: "l_epi1", speaker: "owl", zh: "笔找到了!谢谢你!", vi: "Tìm được bút rồi! Cảm ơn bạn!", next: "l_epi2" },
    l_epi2: { id: "l_epi2", speaker: "player", zh: "", vi: "Chú Vịt thú nhận: anh chỉ định mượn bút để ký giấy tờ cho bãi biển rồi quên trả, và sợ bị mắng nên giấu đi.", next: "l_epi3" },
    l_epi3: { id: "l_epi3", speaker: "owl", zh: "没关系。下次要先问我。", vi: "Không sao. Lần sau phải hỏi tôi trước nhé.", next: "l_epi4" },
    l_epi4: { id: "l_epi4", speaker: "owl", zh: "我们一起去喝茶吧!", vi: "Mình cùng đi uống trà nhé!", next: null },
  },
};
