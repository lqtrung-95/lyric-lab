import type { StorySceneDef } from "../../story-types";

/** Ngân hàng: Cáo mất một phong bì tiền; kẻ trộm đánh rơi danh sách mua sắm chỉ có chữ Hán (không bản dịch). */
export const BANK_STORY: StorySceneDef = {
  sceneId: "bank",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:pig_slip"] }, node: "o_ready" },
    { when: { all: ["met:fox"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "shopping_list", clue: "shopping_list", label: "Tờ danh sách trên quầy", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:fox"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "fox", zh: "你好!我的钱不见了!", vi: "Chào bạn! Tiền của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "钱放在哪里?", vi: "Tiền để ở đâu?", next: "o_a0" },
      ],
    },
    o_a0: { id: "o_a0", speaker: "fox", zh: "放在柜台下面的信封里。", vi: "Để trong phong bì dưới quầy.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "fox", zh: "昨天下午。", vi: "Chiều hôm qua.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Tiền biến mất lúc nào?",
      choices: [
        { zh: "昨天上午", vi: "Sáng hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天下午", vi: "Chiều hôm qua", next: "o_ok", check: "right" },
        { zh: "今天下午", vi: "Chiều nay", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "fox", zh: "对!请你帮帮我。小偷用我的钱去买了东西,还留下了一张购物清单。昨天来过的有四位朋友:猫、狗、鸭子和猪。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Kẻ trộm dùng tiền của tôi đi mua đồ và để lại một danh sách mua sắm. Hôm qua có bốn người bạn ghé qua: mèo, chó, vịt và heo.",
      effects: [{ flag: "met:fox" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "fox", zh: "请你自己读一读清单,再去看看每个人的购物袋。", vi: "Hãy tự đọc kỹ danh sách, rồi đi xem túi đồ của từng người.", next: null },
    o_wait: { id: "o_wait", speaker: "fox", zh: "你找到什么了吗?再仔细看看。", vi: "Bạn tìm được gì chưa? Hãy xem kỹ thêm nữa.", next: null },
    o_ready: {
      id: "o_ready", speaker: "fox", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "fox", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "fox", zh: "太好了!钱找到了!", vi: "Tuyệt quá! Tìm được tiền rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Anh Heo đã thú nhận: anh lấy tiền để mua đồ ăn ngon rồi bỏ quên tờ danh sách. Anh đã trả lại số tiền chưa tiêu và xin lỗi.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "fox", zh: "我们一起吃鱼吧!", vi: "Mình cùng ăn cá nhé!", next: null },
  },
};
