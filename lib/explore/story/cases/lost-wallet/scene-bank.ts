import type { StorySceneDef } from "../../story-types";

/** Ngân hàng: nhận vụ án từ Cô Cáo, xem cuống vé và kẹp tóc rơi lại, cuối cùng buộc tội và nghe kết thúc. */
export const BANK_STORY: StorySceneDef = {
  sceneId: "bank",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "f_done" },
    { when: { all: ["clue:dog_slip"] }, node: "f_ready" },
    { when: { all: ["met:fox"] }, node: "f_wait" },
    { node: "f_hi" },
  ],
  spots: [
    { id: "stub", clue: "stub", label: "Cuống vé dưới quầy", sprite: "note", x: 46, y: 76, w: 4, when: { all: ["met:fox"] } },
    { id: "hairpin_c", clue: "hairpin_c", label: "Chiếc kẹp tóc hồng", sprite: "hairpin", x: 30, y: 80, w: 4, when: { all: ["met:fox"] } },
  ],
  dialogues: {
    f_hi: { id: "f_hi", speaker: "fox", zh: '你好!我的钱包不见了!', vi: 'Chào bạn! Ví của tôi mất rồi!', next: "f_ask" },
    f_ask: {
      id: "f_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: '什么时候不见的?', vi: 'Mất lúc nào vậy?', next: "f_when" },
        { zh: '钱包是什么样的?', vi: 'Cái ví trông thế nào?', next: "f_what" },
      ],
    },
    f_what: { id: "f_what", speaker: "fox", zh: '是一个棕色的钱包。', vi: 'Là một cái ví màu nâu.', next: "f_ask" },
    f_when: { id: "f_when", speaker: "fox", zh: '昨天下午两点到两点二十,我在输入密码。', vi: 'Chiều qua từ 2 giờ đến 2 giờ 20, tôi đang nhập mật mã.', next: "f_check" },
    f_check: {
      id: "f_check", speaker: "player", zh: "", vi: 'Cô Cáo bị mất ví vào lúc nào?',
      choices: [
        { zh: '昨天上午两点到两点二十', vi: 'Từ 2 giờ đến 2 giờ 20 sáng qua', next: "f_again", check: "wrong" },
        { zh: '昨天下午两点到两点二十', vi: 'Từ 2 giờ đến 2 giờ 20 chiều qua', next: "f_ok", check: "right" },
        { zh: '今天下午两点到两点二十', vi: 'Từ 2 giờ đến 2 giờ 20 chiều nay', next: "f_again", check: "wrong" },
      ],
    },
    f_again: { id: "f_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "f_when" },
    f_ok: {
      id: "f_ok", speaker: "fox", zh: '对!请你帮帮我。我怀疑四位朋友:电影院的兔子、理发店的猫、超市的猪和健身房的狗。', vi: 'Đúng rồi! Xin bạn giúp tôi. Tôi nghi bốn người bạn: thỏ ở rạp phim, mèo ở hiệu tóc, heo ở siêu thị và chó ở phòng gym.',
      effects: [{ flag: "met:fox" }], next: "f_task",
    },
    f_task: { id: "f_task", speaker: "fox", zh: '你先看看柜台旁边有什么。', vi: 'Bạn xem cạnh quầy có gì trước đã nhé.', next: null },
    f_wait: { id: "f_wait", speaker: "fox", zh: '你找到什么了吗?别忘了比较大家的话。', vi: 'Bạn tìm được gì chưa? Đừng quên so sánh lời mọi người.', next: null },
    f_ready: {
      id: "f_ready", speaker: "fox", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    f_done: { id: "f_done", speaker: "fox", zh: "谢谢你!你是最好的侦探。", vi: "Cảm ơn bạn! Bạn là thám tử giỏi nhất.", next: null },
    f_epi1: { id: "f_epi1", speaker: "fox", zh: '钱包找到了!谢谢你!', vi: 'Tìm được ví rồi! Cảm ơn bạn!', next: "f_epi2" },
    f_epi2: { id: "f_epi2", speaker: "player", zh: "", vi: 'Chú Chó thú nhận: ông nhặt được ví trên quầy rồi vội đi xem phim nên quên trả, sau đó không dám nói.', next: "f_epi3" },
    f_epi3: { id: "f_epi3", speaker: "fox", zh: '没关系,下次要马上告诉我。', vi: 'Không sao, lần sau hãy báo cho tôi ngay.', next: null },
  },
};
