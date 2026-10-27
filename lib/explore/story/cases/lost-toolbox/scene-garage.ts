import type { StorySceneDef } from "../../story-types";

/** Tiệm sửa xe: nhận vụ án từ Chú Hổ, đọc tờ giấy, sổ sửa xe và sơ đồ đường đi, cuối cùng buộc tội và nghe kết thúc. */
export const GARAGE_STORY: StorySceneDef = {
  sceneId: "garage",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:rabbit_slip"] }, node: "o_ready" },
    { when: { all: ["met:tiger"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "letter", clue: "letter", label: "Tờ giấy trên bàn", sprite: "note", x: 14, y: 86, w: 5, stand: { x: 20, y: 92 } },
    { id: "last_seen", clue: "last_seen", label: "Sổ sửa xe", sprite: "clipboard", x: 68, y: 92, w: 5, when: { all: ["met:tiger"] }, stand: { x: 68, y: 95 } },
    { id: "route_map", clue: "route_map", label: "Sơ đồ đường đi", sprite: "routemap", x: 24, y: 80, w: 6, when: { all: ["met:tiger"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "tiger", zh: "你好!我的工具箱不见了!", vi: "Chào bạn! Hộp dụng cụ của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "工具箱里有什么?", vi: "Trong hộp có gì?", next: "o_inside" },
      ],
    },
    o_inside: { id: "o_inside", speaker: "tiger", zh: "里面有一把新扳手。", vi: "Bên trong có một cái cờ lê mới.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "tiger", zh: "昨天下午三点到四点之间。", vi: "Chiều hôm qua, trong khoảng từ 3 đến 4 giờ.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Hộp dụng cụ biến mất trong khoảng nào?",
      choices: [
        { zh: "昨天上午三点到四点", vi: "Từ 3 đến 4 giờ sáng hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天下午三点到四点", vi: "Chiều hôm qua từ 3 đến 4 giờ", next: "o_ok", check: "right" },
        { zh: "今天下午三点到四点", vi: "Chiều hôm nay từ 3 đến 4 giờ", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "tiger", zh: "对!请你帮帮我。昨天来过的有四位朋友:花店的猫、动物园的狐狸、火锅店的乌龟,还有奶茶店的兔子。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Hôm qua có bốn người bạn ghé qua: mèo ở tiệm hoa, cáo ở sở thú, rùa ở quán lẩu và thỏ ở quán trà sữa.",
      effects: [{ flag: "met:tiger" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "tiger", zh: "请你去问问他们:昨天下午三点到四点,你们在哪儿?", vi: "Xin bạn đi hỏi họ: chiều qua từ 3 đến 4 giờ, các bạn ở đâu?", next: null },
    o_wait: { id: "o_wait", speaker: "tiger", zh: "你找到什么了吗?快去问问他们吧。", vi: "Bạn tìm được gì chưa? Mau đi hỏi họ đi.", next: null },
    o_ready: {
      id: "o_ready", speaker: "tiger", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "tiger", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "tiger", zh: "太好了!工具箱找到了!", vi: "Tuyệt quá! Tìm được hộp dụng cụ rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Bé Thỏ đã thú nhận: quán vắng khách nên bé chạy sang mượn chiếc hộp khi Chú Hổ đang ở phòng sơn, định trả ngay mà quên. Bé đã trả lại hộp dụng cụ cho Chú Hổ.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "tiger", zh: "扳手还在里面。我们去喝奶茶吧!", vi: "Cờ lê vẫn còn bên trong. Mình đi uống trà sữa nhé!", next: null },
  },
};
