import type { StorySceneDef } from "../../story-types";

/** Quán ăn: nhận vụ án từ Bếp trưởng Gấu, xem giờ đánh tráo và túi muối, cuối cùng buộc tội và nghe kết thúc. */
export const RESTAURANT_STORY: StorySceneDef = {
  sceneId: "restaurant",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "c_done" },
    { when: { all: ["clue:turtle_sighting"] }, node: "c_ready" },
    { when: { all: ["met:chef"] }, node: "c_wait" },
    { node: "c_hi" },
  ],
  spots: [
    { id: "cake_note", clue: "cake_time", label: "Tờ ghi chú trên tường", sprite: "note", x: 22, y: 30, w: 4.5, when: { all: ["met:chef"] }, stand: { x: 22, y: 46 } },
    { id: "salt_bag", clue: "salt_bag", label: "Túi muối trong thùng rác", sprite: "bag", x: 70, y: 92, w: 5, when: { all: ["met:chef"] }, stand: { x: 70, y: 96 } },
  ],
  dialogues: {
    c_hi: { id: "c_hi", speaker: "chef", zh: "你好!我的比赛蛋糕被换了!", vi: "Chào bạn! Bánh dự thi của tôi bị đánh tráo rồi!", next: "c_ask" },
    c_ask: {
      id: "c_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候被换的?", vi: "Bị đánh tráo lúc nào?", next: "c_when" },
        { zh: "蛋糕怎么了?", vi: "Chiếc bánh làm sao?", next: "c_what" },
      ],
    },
    c_what: { id: "c_what", speaker: "chef", zh: "它变成咸的了!", vi: "Nó biến thành bánh mặn rồi!", next: "c_ask" },
    c_when: { id: "c_when", speaker: "chef", zh: "昨天下午两点到两点半,我去市场买面粉,厨房里没有人。", vi: "Chiều qua từ hai giờ đến hai giờ rưỡi, tôi ra chợ mua bột, trong bếp không có ai.", next: "c_check" },
    c_check: {
      id: "c_check", speaker: "player", zh: "", vi: "Chiếc bánh bị đánh tráo vào lúc nào?",
      choices: [
        { zh: "昨天上午十点", vi: "Mười giờ sáng hôm qua", next: "c_again", check: "wrong" },
        { zh: "昨天下午两点到两点半", vi: "Từ hai đến hai giờ rưỡi chiều qua", next: "c_ok", check: "right" },
        { zh: "昨天晚上八点", vi: "Tám giờ tối qua", next: "c_again", check: "wrong" },
      ],
    },
    c_again: { id: "c_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "c_when" },
    c_ok: {
      id: "c_ok", speaker: "chef", zh: "对!请你帮帮我。我怀疑五位朋友:卖水果的猫、医生、火车站的兔子、学校的老师和公园里的老爷爷。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Tôi nghi năm người bạn: mèo bán trái cây, bác sĩ, thỏ ở ga tàu, cô giáo ở trường và ông cụ ở công viên.",
      effects: [{ flag: "met:chef" }], next: "c_task",
    },
    c_task: { id: "c_task", speaker: "chef", zh: "你先看看厨房里有什么。", vi: "Bạn xem trong bếp có gì trước đã nhé.", next: null },
    c_wait: { id: "c_wait", speaker: "chef", zh: "你找到什么了吗?要小心,有人可能说谎。", vi: "Bạn tìm được gì chưa? Cẩn thận, có người có thể nói dối.", next: null },
    c_ready: {
      id: "c_ready", speaker: "chef", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    c_done: { id: "c_done", speaker: "chef", zh: "谢谢你!你是最好的侦探。", vi: "Cảm ơn bạn! Bạn là thám tử giỏi nhất.", next: null },
    c_epi1: { id: "c_epi1", speaker: "chef", zh: "蛋糕找到了!谢谢你!", vi: "Tìm được bánh rồi! Cảm ơn bạn!", next: "c_epi2" },
    c_epi2: { id: "c_epi2", speaker: "player", zh: "", vi: "Trưởng ga Thỏ thú nhận: anh muốn bánh của mình thắng cuộc thi nên đã đổi bánh mặn vào bánh của Gấu, rồi đổ lỗi cho Bác sĩ Cáo.", next: "c_epi3" },
    c_epi3: { id: "c_epi3", speaker: "chef", zh: "没关系。下次比赛要公平!", vi: "Không sao. Lần sau thi đấu phải công bằng nhé!", next: "c_epi4" },
    c_epi4: { id: "c_epi4", speaker: "chef", zh: "来吃我的新蛋糕吧!", vi: "Đến ăn bánh mới của tôi nào!", next: null },
  },
};
