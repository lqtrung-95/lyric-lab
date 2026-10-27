import type { StorySceneDef } from "../../story-types";

/** Tiệm bánh: Mèo kể bánh sinh nhật biến mất, có sổ đơn và tấm thiệp trên quầy; cuối cùng nghe kết luận (không ai trộm). */
export const BAKERY_STORY: StorySceneDef = {
  sceneId: "bakery",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:dog_slip"] }, node: "o_ready" },
    { when: { all: ["met:cat"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "order_book", clue: "order_book", label: "Sổ đơn của tiệm", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:cat"] }, stand: { x: 20, y: 92 } },
    { id: "empty_card", clue: "empty_card", label: "Tấm thiệp trên quầy", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:cat"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "cat", zh: "你好!今天是我的生日,可是我的生日蛋糕不见了!", vi: "Chào bạn! Hôm nay là sinh nhật tôi, vậy mà bánh sinh nhật của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "蛋糕是什么样的?", vi: "Chiếc bánh trông thế nào?", next: "o_a0" },
      ],
    },
    o_a0: { id: "o_a0", speaker: "cat", zh: "是粉色的,上面有草莓。", vi: "Màu hồng, phía trên có dâu tây.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "cat", zh: "今天下午三点半到四点半之间。", vi: "Chiều nay, trong khoảng từ 3 rưỡi đến 4 rưỡi.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Chiếc bánh biến mất trong khoảng nào?",
      choices: [
        { zh: "今天上午三点半到四点半", vi: "Từ 3 rưỡi đến 4 rưỡi sáng nay", next: "o_again", check: "wrong" },
        { zh: "今天下午三点半到四点半", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi", next: "o_ok", check: "right" },
        { zh: "昨天下午三点半到四点半", vi: "Chiều hôm qua từ 3 rưỡi đến 4 rưỡi", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "cat", zh: "对!请你帮帮我。我怀疑三位朋友:健身房的狗、学校的鸟和修车店的老虎。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Tôi nghi ba người bạn: chó ở phòng gym, chim ở trường và hổ ở tiệm sửa xe.",
      effects: [{ flag: "met:cat" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "cat", zh: "你自己决定先去哪儿吧。", vi: "Bạn tự quyết định đi đâu trước nhé.", next: null },
    o_wait: { id: "o_wait", speaker: "cat", zh: "你找到什么了吗?再仔细看看。", vi: "Bạn tìm được gì chưa? Hãy xem kỹ thêm nữa.", next: null },
    o_ready: {
      id: "o_ready", speaker: "cat", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "cat", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "cat", zh: "原来没有小偷!", vi: "Hóa ra không có kẻ trộm nào cả!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Chú Chó đã bí mật đặt bánh sinh nhật cho Mèo và đến lấy sớm để tạo bất ngờ. Mèo không biết nên tưởng bị trộm. Đừng buộc tội bạn bè khi chưa chắc!", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "cat", zh: "谢谢你们!我们一起吃蛋糕吧!", vi: "Cảm ơn mọi người! Mình cùng ăn bánh nhé!", next: null },
  },
};
