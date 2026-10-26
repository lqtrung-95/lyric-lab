import type { StorySceneDef } from "../../story-types";

/** Tiệm hoa: nhận vụ án từ Cô Mèo (báo mất lúc năm giờ), phát hiện đồng hồ chạy chậm hai tiếng nên giờ thật là ba giờ, cuối cùng buộc tội và nghe kết thúc. */
export const FLOWERSHOP_STORY: StorySceneDef = {
  sceneId: "flowershop",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:witness"] }, node: "o_ready" },
    { when: { all: ["met:cat"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "letter", clue: "letter", label: "Tờ giấy trên bàn", sprite: "note", x: 14, y: 86, w: 5, stand: { x: 20, y: 92 } },
    { id: "slow_clock", clue: "slow_clock", label: "Đồng hồ treo tường", sprite: "clock", x: 68, y: 30, w: 5, when: { all: ["met:cat"] }, stand: { x: 68, y: 44 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "cat", zh: "你好!我的大花束不见了!", vi: "Chào bạn! Bó hoa lớn của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "花束里有什么花?", vi: "Trong bó có hoa gì?", next: "o_inside" },
      ],
    },
    o_inside: { id: "o_inside", speaker: "cat", zh: "有玫瑰,还有百合。", vi: "Có hoa hồng và cả hoa bách hợp.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "cat", zh: "昨天下午五点。我看了墙上的钟。", vi: "Năm giờ chiều hôm qua. Tôi đã nhìn đồng hồ trên tường.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Cô Mèo nói bó hoa biến mất lúc nào?",
      choices: [
        { zh: "昨天上午五点", vi: "Năm giờ sáng hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天下午五点", vi: "Năm giờ chiều hôm qua", next: "o_ok", check: "right" },
        { zh: "今天下午五点", vi: "Năm giờ chiều hôm nay", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "cat", zh: "对!请你帮帮我。昨天来过的有三位朋友:修车的老虎、奶茶店的兔子,还有动物园的狐狸。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Hôm qua có ba người bạn ghé qua: hổ thợ máy, thỏ ở quán trà sữa và cáo ở sở thú.",
      effects: [{ flag: "met:cat" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "cat", zh: "请你先看看这个钟。我的钟有时候不太准。", vi: "Xin bạn xem cái đồng hồ này trước. Đồng hồ của tôi đôi khi không chuẩn lắm.", next: null },
    o_wait: { id: "o_wait", speaker: "cat", zh: "你找到什么了吗?快去问问他们吧。", vi: "Bạn tìm được gì chưa? Mau đi hỏi họ đi.", next: null },
    o_ready: {
      id: "o_ready", speaker: "cat", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "cat", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "cat", zh: "太好了!花束找到了!", vi: "Tuyệt quá! Tìm được bó hoa rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Cô Cáo đã thú nhận: cô lén lấy bó hoa lúc ba giờ, rồi mang đi giấu. Cô đã trả lại bó hoa cho Cô Mèo.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "cat", zh: "原来是我的钟慢了。谢谢你想得这么仔细!", vi: "Hóa ra là đồng hồ của tôi chạy chậm. Cảm ơn bạn đã nghĩ kỹ như vậy!", next: null },
  },
};
