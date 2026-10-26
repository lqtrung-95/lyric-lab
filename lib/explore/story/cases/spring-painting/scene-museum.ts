import type { StorySceneDef } from "../../story-types";

/** Bảo tàng: nhận vụ án từ Cô Cú, xem vết kem và sổ khách, cuối cùng buộc tội và nghe kết thúc. */
export const MUSEUM_STORY: StorySceneDef = {
  sceneId: "museum",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "m_done" },
    { when: { all: ["clue:dog_sighting"] }, node: "m_ready" },
    { when: { all: ["met:owl"] }, node: "m_wait" },
    { node: "m_hi" },
  ],
  spots: [
    { id: "cream_smear", clue: "cream_smear", label: "Vệt trắng trên tường", sprite: "note", x: 22, y: 30, w: 4, when: { all: ["met:owl"] }, stand: { x: 22, y: 46 } },
    { id: "visitor_book", clue: "visitor_book", label: "Sổ khách", sprite: "clipboard", x: 82, y: 64, w: 5, when: { all: ["met:owl"] } },
  ],
  dialogues: {
    m_hi: { id: "m_hi", speaker: "owl", zh: "你好!博物馆的画不见了!", vi: "Chào bạn! Bức tranh của bảo tàng biến mất rồi!", next: "m_ask" },
    m_ask: {
      id: "m_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "m_when" },
        { zh: "是哪幅画?", vi: "Là bức tranh nào?", next: "m_which" },
      ],
    },
    m_which: { id: "m_which", speaker: "owl", zh: "是《春天》,最有名的一幅。", vi: "Là bức \"Mùa Xuân\", bức nổi tiếng nhất.", next: "m_ask" },
    m_when: { id: "m_when", speaker: "owl", zh: "昨天上午九点到九点半。", vi: "Từ chín giờ đến chín giờ rưỡi sáng hôm qua.", next: "m_check" },
    m_check: {
      id: "m_check", speaker: "player", zh: "", vi: "Bức tranh biến mất vào lúc nào?",
      choices: [
        { zh: "昨天上午八点到八点半", vi: "Từ tám đến tám giờ rưỡi sáng qua", next: "m_again", check: "wrong" },
        { zh: "昨天上午九点到九点半", vi: "Từ chín đến chín giờ rưỡi sáng qua", next: "m_ok", check: "right" },
        { zh: "昨天上午十点到十点半", vi: "Từ mười đến mười giờ rưỡi sáng qua", next: "m_again", check: "wrong" },
      ],
    },
    m_again: { id: "m_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "m_when" },
    m_ok: {
      id: "m_ok", speaker: "owl", zh: "对!请你帮帮我。我怀疑四位朋友:厨房的厨师、火车站的兔子、面包店的猫和球场的狗。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Tôi nghi bốn người bạn: đầu bếp ở nhà bếp, thỏ ở ga tàu, mèo ở tiệm bánh và chó ở sân tập.",
      effects: [{ flag: "met:owl" }], next: "m_task",
    },
    m_task: { id: "m_task", speaker: "owl", zh: "你先看看博物馆里有什么。", vi: "Bạn xem trong bảo tàng có gì trước đã nhé.", next: null },
    m_wait: { id: "m_wait", speaker: "owl", zh: "你找到什么了吗?要小心,有人可能说谎。", vi: "Bạn tìm được gì chưa? Cẩn thận, có người có thể nói dối.", next: null },
    m_ready: {
      id: "m_ready", speaker: "owl", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    m_done: { id: "m_done", speaker: "owl", zh: "谢谢你!你是最好的侦探。", vi: "Cảm ơn bạn! Bạn là thám tử giỏi nhất.", next: null },
    m_epi1: { id: "m_epi1", speaker: "owl", zh: "画找到了!谢谢你!", vi: "Tìm được tranh rồi! Cảm ơn bạn!", next: "m_epi2" },
    m_epi2: { id: "m_epi2", speaker: "player", zh: "", vi: "Cô Mèo thú nhận: cô muốn có bức tranh để treo trong tiệm. Trưởng ga Thỏ là bạn cô nên đã nói dối giúp, đổ lỗi cho bếp trưởng.", next: "m_epi3" },
    m_epi3: { id: "m_epi3", speaker: "owl", zh: "朋友也不能说谎。", vi: "Là bạn cũng không được nói dối.", next: "m_epi4" },
    m_epi4: { id: "m_epi4", speaker: "owl", zh: "不过,谢谢你帮了大家。", vi: "Dù vậy, cảm ơn bạn đã giúp mọi người.", next: null },
  },
};
