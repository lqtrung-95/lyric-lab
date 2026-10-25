import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const turtle = buildInterview({
  prefix: "turtle", speaker: "turtle",
  gate: { all: ["met:fox", "clue:sign_sheet", "clue:pens_jar"] },
  greeting: { zh: "你好,年轻人。公园很漂亮,对不对?", vi: "Chào chàng trai. Công viên đẹp quá, đúng không?" },
  question: { zh: "昨天下午三点你看见什么了?", vi: "Ba giờ chiều hôm qua ông đã nhìn thấy gì?" },
  chatter: [{ ask: { zh: "你每天都来公园吗?", vi: "Ngày nào ông cũng ra công viên à?" }, reply: { zh: "对,我每天都来。", vi: "Đúng, ngày nào tôi cũng đến." } }],
  answer: { zh: "昨天下午三点,我在公园看见一只狐狸。他手里有一个木盒子。", vi: "Ba giờ chiều hôm qua, tôi nhìn thấy một con cáo trong công viên. Trong tay nó có một cái hộp gỗ." },
  check: { vi: "Ông Rùa đã nhìn thấy con vật nào?", right: { zh: "狐狸", vi: "Con cáo" }, wrong: [{ zh: "兔子", vi: "Con thỏ" }, { zh: "小猫", vi: "Con mèo" }], rightAt: 2 },
  clue: "witness", metFlag: "met:turtle",
  closing: { zh: "他穿着白衣服,跑得很快。", vi: "Nó mặc áo trắng và chạy rất nhanh." },
  after: { zh: "我老了,但是我记得很清楚。", vi: "Tôi già rồi, nhưng tôi nhớ rất rõ." },
});

/** Công viên: Ông Rùa là nhân chứng, chỉ chịu nói khi bạn đã biết chuyện ở bệnh viện (chưa đủ thì ông ngủ gật). */
export const CONG_VIEN_STORY: StorySceneDef = {
  sceneId: "cong-vien",
  sceneNpcEntries: [...turtle.entries, { node: "turtle_idle" }],
  dialogues: {
    ...turtle.nodes,
    turtle_idle: { id: "turtle_idle", speaker: "turtle", zh: "Zzz……", vi: "(Ông Rùa đang ngủ gật. Có lẽ bạn nên tìm hiểu thêm ở bệnh viện rồi hãy quay lại.)", next: null },
  },
};
