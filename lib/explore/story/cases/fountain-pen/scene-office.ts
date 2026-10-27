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

/** Văn phòng: biên bản cho thấy họp bắt đầu lúc 3 giờ 20 nên Chó không có chứng cứ ngoại phạm lúc 3 giờ; khay cát trắng mịn trên bàn khớp với cát ở nắp bút. Khi đã so cát và mốc giờ, hỏi lại thì Chó đổi lời. */
export const OFFICE_STORY: StorySceneDef = {
  sceneId: "office",
  sceneNpcEntries: [
    { when: { all: ["met:dog", "clue:meeting_note", "clue:office_sand", "clue:pen_cap", "clue:beach_sand", "clue:library_card"], none: ["confronted:dog"] }, node: "dog_conf" },
    ...dog.entries,
  ],
  spots: [
    { id: "meeting_note", clue: "meeting_note", label: "Biên bản cuộc họp", sprite: "clipboard", x: 80, y: 30, w: 5, when: { all: ["met:dog"] }, stand: { x: 80, y: 46 } },
    { id: "office_sand", clue: "office_sand", label: "Khay cát trên bàn", sprite: "bag", x: 24, y: 80, w: 4, when: { all: ["met:dog"] }, stand: { x: 24, y: 90 } },
  ],
  dialogues: {
    ...dog.nodes,
    dog_conf: { id: "dog_conf", speaker: "player", zh: "笔帽上的沙子是白色的细沙,和您桌上的一样,不是海边的黄沙。鸭子两点五十分就离开了图书馆,三点笔还在。而您三点二十分才开会。", vi: "Cát trên nắp bút là cát trắng mịn, giống khay trên bàn ông, không phải cát vàng ở biển. Vịt rời thư viện lúc 2 giờ 50, đến 3 giờ bút vẫn còn. Còn ông thì 3 giờ 20 mới họp.", next: "dog_conf2" },
    dog_conf2: { id: "dog_conf2", speaker: "dog", zh: "我……我只是想用它写一份报告,明天就还给她。", vi: "Tôi... tôi chỉ muốn dùng nó viết một bản báo cáo, mai trả cô ấy thôi.", effects: [{ clue: "dog_slip" }, { flag: "confronted:dog" }], next: "dog_conf3" },
    dog_conf3: { id: "dog_conf3", speaker: "dog", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
