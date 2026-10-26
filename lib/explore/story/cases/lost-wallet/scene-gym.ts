import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "你好!来锻炼吗?", vi: "Chào bạn! Đến tập luyện à?" },
  question: { zh: "昨天下午两点到两点二十你在哪儿?", vi: "Chiều qua từ 2 giờ đến 2 giờ 20 ông ở đâu?" },
  chatter: [
    { ask: { zh: "你每天都训练吗?", vi: "Ông tập mỗi ngày không?" }, reply: { zh: "是的,每天一小时。", vi: "Ừ, mỗi ngày một tiếng." } },
    { ask: { zh: "你喜欢看电影吗?", vi: "Ông có thích xem phim không?" }, reply: { zh: "喜欢,但是没时间。", vi: "Thích, nhưng không có thời gian." } },
  ],
  answer: { zh: "昨天下午两点到两点二十,我在健身房训练。", vi: "Chiều qua từ 2 giờ đến 2 giờ 20, tôi tập ở phòng gym." },
  check: { vi: "Chú Chó nói chiều qua lúc 2 giờ ông ở đâu?", right: { zh: "在健身房", vi: "Ở phòng gym" }, wrong: [{ zh: "在电影院", vi: "Ở rạp phim" }, { zh: "在银行", vi: "Ở ngân hàng" }], rightAt: 0 },
  clue: "dog_alibi", metFlag: "met:dog",
  closing: { zh: "签名本在墙上。", vi: "Sổ ký tên ở trên tường." },
  after: { zh: "还想锻炼吗?", vi: "Bạn còn muốn tập không?" },
});

/** Phòng gym: sổ ký tên cho thấy Chó rời lúc 1 giờ 50, trái lời khai; hỏi lại khi đã biết người mua vé mặc đồ thể thao thì Chó đổi lời. */
export const GYM_STORY: StorySceneDef = {
  sceneId: "gym",
  sceneNpcEntries: [
    { when: { all: ["met:dog", "clue:gym_signout", "clue:buyer_note"], none: ["confronted:dog"] }, node: "dog_conf" },
    ...dog.entries,
  ],
  spots: [
    { id: "gym_signout", clue: "gym_signout", label: "Sổ ký tên", sprite: "clipboard", x: 40, y: 31, w: 5, when: { all: ["met:dog"] }, stand: { x: 40, y: 46 } },
  ],
  dialogues: {
    ...dog.nodes,
    dog_conf: { id: "dog_conf", speaker: "player", zh: "您说在训练,可是签名本上写您一点五十分就走了。买电影票的人也穿着运动服。", vi: "Ông nói đang tập, nhưng sổ ký tên ghi ông đi từ 1 giờ 50. Người mua vé xem phim cũng mặc đồ thể thao.", next: "dog_conf2" },
    dog_conf2: { id: "dog_conf2", speaker: "dog", zh: "我……我只是去买电影票。", vi: "Tôi... tôi chỉ đi mua vé xem phim thôi.", effects: [{ clue: "dog_slip" }, { flag: "confronted:dog" }], next: "dog_conf3" },
    dog_conf3: { id: "dog_conf3", speaker: "dog", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
