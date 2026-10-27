import type { StorySceneDef } from "../../story-types";

/** Bưu điện: nhận vụ án từ Bác Thỏ, đọc tờ giấy, mảnh giấy kẻ trộm để lại và sổ gửi hàng, cuối cùng buộc tội và nghe kết thúc. */
export const POSTOFFICE_STORY: StorySceneDef = {
  sceneId: "postoffice",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:pig_slip"] }, node: "o_ready" },
    { when: { all: ["met:rabbit"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "letter", clue: "letter", label: "Tờ giấy trên sàn", sprite: "note", x: 14, y: 86, w: 5, stand: { x: 20, y: 92 } },
    { id: "thief_note", clue: "thief_note", label: "Mảnh giấy trên quầy", sprite: "letter", x: 68, y: 92, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 68, y: 95 } },
    { id: "rabbit_list", clue: "rabbit_list", label: "Sổ gửi hàng", sprite: "clipboard", x: 24, y: 80, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "rabbit", zh: "你好!我的包裹不见了!", vi: "Chào bạn! Bưu kiện của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "包裹里有什么?", vi: "Trong bưu kiện có gì?", next: "o_inside" },
      ],
    },
    o_inside: { id: "o_inside", speaker: "rabbit", zh: "里面有一块新手表,装在一个盒子里,外面包着棕色的纸。", vi: "Bên trong có một chiếc đồng hồ mới đựng trong hộp, bên ngoài bọc giấy nâu.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "rabbit", zh: "昨天下午六点。", vi: "Sáu giờ chiều hôm qua.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Bưu kiện biến mất lúc nào?",
      choices: [
        { zh: "昨天上午六点", vi: "Sáu giờ sáng hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天下午六点", vi: "Sáu giờ chiều hôm qua", next: "o_ok", check: "right" },
        { zh: "今天下午六点", vi: "Sáu giờ chiều hôm nay", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "rabbit", zh: "对!请你帮帮我。昨天来过的有四位朋友:理发的猫、药店的狐狸、火锅店的乌龟,还有手机店的猪。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Hôm qua có bốn người bạn ghé qua: mèo thợ tóc, cáo ở hiệu thuốc, rùa ở quán lẩu và heo ở cửa hàng điện thoại.",
      effects: [{ flag: "met:rabbit" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "rabbit", zh: "请你去问问他们:昨天下午六点,你们在哪儿?", vi: "Xin bạn đi hỏi họ: sáu giờ chiều hôm qua, các bạn ở đâu?", next: null },
    o_wait: { id: "o_wait", speaker: "rabbit", zh: "你找到什么了吗?快去问问他们吧。", vi: "Bạn tìm được gì chưa? Mau đi hỏi họ đi.", next: null },
    o_ready: {
      id: "o_ready", speaker: "rabbit", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "rabbit", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "rabbit", zh: "太好了!包裹找到了!", vi: "Tuyệt quá! Tìm được bưu kiện rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Anh Heo đã thú nhận: anh từng gói chiếc đồng hồ nên biết hộp màu đỏ, rồi lén lấy lại bưu kiện sau khi đóng cửa tiệm. Cô Mèo chỉ nói dối vì đi mua quà sinh nhật cho Bác Thỏ. Anh Heo đã trả lại chiếc đồng hồ.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "rabbit", zh: "手表还在里面。我们去吃火锅吧!", vi: "Chiếc đồng hồ vẫn còn bên trong. Mình đi ăn lẩu nhé!", next: null },
  },
};
