import type { StorySceneDef } from "../../story-types";

/** Khách sạn: nhận vụ án từ Chú Vịt, xem sổ khách và chiếc ô đỏ, cuối cùng buộc tội và nghe kết thúc. */
export const HOTEL_STORY: StorySceneDef = {
  sceneId: "hotel",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "d_done" },
    { when: { all: ["clue:witness_turtle"] }, node: "d_ready" },
    { when: { all: ["met:duck"] }, node: "d_wait" },
    { node: "d_hi" },
  ],
  spots: [
    { id: "guest_book", clue: "guest_book", label: "Sổ khách ở sảnh", sprite: "clipboard", x: 84, y: 30, w: 5, when: { all: ["met:duck"] }, stand: { x: 84, y: 46 } },
    { id: "umbrella", clue: "umbrella", label: "Chiếc ô đỏ", sprite: "umbrella", x: 48, y: 74, w: 6, when: { all: ["met:duck"] }, stand: { x: 48, y: 82 } },
  ],
  dialogues: {
    d_hi: { id: "d_hi", speaker: "duck", zh: "你好!酒店的金钥匙不见了!", vi: "Chào bạn! Chìa khóa vàng của khách sạn biến mất rồi!", next: "d_ask" },
    d_ask: {
      id: "d_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "d_when" },
        { zh: "钥匙是做什么的?", vi: "Chìa khóa dùng để làm gì?", next: "d_what" },
      ],
    },
    d_what: { id: "d_what", speaker: "duck", zh: "它能打开酒店的保险箱。", vi: "Nó mở được két sắt của khách sạn.", next: "d_ask" },
    d_when: { id: "d_when", speaker: "duck", zh: "昨天晚上八点钥匙还在。九点就不见了。", vi: "Tối qua tám giờ chìa khóa vẫn còn. Chín giờ thì mất.", next: "d_check" },
    d_check: {
      id: "d_check", speaker: "player", zh: "", vi: "Chìa khóa vàng biến mất vào lúc nào?",
      choices: [
        { zh: "昨天早上八点", vi: "Tám giờ sáng hôm qua", next: "d_again", check: "wrong" },
        { zh: "昨天晚上八点到九点", vi: "Từ tám đến chín giờ tối qua", next: "d_ok", check: "right" },
        { zh: "今天晚上九点", vi: "Chín giờ tối nay", next: "d_again", check: "wrong" },
      ],
    },
    d_again: { id: "d_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "d_when" },
    d_ok: {
      id: "d_ok", speaker: "duck", zh: "对!请你帮帮我。我怀疑四位朋友:卖衣服的狗、学校的老师、火车站的兔子和机场的猪。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Tôi nghi bốn người bạn: chó bán quần áo, cô giáo ở trường, thỏ ở ga tàu và heo ở sân bay.",
      effects: [{ flag: "met:duck" }], next: "d_task",
    },
    d_task: { id: "d_task", speaker: "duck", zh: "你先看看大厅里有什么。", vi: "Bạn xem trong sảnh có gì trước đã nhé.", next: null },
    d_wait: { id: "d_wait", speaker: "duck", zh: "你找到什么了吗?别忘了比较大家说的话。", vi: "Bạn tìm được gì chưa? Đừng quên so sánh lời mọi người nói.", next: null },
    d_ready: {
      id: "d_ready", speaker: "duck", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    d_done: { id: "d_done", speaker: "duck", zh: "谢谢你!你是最好的侦探。", vi: "Cảm ơn bạn! Bạn là thám tử giỏi nhất.", next: null },
    d_epi1: { id: "d_epi1", speaker: "duck", zh: "钥匙找到了!谢谢你!", vi: "Tìm được chìa khóa rồi! Cảm ơn bạn!", next: "d_epi2" },
    d_epi2: { id: "d_epi2", speaker: "player", zh: "", vi: "Cô Chim thú nhận và trả lại chìa khóa vàng. Cô nói đã định mượn chìa để lấy cuốn sổ của mình trong két sắt, nhưng sợ bị hỏi nên đã lấy lén.", next: "d_epi3" },
    d_epi3: { id: "d_epi3", speaker: "duck", zh: "没关系。下次请先告诉我。", vi: "Không sao. Lần sau xin hãy nói với tôi trước.", next: "d_epi4" },
    d_epi4: { id: "d_epi4", speaker: "duck", zh: "今天晚上我请你喝茶!", vi: "Tối nay mình mời bạn uống trà!", next: null },
  },
};
