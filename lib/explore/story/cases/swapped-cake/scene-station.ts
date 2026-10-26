import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你要坐火车吗?", vi: "Chào bạn! Bạn muốn đi tàu không?" },
  question: { zh: "昨天下午两点到两点半你在哪儿?", vi: "Hai giờ đến hai giờ rưỡi chiều qua anh ở đâu?" },
  chatter: [
    { ask: { zh: "火车几点来?", vi: "Mấy giờ tàu đến?" }, reply: { zh: "三点十分。", vi: "Ba giờ mười phút." } },
    { ask: { zh: "票多少钱?", vi: "Vé bao nhiêu tiền?" }, reply: { zh: "五十块。有优惠券可以便宜。", vi: "Năm mươi tệ. Có phiếu giảm giá thì rẻ hơn." } },
  ],
  answer: { zh: "我在火车站卖票。两点一刻,我看见医生走进饭馆。", vi: "Tôi bán vé ở ga tàu. Hai giờ mười lăm, tôi thấy bác sĩ đi vào quán ăn." },
  check: { vi: "Trưởng ga Thỏ nói lúc 2 giờ 15 anh thấy ai đi vào quán ăn?", right: { zh: "医生", vi: "Bác sĩ" }, wrong: [{ zh: "老师", vi: "Cô giáo" }, { zh: "猫", vi: "Mèo" }], rightAt: 0 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "我的告示在窗口旁边,你可以看看。", vi: "Bảng thông báo của tôi ở cạnh cửa sổ, bạn có thể xem." },
  after: { zh: "你还想问什么?", vi: "Bạn còn muốn hỏi gì?" },
});

/** Nhà ga: lời Thỏ đổ lỗi cho Cáo bị bác bỏ bởi sổ phẫu thuật; bảng đóng cửa sổ bán vé bác bỏ lời "đang bán vé"; hỏi lại khi có cả hai thì Thỏ đổi lời. */
export const STATION_STORY: StorySceneDef = {
  sceneId: "station",
  sceneNpcEntries: [
    { when: { all: ["met:rabbit", "clue:ticket_closed", "clue:sign_sheet"], none: ["confronted:rabbit"] }, node: "rabbit_conf" },
    ...rabbit.entries,
  ],
  spots: [{ id: "ticket_closed", clue: "ticket_closed", label: "Bảng ở cửa sổ bán vé", sprite: "clipboard", x: 9, y: 31, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 9, y: 48 } }],
  dialogues: {
    ...rabbit.nodes,
    rabbit_conf: { id: "rabbit_conf", speaker: "player", zh: "您说两点在卖票,可是售票窗口关门了。医生也在做手术。", vi: "Anh nói hai giờ đang bán vé, nhưng cửa sổ bán vé đã đóng. Bác sĩ cũng đang phẫu thuật.", next: "rabbit_conf2" },
    rabbit_conf2: { id: "rabbit_conf2", speaker: "rabbit", zh: "我……我只是记错了时间。", vi: "Tôi... tôi chỉ nhớ nhầm giờ thôi.", effects: [{ clue: "rabbit_slip" }, { flag: "confronted:rabbit" }], next: "rabbit_conf3" },
    rabbit_conf3: { id: "rabbit_conf3", speaker: "rabbit", zh: "别再问了!", vi: "Đừng hỏi nữa!", next: null },
  },
};
