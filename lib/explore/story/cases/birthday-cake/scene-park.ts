import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const turtle = buildInterview({
  prefix: "turtle", speaker: "turtle",
  gate: { all: ["met:cat"] },
  greeting: { zh: "你好,年轻人。今天天气真好。", vi: "Chào chàng trai. Hôm nay trời đẹp thật." },
  question: { zh: "今天下午你在公园看见什么了?", vi: "Chiều nay ông thấy gì ở công viên?" },
  chatter: [
    { ask: { zh: "你每天都来公园吗?", vi: "Ngày nào ông cũng đến công viên à?" }, reply: { zh: "是的,我喜欢晒太阳。", vi: "Ừ, tôi thích phơi nắng." } },
  ],
  answer: { zh: "三点五十分,我看见一只狗抱着一个粉色的蛋糕盒,一边走一边笑,往小猫的家走去。", vi: "3 giờ 50, tôi thấy một con chó ôm hộp bánh màu hồng, vừa đi vừa cười, đi về hướng nhà Mèo." },
  check: { vi: "Ông Rùa đã nhìn thấy gì?", right: { zh: "一只狗抱着蛋糕盒", vi: "Một con chó ôm hộp bánh" }, wrong: [{ zh: "一只猫在睡觉", vi: "Một con mèo đang ngủ" }, { zh: "一只鸟在唱歌", vi: "Một con chim đang hót" }], rightAt: 0 },
  clue: "witness_turtle", metFlag: "met:turtle",
  closing: { zh: "他笑得很开心。", vi: "Nó cười rất vui." },
  after: { zh: "我老了,但是我记得很清楚。", vi: "Tôi già rồi, nhưng tôi nhớ rất rõ." },
});

/** Công viên: Ông Rùa kể thấy Chó ôm hộp bánh hồng đi về hướng nhà Mèo (chỉ kể khi bạn đã gặp Mèo). */
export const PARK_STORY: StorySceneDef = {
  sceneId: "park",
  sceneNpcEntries: [
    ...turtle.entries,
  ],
  spots: [

  ],
  dialogues: {
    ...turtle.nodes,
  },
};
