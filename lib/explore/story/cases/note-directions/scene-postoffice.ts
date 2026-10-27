import type { StorySceneDef } from "../../story-types";

/** Bưu điện: Bác Thỏ mất bưu kiện; kẻ trộm để lại hai mảnh giấy tả nhà mình bằng tiếng Trung (hướng và khoảng cách), không có bản dịch. */
export const POSTOFFICE_STORY: StorySceneDef = {
  sceneId: "postoffice",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:dog_slip"] }, node: "o_ready" },
    { when: { all: ["met:rabbit"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "note_east", clue: "note_east", label: "Mảnh giấy trên quầy", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 20, y: 92 } },
    { id: "note_dist", clue: "note_dist", label: "Mảnh giấy dưới sàn", sprite: "letter", x: 68, y: 92, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "rabbit", zh: "你好!我的包裹不见了!", vi: "Chào bạn! Bưu kiện của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "包裹里有什么?", vi: "Trong bưu kiện có gì?", next: "o_a0" },
      ],
    },
    o_a0: { id: "o_a0", speaker: "rabbit", zh: "里面有一套新茶具。", vi: "Bên trong có một bộ ấm trà mới.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "rabbit", zh: "昨天下午。", vi: "Chiều hôm qua.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Bưu kiện biến mất lúc nào?",
      choices: [
        { zh: "昨天上午", vi: "Sáng hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天下午", vi: "Chiều hôm qua", next: "o_ok", check: "right" },
        { zh: "今天下午", vi: "Chiều nay", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "rabbit", zh: "对!请你帮帮我。小偷留下了两张纸条。昨天来过的有四位朋友:猫、狗、鸭子和猪。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Kẻ trộm để lại hai mảnh giấy. Hôm qua có bốn người bạn ghé qua: mèo, chó, vịt và heo.",
      effects: [{ flag: "met:rabbit" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "rabbit", zh: "请你自己读一读纸条,再去看看每个人的家。", vi: "Hãy tự đọc kỹ hai mảnh giấy, rồi đi xem nhà của từng người.", next: null },
    o_wait: { id: "o_wait", speaker: "rabbit", zh: "你找到什么了吗?再仔细看看。", vi: "Bạn tìm được gì chưa? Hãy xem kỹ thêm nữa.", next: null },
    o_ready: {
      id: "o_ready", speaker: "rabbit", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "rabbit", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "rabbit", zh: "太好了!包裹找到了!", vi: "Tuyệt quá! Tìm được bưu kiện rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Chú Chó đã thú nhận: ông tò mò muốn xem bộ ấm trà nên lén lấy, rồi để lại hai mảnh giấy mà không biết chúng tố cáo chính nhà mình. Ông đã trả lại bộ ấm trà.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "rabbit", zh: "茶具还在。我们去喝茶吧!", vi: "Bộ ấm trà vẫn còn. Mình đi uống trà nhé!", next: null },
  },
};
