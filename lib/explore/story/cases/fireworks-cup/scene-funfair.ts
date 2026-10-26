import type { StorySceneDef } from "../../story-types";

/** Công viên giải trí: nhận vụ án từ Chú Chó, đọc bốn tài liệu (giờ biến mất, sổ cổng, chương trình lều xiếc, sổ vòng quay), cuối cùng buộc tội và nghe kết thúc. */
export const FUNFAIR_STORY: StorySceneDef = {
  sceneId: "funfair",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:farm_road"] }, node: "o_ready" },
    { when: { all: ["met:dog"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "letter", clue: "letter", label: "Lời báo án trên bàn", sprite: "note", x: 14, y: 86, w: 5, stand: { x: 20, y: 92 } },
    { id: "gate_log", clue: "gate_log", label: "Sổ ghi ở cổng", sprite: "note", x: 24, y: 80, w: 5, when: { all: ["met:dog"] }, stand: { x: 24, y: 90 } },
    { id: "show_sign", clue: "show_sign", label: "Bảng chương trình lều xiếc", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:dog"] }, stand: { x: 68, y: 95 } },
    { id: "ferris_log", clue: "ferris_log", label: "Sổ vòng quay", sprite: "note", x: 66, y: 80, w: 5, when: { all: ["met:dog"] }, stand: { x: 66, y: 90 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "dog", zh: "你好!我的金奖杯不见了!", vi: "Chào bạn! Cúp vàng của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "奖杯是金色的吗?", vi: "Cúp có màu vàng không?", next: "o_a0" },
      ],
    },
    o_a0: { id: "o_a0", speaker: "dog", zh: "对,是纯金色的,很重。", vi: "Đúng, màu vàng nguyên chất, rất nặng.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "dog", zh: "昨天晚上七点五十不见的。七点半它还在。", vi: "Cúp biến mất lúc 7 giờ 50 tối qua. Lúc 7 giờ rưỡi nó vẫn còn.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Cúp vàng biến mất lúc nào?",
      choices: [
        { zh: "昨天晚上七点半", vi: "Bảy giờ rưỡi tối qua", next: "o_again", check: "wrong" },
        { zh: "昨天晚上七点五十", vi: "Bảy giờ năm mươi tối qua", next: "o_ok", check: "right" },
        { zh: "昨天晚上八点五十", vi: "Tám giờ năm mươi tối qua", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "dog", zh: "对!请你帮帮我。昨天来过的人有:狐狸、猫头鹰、老虎、鸭子和小鸟。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Hôm qua những người ghé qua có: cáo, cú, hổ, vịt và chim.",
      effects: [{ flag: "met:dog" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "dog", zh: "请先看看这里的记录。有的记录不一定说出了全部的事。", vi: "Xin bạn xem các ghi chép ở đây trước. Có những ghi chép không nói hết mọi chuyện.", next: null },
    o_wait: { id: "o_wait", speaker: "dog", zh: "你找到什么了吗?再仔细看看。", vi: "Bạn tìm được gì chưa? Hãy xem kỹ thêm nữa.", next: null },
    o_ready: {
      id: "o_ready", speaker: "dog", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "dog", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "dog", zh: "太好了!奖杯找到了!", vi: "Tuyệt quá! Tìm được cúp rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Cô Chim đã thú nhận: cô chui qua lỗ hàng rào, lấy cúp lúc bảy giờ rưỡi rồi mang đi giấu, và trả lại cúp vàng cho Chú Chó.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "dog", zh: "原来后门不是唯一的路。谢谢你算得这么仔细!", vi: "Hóa ra cổng sau không phải con đường duy nhất. Cảm ơn bạn đã tính kỹ như vậy!", next: null },
  },
};
