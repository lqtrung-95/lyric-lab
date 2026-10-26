import type { StorySceneDef } from "../../story-types";

/** Công viên: Ông Rùa chỉ kể về người cầm ô đỏ khi bạn đã có manh mối chiếc ô (câu hỏi đó chỉ hiện khi có `clue:umbrella`). */
export const PARK_STORY: StorySceneDef = {
  sceneId: "park",
  sceneNpcEntries: [{ when: { all: ["met:turtle"] }, node: "t_after" }, { node: "t_hi" }],
  dialogues: {
    t_hi: { id: "t_hi", speaker: "turtle", zh: "下雨天,公园里人很少。", vi: "Trời mưa, công viên ít người.", next: "t_ask" },
    t_ask: {
      id: "t_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "昨天晚上您看见拿红伞的人吗?", vi: "Tối qua ông có thấy ai cầm ô đỏ không?", next: "t_ans", when: { all: ["clue:umbrella"] } },
        { zh: "您在公园做什么?", vi: "Ông làm gì ở công viên?", next: "t_chat0" },
        { zh: "今天天气怎么样?", vi: "Hôm nay thời tiết thế nào?", next: "t_chat1" },
      ],
    },
    t_chat0: { id: "t_chat0", speaker: "turtle", zh: "我每天晚上在这里散步。", vi: "Mỗi tối tôi đều đi dạo ở đây.", next: "t_ask" },
    t_chat1: { id: "t_chat1", speaker: "turtle", zh: "今天不下雨,天气很好。", vi: "Hôm nay không mưa, thời tiết rất đẹp.", next: "t_ask" },
    t_ans: { id: "t_ans", speaker: "turtle", zh: "昨天晚上七点四十五,我看见一位老师拿着红伞,往酒店走。", vi: "Tối qua 7 giờ 45, tôi thấy một cô giáo cầm ô đỏ đi về hướng khách sạn.", next: "t_check" },
    t_check: {
      id: "t_check", speaker: "player", zh: "", vi: "Ông Rùa nhìn thấy ai, vào lúc nào?",
      choices: [
        { zh: "一位医生,七点十五", vi: "Một bác sĩ, lúc 7 giờ 15", next: "t_again", check: "wrong" },
        { zh: "一位老师,七点四十五", vi: "Một cô giáo, lúc 7 giờ 45", next: "t_ok", check: "right" },
        { zh: "一位厨师,八点四十五", vi: "Một đầu bếp, lúc 8 giờ 45", next: "t_again", check: "wrong" },
      ],
    },
    t_again: { id: "t_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại lời khai nào…", next: "t_ans" },
    t_ok: { id: "t_ok", speaker: "player", zh: "", vi: "Đã ghi lời khai vào sổ vụ án.", effects: [{ clue: "witness_turtle" }, { flag: "met:turtle" }], next: "t_close" },
    t_close: { id: "t_close", speaker: "turtle", zh: "我老了,但是眼睛很好!", vi: "Tôi già rồi, nhưng mắt vẫn rất tốt!", next: null },
    t_after: { id: "t_after", speaker: "turtle", zh: "你找到那位老师了吗?", vi: "Bạn tìm thấy cô giáo đó chưa?", next: null },
  },
};
