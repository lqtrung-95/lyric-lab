import type { StorySceneDef } from "../../story-types";

/** Công viên: Ông Rùa chỉ kể về người cầm diều khi bạn đã có dấu chân trên cát (câu hỏi bị khóa bằng `clue:paw_print`). */
export const PARK_STORY: StorySceneDef = {
  sceneId: "park",
  sceneNpcEntries: [{ when: { all: ["met:turtle"] }, node: "t_after" }, { node: "t_hi" }],
  dialogues: {
    t_hi: { id: "t_hi", speaker: "turtle", zh: "中午的公园很安静。", vi: "Trưa ở công viên rất yên tĩnh.", next: "t_ask" },
    t_ask: {
      id: "t_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "昨天中午您看见有人拿着风筝吗?", vi: "Trưa qua ông có thấy ai cầm diều không?", next: "t_ans", when: { all: ["clue:paw_print"] } },
        { zh: "您在公园做什么?", vi: "Ông làm gì ở công viên?", next: "t_chat0" },
        { zh: "今天天气怎么样?", vi: "Hôm nay thời tiết thế nào?", next: "t_chat1" },
      ],
    },
    t_chat0: { id: "t_chat0", speaker: "turtle", zh: "我每天中午在这里休息。", vi: "Mỗi trưa tôi đều nghỉ ở đây.", next: "t_ask" },
    t_chat1: { id: "t_chat1", speaker: "turtle", zh: "今天天气很好。", vi: "Hôm nay thời tiết rất đẹp.", next: "t_ask" },
    t_ans: { id: "t_ans", speaker: "turtle", zh: "昨天十二点半,我看见一只猫拿着红色的风筝跑回市场。", vi: "Mười hai giờ rưỡi hôm qua, tôi thấy một con mèo cầm con diều đỏ chạy về chợ.", next: "t_check" },
    t_check: {
      id: "t_check", speaker: "player", zh: "", vi: "Ông Rùa thấy ai, cầm gì, chạy về đâu?",
      choices: [
        { zh: "一只狗拿着球跑回商店", vi: "Một con chó cầm bóng chạy về cửa hàng", next: "t_again", check: "wrong" },
        { zh: "一只猫拿着红风筝跑回市场", vi: "Một con mèo cầm diều đỏ chạy về chợ", next: "t_ok", check: "right" },
        { zh: "一只鸟拿着书跑回学校", vi: "Một con chim cầm sách chạy về trường", next: "t_again", check: "wrong" },
      ],
    },
    t_again: { id: "t_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại lời khai nào…", next: "t_ans" },
    t_ok: { id: "t_ok", speaker: "player", zh: "", vi: "Đã ghi lời khai vào sổ vụ án.", effects: [{ clue: "witness_turtle" }, { flag: "met:turtle" }], next: "t_close" },
    t_close: { id: "t_close", speaker: "turtle", zh: "我老了,但是眼睛很好!", vi: "Tôi già rồi, nhưng mắt vẫn rất tốt!", next: null },
    t_after: { id: "t_after", speaker: "turtle", zh: "你找到那只猫了吗?", vi: "Bạn tìm thấy con mèo đó chưa?", next: null },
  },
};
