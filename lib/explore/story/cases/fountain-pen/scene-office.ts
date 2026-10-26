import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "你好!有事吗?", vi: "Chào bạn! Có việc gì không?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều qua ông ở đâu?" },
  chatter: [
    { ask: { zh: "你们公司做什么?", vi: "Công ty ông làm gì?" }, reply: { zh: "我们做软件。", vi: "Chúng tôi làm phần mềm." } },
    { ask: { zh: "你忙吗?", vi: "Ông có bận không?" }, reply: { zh: "很忙,每天开会。", vi: "Rất bận, ngày nào cũng họp." } },
  ],
  answer: { zh: "我在办公室开会。三点前,我看见一只鸭子走过,脚上有沙子。", vi: "Tôi họp ở văn phòng. Trước ba giờ, tôi thấy một con vịt đi qua, chân dính cát." },
  check: { vi: "Chú Chó nói ông thấy gì trước ba giờ?", right: { zh: "一只鸭子,脚上有沙子", vi: "Một con vịt, chân dính cát" }, wrong: [{ zh: "一只猪在买东西", vi: "Một con heo đang mua đồ" }, { zh: "一只猫在睡觉", vi: "Một con mèo đang ngủ" }], rightAt: 0 },
  clue: "dog_alibi", metFlag: "met:dog",
  closing: { zh: "会议记录在墙上,你可以看看。", vi: "Biên bản họp ở trên tường, bạn có thể xem." },
  after: { zh: "记录在墙上。还有事吗?", vi: "Biên bản ở trên tường. Còn việc gì không?" },
});

/** Văn phòng: biên bản họp xác nhận Chó ở phòng họp; lời khai của Chó cho biết ông thấy một con vịt chân dính cát. */
export const OFFICE_STORY: StorySceneDef = {
  sceneId: "office",
  sceneNpcEntries: dog.entries,
  spots: [{ id: "meeting_note", clue: "meeting_note", label: "Biên bản cuộc họp", sprite: "clipboard", x: 80, y: 30, w: 5, when: { all: ["met:dog"] }, stand: { x: 80, y: 46 } }],
  dialogues: dog.nodes,
};
