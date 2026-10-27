import type { StorySceneDef } from "../../story-types";

/** Cửa hàng đồ chơi: nhận vụ án từ Cụ Cú, tìm ba dấu vết của tên trộm (sợi chỉ xanh dương, chữ viết bằng tay trái, dấu giày cỡ 45), cuối cùng buộc tội và nghe kết thúc. */
export const TOYSHOP_STORY: StorySceneDef = {
  sceneId: "toyshop",
  sceneNpcEntries: [
    { when: { all: ["case:solved"] }, node: "o_done" },
    { when: { all: ["clue:dog_shoe"] }, node: "o_ready" },
    { when: { all: ["met:owl"] }, node: "o_wait" },
    { node: "o_hi" },
  ],
  spots: [
    { id: "report", clue: "report", label: "Lời báo án trên bàn", sprite: "note", x: 14, y: 86, w: 5, stand: { x: 20, y: 92 } },
    { id: "toy_thread", clue: "toy_thread", label: "Sợi chỉ trên cửa", sprite: "note", x: 68, y: 92, w: 4, when: { all: ["met:owl"] }, stand: { x: 68, y: 95 } },
    { id: "toy_hand", clue: "toy_hand", label: "Tờ giấy ghi chú trên kệ", sprite: "note", x: 24, y: 80, w: 5, when: { all: ["met:owl"] }, stand: { x: 24, y: 90 } },
    { id: "toy_foot", clue: "toy_foot", label: "Dấu chân trên sàn", sprite: "note", x: 66, y: 80, w: 5, when: { all: ["met:owl"] }, stand: { x: 66, y: 90 } },
  ],
  dialogues: {
    o_hi: { id: "o_hi", speaker: "owl", zh: "你好!我的遥控车不见了!", vi: "Chào bạn! Xe điều khiển từ xa của tôi biến mất rồi!", next: "o_ask" },
    o_ask: {
      id: "o_ask", speaker: "player", zh: "", vi: "Bạn muốn hỏi gì?",
      choices: [
        { zh: "什么时候不见的?", vi: "Mất lúc nào vậy?", next: "o_when" },
        { zh: "遥控车是什么颜色的?", vi: "Xe điều khiển màu gì?", next: "o_a0" },
      ],
    },
    o_a0: { id: "o_a0", speaker: "owl", zh: "是红色的,很快。", vi: "Màu đỏ, chạy rất nhanh.", next: "o_ask" },
    o_when: { id: "o_when", speaker: "owl", zh: "昨天晚上八点。有人进了我的店。", vi: "Tám giờ tối qua. Có người đã vào tiệm tôi.", next: "o_check" },
    o_check: {
      id: "o_check", speaker: "player", zh: "", vi: "Xe điều khiển biến mất lúc nào?",
      choices: [
        { zh: "昨天上午八点", vi: "Tám giờ sáng hôm qua", next: "o_again", check: "wrong" },
        { zh: "昨天晚上八点", vi: "Tám giờ tối qua", next: "o_ok", check: "right" },
        { zh: "今天晚上八点", vi: "Tám giờ tối hôm nay", next: "o_again", check: "wrong" },
      ],
    },
    o_again: { id: "o_again", speaker: "player", zh: "", vi: "Hmm, chưa đúng. Nghe lại nào…", next: "o_when" },
    o_ok: {
      id: "o_ok", speaker: "owl", zh: "对!请你帮帮我。昨天有五位朋友来过附近:兔子、小鸟、鸭子、老虎和小狗。",
      vi: "Đúng rồi! Xin bạn giúp tôi. Hôm qua có năm người bạn ở gần đây: thỏ, chim, vịt, hổ và chó.",
      effects: [{ flag: "met:owl" }], next: "o_task",
    },
    o_task: { id: "o_task", speaker: "owl", zh: "没有人看见他。请你找小偷留下的东西,再看看每个人。", vi: "Không ai nhìn thấy hắn. Xin bạn tìm những thứ tên trộm để lại, rồi xem xét từng người.", next: null },
    o_wait: { id: "o_wait", speaker: "owl", zh: "你找到什么了吗?再仔细看看。", vi: "Bạn tìm được gì chưa? Hãy xem kỹ thêm nữa.", next: null },
    o_ready: {
      id: "o_ready", speaker: "owl", zh: "你有什么发现?", vi: "Bạn có phát hiện gì không?",
      choices: [
        { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!", next: null, action: "accuse" },
        { zh: "我再看看。", vi: "Để tôi xem lại.", next: null },
      ],
    },
    o_done: { id: "o_done", speaker: "owl", zh: "谢谢你!你是最好的朋友。", vi: "Cảm ơn bạn! Bạn là người bạn tốt nhất.", next: null },
    o_epi1: { id: "o_epi1", speaker: "owl", zh: "太好了!遥控车找到了!", vi: "Tuyệt quá! Tìm được xe điều khiển rồi!", next: "o_epi2" },
    o_epi2: { id: "o_epi2", speaker: "player", zh: "", vi: "Chú Hổ đã thú nhận: chú lén vào tiệm lúc tám giờ để lấy chiếc xe cho cháu trai, rồi làm rơi sợi chỉ trên áo khoác xanh. Chú đã trả lại xe cho Cụ Cú.", next: "o_epi3" },
    o_epi3: { id: "o_epi3", speaker: "owl", zh: "你看,蓝线、左手和四十五码的鞋,三样都对!", vi: "Bạn thấy đấy, sợi chỉ xanh, tay trái và giày cỡ 45, cả ba đều khớp!", next: null },
  },
};
