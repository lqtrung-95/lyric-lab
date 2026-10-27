import type { StorySceneDef } from "../../story-types";

/** Đồn cảnh sát: nhận vụ án từ Chú Chó, đọc quy tắc \"chỉ kẻ trộm nói dối\", cuối cùng buộc tội và nghe kết thúc. */
export const POLICE_STORY: StorySceneDef = {
  sceneId: "police",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:laundry_note"] }, node: "o_ready" },
    { when: { all: ["met:dog"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "report", clue: "report", label: "Lời báo trên bàn", sprite: "note", x: 14, y: 86, w: 5, stand: { x: 20, y: 92 } },
    { id: "rule", clue: "rule", label: "Quy tắc của vụ án", sprite: "note", x: 24, y: 80, w: 5, when: { all: ["met:dog"] }, stand: { x: 24, y: 90 } },
    { id: "cctv_broken", clue: "cctv_broken", label: "Ghi chú về camera", sprite: "cctv", x: 68, y: 92, w: 6, when: { all: ["met:dog"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "dog", zh: "你好!派出所的金奖章不见了!", vi: "Chào bạn! Huy chương vàng của đồn bị mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "监控拍到了吗?", vi: "Camera có quay được không?", next: "o_a0" },
      ],
    },
    o_a0: { id: "o_a0", speaker: "dog", zh: "没有,监控昨天晚上坏了。", vi: "Không, camera tối qua bị hỏng.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "dog", zh: "昨天晚上。我问了五位朋友。", vi: "Tối qua. Tôi đã hỏi năm người bạn.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Huy chương vàng biến mất lúc nào?",
      choices: [
        { zh: "昨天上午", vi: "Sáng hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天晚上", vi: "Tối hôm qua", next: "o_ok", check: "right" },
        { zh: "今天早上", vi: "Sáng hôm nay", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "dog", zh: "对!请你帮帮我。这五位朋友是:猫头鹰、小猪、狐狸、小鸟和鸭子。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Năm người bạn này là: cú, heo, cáo, chim và vịt.",
      effects: [{ flag: "met:dog" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "dog", zh: "请你去听他们每个人说一句话。注意:小偷会说谎。", vi: "Xin bạn đi nghe mỗi người nói một câu. Chú ý: kẻ trộm sẽ nói dối.", next: null },
    o_wait: { id: "o_wait", speaker: "dog", zh: "你找到什么了吗?再仔细看看。", vi: "Bạn tìm được gì chưa? Hãy xem kỹ thêm nữa.", next: null },
    o_ready: {
      id: "o_ready", speaker: "dog", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "dog", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "dog", zh: "太好了!金奖章找到了!", vi: "Tuyệt quá! Tìm được huy chương vàng rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Cô Cáo đã thú nhận. Chính vì cô nói Heo nói dối, trong khi Heo nói thật, nên cô bị lộ. Cô đã trả lại huy chương vàng cho Chú Chó.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "dog", zh: "原来只有小偷的话是假的!", vi: "Hóa ra chỉ có lời của kẻ trộm là giả!", next: null },
  },
};
