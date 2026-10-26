import type { StorySceneDef } from "../../story-types";

/** Cửa hàng điện thoại: nhận vụ án từ Anh Heo, xem lời báo án và chiếc điện thoại giả có nhãn hiệu thuốc, cuối cùng buộc tội và nghe kết thúc. */
export const PHONESHOP_STORY: StorySceneDef = {
  sceneId: "phoneshop",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:witness"] }, node: "o_ready" },
    { when: { all: ["met:pig"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "report", clue: "report", label: "Lời báo án trên bàn", sprite: "note", x: 14, y: 86, w: 5, stand: { x: 20, y: 92 } },
    { id: "fake_phone", clue: "fake_phone", label: "Chiếc điện thoại giả", sprite: "phone", x: 68, y: 92, w: 4, when: { all: ["met:pig"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "pig", zh: "你好!我的新手机被换成假的了!", vi: "Chào bạn! Điện thoại mới của tôi bị tráo thành đồ giả rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候换的?", vi: "Bị tráo lúc nào vậy?", next: "o_when" },
        { zh: "你在哪儿吃饭?", vi: "Anh ăn cơm ở đâu?", next: "o_where" },
      ],
    },
    o_where: { id: "o_where", speaker: "pig", zh: "我在火锅店吃饭。", vi: "Tôi ăn ở quán lẩu.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "pig", zh: "昨天晚上七点。", vi: "Bảy giờ tối hôm qua.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Điện thoại bị tráo lúc nào?",
      choices: [
        { zh: "昨天下午七点", vi: "Bảy giờ chiều hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天晚上七点", vi: "Bảy giờ tối hôm qua", next: "o_ok", check: "right" },
        { zh: "今天晚上七点", vi: "Bảy giờ tối hôm nay", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "pig", zh: "对!请你帮帮我。我怀疑三位朋友:药店的狐狸、理发的猫,还有邮局的兔子。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Tôi nghi ba người bạn: cáo ở hiệu thuốc, mèo thợ tóc và thỏ ở bưu điện.",
      effects: [{ flag: "met:pig" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "pig", zh: "请你先看看那个假手机。线索可能不是真的,你要想清楚。", vi: "Xin bạn xem chiếc điện thoại giả trước. Manh mối có thể không thật, bạn phải nghĩ cho kỹ.", next: null },
    o_wait: { id: "o_wait", speaker: "pig", zh: "你找到什么了吗?快去问问他们吧。", vi: "Bạn tìm được gì chưa? Mau đi hỏi họ đi.", next: null },
    o_ready: {
      id: "o_ready", speaker: "pig", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "pig", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "pig", zh: "太好了!我的手机找到了!", vi: "Tuyệt quá! Tìm được điện thoại của tôi rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Bác Thỏ đã thú nhận: bác lấy nhãn của hiệu thuốc dán lên chiếc điện thoại giả để đổ tội cho Cô Cáo, rồi trả lại điện thoại thật cho Anh Heo.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "pig", zh: "原来线索也会骗人。谢谢你没有相信它!", vi: "Hóa ra manh mối cũng có thể đánh lừa. Cảm ơn bạn đã không tin nó!", next: null },
  },
};
