import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const turtle = buildInterview({
  prefix: "t", speaker: "turtle",
  greeting: { zh: "下雨后,公园里很安静。", vi: "Sau cơn mưa, công viên rất yên tĩnh." },
  question: { zh: "昨天下午两点到两点半您在哪儿?", vi: "Hai giờ đến hai giờ rưỡi chiều qua ông ở đâu?" },
  chatter: [
    { ask: { zh: "您在公园做什么?", vi: "Ông làm gì ở công viên?" }, reply: { zh: "我每天下午在这里休息。", vi: "Mỗi chiều tôi đều nghỉ ở đây." } },
    { ask: { zh: "今天天气怎么样?", vi: "Hôm nay thời tiết thế nào?" }, reply: { zh: "今天天气很好。", vi: "Hôm nay thời tiết rất đẹp." } },
  ],
  answer: { zh: "昨天下午两点到两点半,我在公园的长椅上休息。", vi: "Chiều qua từ hai giờ đến hai giờ rưỡi, tôi nghỉ trên ghế dài ở công viên." },
  check: { vi: "Ông Rùa nói chiều qua lúc 2 giờ đến 2 giờ rưỡi ông ở đâu?", right: { zh: "在公园", vi: "Ở công viên" }, wrong: [{ zh: "在饭馆", vi: "Ở quán ăn" }, { zh: "在医院", vi: "Ở bệnh viện" }], rightAt: 1 },
  clue: "turtle_alibi", metFlag: "met:turtle",
  closing: { zh: "我老了,但是眼睛很好。", vi: "Tôi già rồi, nhưng mắt vẫn rất tốt." },
  after: { zh: "你还有什么想问的吗?", vi: "Bạn còn muốn hỏi gì không?" },
});

/** Công viên: ngoài lời khai thường, khi đã biết người mua muối dùng phiếu vé tàu (`clue:salt_buyer`) thì có thêm câu hỏi về người chạy ra từ quán ăn. */
export const PARK_STORY: StorySceneDef = {
  sceneId: "park",
  sceneNpcEntries: [
    { when: { all: ["met:turtle", "clue:salt_buyer"], none: ["saw:turtle"] }, node: "t2_hi" },
    ...turtle.entries,
  ],
  dialogues: {
    ...turtle.nodes,
    t2_hi: { id: "t2_hi", speaker: "turtle", zh: "你又来了?有什么事?", vi: "Bạn lại đến à? Có việc gì?", next: "t2_ask" },
    t2_ask: {
      id: "t2_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "昨天下午两点二十,您看见有人从饭馆跑出来吗?", vi: "Hai giờ hai mươi chiều qua, ông có thấy ai chạy ra từ quán ăn không?", next: "t2_ans" },
        { zh: "没事,再见。", vi: "Không có gì, tạm biệt ông.", next: null },
      ],
    },
    t2_ans: { id: "t2_ans", speaker: "turtle", zh: "两点二十,我看见一只兔子拿着一个大盒子,跑向火车站。", vi: "Lúc 2 giờ 20, tôi thấy một con thỏ cầm một cái hộp lớn chạy về phía ga tàu.", next: "t2_check" },
    t2_check: {
      id: "t2_check", speaker: "player", zh: "", vi: "Ông Rùa thấy ai chạy, về hướng nào?",
      choices: [
        { zh: "一只狐狸,跑向医院", vi: "Một con cáo, chạy về bệnh viện", next: "t2_again", check: "wrong" },
        { zh: "一只兔子,跑向火车站", vi: "Một con thỏ, chạy về ga tàu", next: "t2_ok", check: "right" },
        { zh: "一只猫,跑向市场", vi: "Một con mèo, chạy về chợ", next: "t2_again", check: "wrong" },
      ],
    },
    t2_again: { id: "t2_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại lời khai nào…", next: "t2_ans" },
    t2_ok: { id: "t2_ok", speaker: "player", zh: "", vi: "Đã ghi lời khai vào sổ vụ án.", effects: [{ clue: "turtle_sighting" }, { flag: "saw:turtle" }], next: "t2_close" },
    t2_close: { id: "t2_close", speaker: "turtle", zh: "那个盒子很大,他跑得很快。", vi: "Cái hộp rất lớn, và nó chạy rất nhanh.", next: null },
  },
};
