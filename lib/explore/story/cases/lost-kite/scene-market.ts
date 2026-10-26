import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要买水果吗?", vi: "Chào bạn! Bạn muốn mua trái cây không?" },
  question: { zh: "昨天中午十二点你在哪儿?", vi: "Mười hai giờ trưa qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "这个多少钱?", vi: "Cái này bao nhiêu tiền?" }, reply: { zh: "五块钱。", vi: "Năm tệ." } },
    { ask: { zh: "你的水果新鲜吗?", vi: "Trái cây của cô tươi không?" }, reply: { zh: "很新鲜!", vi: "Rất tươi!" } },
  ],
  answer: { zh: "昨天中午十二点,我在市场卖水果。", vi: "Trưa qua mười hai giờ, tôi bán trái cây ở chợ." },
  check: { vi: "Cô Mèo nói trưa qua 12 giờ cô ở đâu?", right: { zh: "在市场", vi: "Ở chợ" }, wrong: [{ zh: "在海边", vi: "Ở bãi biển" }, { zh: "在医院", vi: "Ở bệnh viện" }], rightAt: 0 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "我的脚印和告示都在这里。", vi: "Dấu chân và bảng thông báo của tôi đều ở đây." },
  after: { zh: "告示在墙上。还要买水果吗?", vi: "Bảng ở trên tường. Bạn còn muốn mua trái cây không?" },
});

/** Chợ: dấu chân Mèo khớp dấu trên cát, bảng nghỉ trưa bác bỏ lời khai; hỏi lại khi có cả hai thì Mèo đổi lời. */
export const MARKET_STORY: StorySceneDef = {
  sceneId: "market",
  sceneNpcEntries: [
    { when: { all: ["met:cat", "clue:market_sign", "clue:paw_print"], none: ["confronted:cat"] }, node: "cat_conf" },
    ...cat.entries,
  ],
  spots: [
    { id: "cat_print", clue: "cat_print", label: "Dấu chân trước sạp", sprite: "note", x: 52, y: 92, w: 4, when: { all: ["met:cat"] } },
    { id: "market_sign", clue: "market_sign", label: "Bảng nghỉ trưa", sprite: "clipboard", x: 50, y: 31, w: 5, when: { all: ["met:cat"] }, stand: { x: 50, y: 46 } },
  ],
  dialogues: {
    ...cat.nodes,
    cat_conf: { id: "cat_conf", speaker: "player", zh: "您说十二点在卖水果,可是告示写着市场休息。", vi: "Cô nói mười hai giờ đang bán trái cây, nhưng bảng ghi chợ nghỉ trưa.", next: "cat_conf2" },
    cat_conf2: { id: "cat_conf2", speaker: "cat", zh: "我……我去买面条了。", vi: "Tôi... tôi đi mua mì thôi.", effects: [{ clue: "cat_slip" }, { flag: "confronted:cat" }], next: "cat_conf3" },
    cat_conf3: { id: "cat_conf3", speaker: "cat", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
