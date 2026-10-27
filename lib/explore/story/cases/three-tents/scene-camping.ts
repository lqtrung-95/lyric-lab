import type { StorySceneDef } from "../../story-types";

/** Khu cắm trại: nhận vụ án từ Cô Cáo, đọc bảng thông báo và ghi chú về ba lều (bản đồ cũ là mồi nhử), cuối cùng buộc tội. */
export const CAMPING_STORY: StorySceneDef = {
  sceneId: "camping",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:rain_notice"] }, node: "o_ready" },
    { when: { all: ["met:fox"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "letter", clue: "letter", label: "Lời báo trên bàn", sprite: "note", x: 14, y: 86, w: 5, stand: { x: 20, y: 92 } },
    { id: "tent_notice", clue: "tent_notice", label: "Bảng thông báo khu trại", sprite: "note", x: 24, y: 80, w: 5, when: { all: ["met:fox"] }, stand: { x: 24, y: 90 } },
    { id: "green_note", clue: "green_note", label: "Tờ ghi chú của kiểm lâm", sprite: "note", x: 66, y: 80, w: 5, when: { all: ["met:fox"] }, stand: { x: 66, y: 90 } },
    { id: "old_map", clue: "old_map", label: "Bản đồ khu trại", sprite: "routemap", x: 68, y: 92, w: 6, when: { all: ["met:fox"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "fox", zh: "你好!我是这里的管理员。昨天晚上有人拿走了一块金表!", vi: "Chào bạn! Tôi là kiểm lâm ở đây. Tối qua có người lấy một chiếc đồng hồ vàng!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "金表是从哪里不见的?", vi: "Đồng hồ biến mất từ đâu?", next: "o_when" },
        { zh: "那张地图可以看吗?", vi: "Tấm bản đồ đó có xem được không?", next: "o_a0" },
      ],
    },
    o_a0: { id: "o_a0", speaker: "fox", zh: "那张地图是去年的,现在不对了。", vi: "Tấm bản đồ đó là của năm ngoái, bây giờ không còn đúng nữa.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "fox", zh: "是从最中间的帐篷里不见的。", vi: "Biến mất từ chiếc lều ở chính giữa.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Đồng hồ vàng biến mất từ chiếc lều nào?",
      choices: [
        { zh: "最左边的帐篷", vi: "Lều ngoài cùng bên trái", next: "o_again", check: "wrong" },
        { zh: "最中间的帐篷", vi: "Lều ở chính giữa", next: "o_ok", check: "right" },
        { zh: "最右边的帐篷", vi: "Lều ngoài cùng bên phải", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "fox", zh: "对!请你帮帮我。露营的有三位朋友:小狗、猫头鹰和小猪。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Có ba người bạn đang cắm trại: chó, cú và heo.",
      effects: [{ flag: "met:fox" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "fox", zh: "请你先看看营地的通知。他们三个人的帐篷,各是什么样的?", vi: "Xin bạn xem thông báo của khu trại trước. Lều của ba người họ, mỗi cái thế nào?", next: null },
    o_wait: { id: "o_wait", speaker: "fox", zh: "你找到什么了吗?再仔细看看。", vi: "Bạn tìm được gì chưa? Hãy xem kỹ thêm nữa.", next: null },
    o_ready: {
      id: "o_ready", speaker: "fox", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "fox", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "fox", zh: "太好了!金表找到了!", vi: "Tuyệt quá! Tìm được đồng hồ rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Cụ Cú đã thú nhận: cụ ở chiếc lều xanh lá ngoài cùng bên trái, thấy lều của Chó trống nên vào xem đồng hồ vàng rồi quên trả. Cụ đã trả đồng hồ cho Chú Chó.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "fox", zh: "原来左边、中间和右边的帐篷,要这样排!", vi: "Hóa ra lều bên trái, ở giữa và bên phải phải xếp như thế này!", next: null },
  },
};
