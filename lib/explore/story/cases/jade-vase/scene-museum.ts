import type { StorySceneDef } from "../../story-types";

/** Bảo tàng: Cụ Cú nhận vụ án (bình ngọc mất trong 30 phút); có sổ trưng bày, dấu chân của hai người và bột giặt trắng (mồi nhử chỉ về Vịt). */
export const MUSEUM_STORY: StorySceneDef = {
  sceneId: "museum",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:rabbit_slip"] }, node: "o_ready" },
    { when: { all: ["met:owl"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "museum_time", clue: "museum_time", label: "Sổ trưng bày", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:owl"] }, stand: { x: 20, y: 92 } },
    { id: "footprints", clue: "footprints", label: "Dấu chân trên sàn", sprite: "fingerprint", x: 68, y: 92, w: 4, when: { all: ["met:owl"] }, stand: { x: 68, y: 95 } },
    { id: "soap_dust", clue: "soap_dust", label: "Bột trắng ở bậu cửa", sprite: "note", x: 24, y: 80, w: 5, when: { all: ["met:owl"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "owl", zh: "你好!我们的玉瓶不见了!", vi: "Chào bạn! Bình ngọc của chúng tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "玉瓶放在哪里?", vi: "Bình ngọc để ở đâu?", next: "o_a0" },
      ],
    },
    o_a0: { id: "o_a0", speaker: "owl", zh: "放在二楼的展柜里。", vi: "Để trong tủ trưng bày ở tầng hai.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "owl", zh: "今天下午三点到三点半之间。", vi: "Chiều nay, trong khoảng từ 3 giờ đến 3 rưỡi.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Bình ngọc biến mất trong khoảng nào?",
      choices: [
        { zh: "今天上午三点到三点半", vi: "Từ 3 đến 3 rưỡi sáng nay", next: "o_again", check: "wrong" },
        { zh: "今天下午三点到三点半", vi: "Chiều nay từ 3 đến 3 rưỡi", next: "o_ok", check: "right" },
        { zh: "昨天下午三点到三点半", vi: "Chiều hôm qua từ 3 đến 3 rưỡi", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "owl", zh: "对!请你帮帮我。昨天来过的有四位朋友:电影院的兔子、洗衣店的鸭子、银行的狐狸和机场的猪。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Có bốn người bạn đã ghé qua: thỏ ở rạp phim, vịt ở tiệm giặt, cáo ở ngân hàng và heo ở sân bay.",
      effects: [{ flag: "met:owl" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "owl", zh: "你自己决定先去哪儿吧。", vi: "Bạn tự quyết định đi đâu trước nhé.", next: null },
    o_wait: { id: "o_wait", speaker: "owl", zh: "你找到什么了吗?再仔细看看。", vi: "Bạn tìm được gì chưa? Hãy xem kỹ thêm nữa.", next: null },
    o_ready: {
      id: "o_ready", speaker: "owl", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "owl", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "owl", zh: "玉瓶找到了!", vi: "Tìm được bình ngọc rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Bé Thỏ và Chú Vịt đã thú nhận: cả hai cùng lẻn vào, định chụp ảnh với bình ngọc rồi trả lại, và hai người làm chứng giả cho nhau. Họ đã trả bình ngọc và xin lỗi.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "owl", zh: "下次要先问我,好吗?", vi: "Lần sau phải hỏi tôi trước, được không?", next: null },
  },
};
