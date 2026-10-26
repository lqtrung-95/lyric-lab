import type { StorySceneDef } from "../../story-types";

/** Phòng gym: Chó báo mất cúp lúc 3 giờ chiều qua; bụi dày trên giá cho thấy cúp đã mất từ lâu; khi đủ chứng cứ, hỏi lại thì Chó thú nhận cúp đang ở bảo tàng. */
export const GYM_STORY: StorySceneDef = {
  sceneId: "gym",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "g_done" },
    { when: { all: ["clue:dog_slip"] }, node: "g_ready" },
    { when: { all: ["met:dog", "clue:loan_form", "clue:witness_fox", "clue:dust_shelf"], none: ["confronted:dog"] }, node: "g_conf" },
    { when: { all: ["met:dog"] }, node: "g_wait" },
    { node: "g_hi" },
  ],
  spots: [
    { id: "dust_shelf", clue: "dust_shelf", label: "Giá để cúp", sprite: "note", x: 34, y: 40, w: 4, when: { all: ["met:dog"] }, stand: { x: 34, y: 52 } },
    { id: "gold_dust", clue: "gold_dust", label: "Chấm vàng lấp lánh", sprite: "note", x: 50, y: 46, w: 3.5, when: { all: ["met:dog"] } },
  ],
  dialogues: {
    g_hi: { id: "g_hi", speaker: "dog", zh: "你好!我们的金奖杯被偷了!", vi: "Chào bạn! Chiếc cúp vàng của chúng tôi bị trộm rồi!", next: "g_ask" },
    g_ask: {
      id: "g_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "g_when" },
        { zh: "奖杯是怎么得到的?", vi: "Chiếc cúp giành được thế nào?", next: "g_what" },
      ],
    },
    g_what: { id: "g_what", speaker: "dog", zh: "我们队去年得了第一名。", vi: "Đội chúng tôi đạt giải nhất năm ngoái.", next: "g_ask" },
    g_when: { id: "g_when", speaker: "dog", zh: "昨天下午三点,我回来就不见了。", vi: "Ba giờ chiều hôm qua, tôi về thì thấy mất.", next: "g_check" },
    g_check: {
      id: "g_check", speaker: "player", zh: "", vi: "Chú Chó nói cúp biến mất lúc nào?",
      choices: [
        { zh: "昨天早上三点", vi: "Ba giờ sáng hôm qua", next: "g_again", check: "wrong" },
        { zh: "昨天下午三点", vi: "Ba giờ chiều hôm qua", next: "g_ok", check: "right" },
        { zh: "今天下午三点", vi: "Ba giờ chiều hôm nay", next: "g_again", check: "wrong" },
      ],
    },
    g_again: { id: "g_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "g_when" },
    g_ok: {
      id: "g_ok", speaker: "dog", zh: "对!请你帮帮我。我怀疑四位朋友:银行的狐狸、电影院的兔子、理发店的猫和博物馆的猫头鹰。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Tôi nghi bốn người bạn: cáo ở ngân hàng, thỏ ở rạp phim, mèo ở hiệu tóc và cú ở bảo tàng.",
      effects: [{ flag: "met:dog" }], next: "g_task",
    },
    g_task: { id: "g_task", speaker: "dog", zh: "你先看看奖杯架。", vi: "Bạn xem giá để cúp trước đã nhé.", next: null },
    g_wait: { id: "g_wait", speaker: "dog", zh: "你找到什么了吗?快去问问他们吧。", vi: "Bạn tìm được gì chưa? Mau đi hỏi họ đi.", next: null },
    g_conf: { id: "g_conf", speaker: "player", zh: "架子上的灰那么厚,有人看见您上周拿着金盒子去了博物馆,借展单上也是您的名字。", vi: "Bụi trên giá dày như vậy, có người thấy ông cầm hộp vàng đi bảo tàng tuần trước, và đơn mượn cũng ghi tên ông.", next: "g_conf2" },
    g_conf2: { id: "g_conf2", speaker: "dog", zh: "我……我忘了,是我自己把奖杯借给博物馆的。", vi: "Tôi... tôi quên mất, chính tôi đã cho bảo tàng mượn cúp.", effects: [{ clue: "dog_slip" }, { flag: "confronted:dog" }], next: "g_conf3" },
    g_conf3: { id: "g_conf3", speaker: "dog", zh: "对不起,我不该乱报案。", vi: "Xin lỗi, tôi không nên báo án bừa.", next: null },
    g_ready: {
      id: "g_ready", speaker: "dog", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    g_done: { id: "g_done", speaker: "dog", zh: "谢谢你!你是最好的侦探。", vi: "Cảm ơn bạn! Bạn là thám tử giỏi nhất.", next: null },
    g_epi1: { id: "g_epi1", speaker: "dog", zh: "奖杯找到了!谢谢你!", vi: "Tìm được cúp rồi! Cảm ơn bạn!", next: "g_epi2" },
    g_epi2: { id: "g_epi2", speaker: "player", zh: "", vi: "Cúp vẫn an toàn ở bảo tàng. Chó đã tự cho mượn rồi quên, nên báo án nhầm và làm cả năm người bị nghi oan.", next: "g_epi3" },
    g_epi3: { id: "g_epi3", speaker: "dog", zh: "以后我一定先想一想再说。", vi: "Từ nay tôi nhất định sẽ nghĩ kỹ rồi mới nói.", next: null },
  },
};
