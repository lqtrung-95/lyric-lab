import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "你好!来训练吗?", vi: "Chào bạn! Đến tập luyện à?" },
  question: { zh: "昨天上午九点到九点半你在哪儿?", vi: "Sáng qua từ 9 giờ đến 9 giờ rưỡi bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你们几点开始训练?", vi: "Mấy giờ các bạn bắt đầu tập?" }, reply: { zh: "八点半。", vi: "Tám giờ rưỡi." } },
    { ask: { zh: "你喜欢踢球吗?", vi: "Ông thích đá bóng không?" }, reply: { zh: "非常喜欢!", vi: "Rất thích!" } },
  ],
  answer: { zh: "昨天上午九点到九点半,我在球场训练。", vi: "Sáng qua từ 9 giờ đến 9 giờ rưỡi, tôi tập luyện ở sân." },
  check: { vi: "Chú Chó nói sáng qua lúc 9 giờ ông ở đâu?", right: { zh: "在球场", vi: "Ở sân tập" }, wrong: [{ zh: "在面包店", vi: "Ở tiệm bánh" }, { zh: "在博物馆", vi: "Ở bảo tàng" }], rightAt: 0 },
  clue: "dog_alibi", metFlag: "met:dog",
  closing: { zh: "我的点名表在墙上。", vi: "Bảng điểm danh của tôi ở trên tường." },
  after: { zh: "点名表在墙上。要一起练球吗?", vi: "Bảng ở trên tường. Muốn tập bóng cùng không?" },
});

/** Sân vận động: sổ điểm danh xác nhận Chó ở sân; sau khi vạch trần lời Thỏ, Chó kể đã thấy người mặc tạp dề hồng chạy từ bảo tàng về tiệm bánh. */
export const STADIUM_STORY: StorySceneDef = {
  sceneId: "stadium",
  sceneNpcEntries: [
    { when: { all: ["met:dog", "clue:rabbit_slip"], none: ["saw:dog"] }, node: "dog2_hi" },
    ...dog.entries,
  ],
  spots: [
    { id: "attendance", clue: "attendance", label: "Sổ điểm danh", sprite: "clipboard", x: 70, y: 30, w: 5, when: { all: ["met:dog"] }, stand: { x: 70, y: 46 } },
  ],
  dialogues: {
    ...dog.nodes,
    dog2_hi: { id: "dog2_hi", speaker: "dog", zh: "你又来了?有什么事?", vi: "Bạn lại đến à? Có việc gì?", next: "dog2_ask" },
    dog2_ask: {
      id: "dog2_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "昨天九点十分,您看见有人从博物馆跑出来吗?", vi: "9 giờ 10 sáng qua, ông có thấy ai chạy ra từ bảo tàng không?", next: "dog2_ans" },
        { zh: "没事,再见。", vi: "Không có gì, tạm biệt ông.", next: null },
      ],
    },
    dog2_ans: { id: "dog2_ans", speaker: "dog", zh: "九点十分,我看见一个穿粉红围裙的人拿着一个大盒子,从博物馆跑回面包店。", vi: "9 giờ 10, tôi thấy một người mặc tạp dề hồng cầm một cái hộp lớn chạy từ bảo tàng về tiệm bánh.", next: "dog2_check" },
    dog2_check: {
      id: "dog2_check", speaker: "player", zh: "", vi: "Chú Chó thấy người đó mặc gì, chạy về đâu?",
      choices: [
        { zh: "穿白围裙,跑回厨房", vi: "Mặc tạp dề trắng, chạy về nhà bếp", next: "dog2_again", check: "wrong" },
        { zh: "穿粉红围裙,跑回面包店", vi: "Mặc tạp dề hồng, chạy về tiệm bánh", next: "dog2_ok", check: "right" },
        { zh: "穿蓝衣服,跑向火车站", vi: "Mặc áo xanh, chạy về ga tàu", next: "dog2_again", check: "wrong" },
      ],
    },
    dog2_again: { id: "dog2_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại lời khai nào…", next: "dog2_ans" },
    dog2_ok: { id: "dog2_ok", speaker: "player", zh: "", vi: "Đã ghi lời khai vào sổ vụ án.", effects: [{ clue: "dog_sighting" }, { flag: "saw:dog" }], next: "dog2_close" },
    dog2_close: { id: "dog2_close", speaker: "dog", zh: "他跑得很快,盒子很大。", vi: "Người đó chạy rất nhanh, cái hộp rất lớn.", next: null },
  },
};
