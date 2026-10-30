import type { GrammarPattern } from "./grammar-types";

const L = 5 as const;
export const HSK5_PATTERNS: GrammarPattern[] = [
  {
    id: "hekuang", level: L, title: "何况: huống chi", pattern: "A 都 / 尚且 …，何况 B (呢)", key: ["何况"],
    explain: "Nêu một việc dễ (hoặc nhỏ) đã như vậy, rồi dùng 何况 để nói việc khó (hoặc lớn hơn) thì càng như vậy. Vế đầu là tiền đề, vế sau với 何况 là điều suy ra.",
    vsVi: "Giống “huống chi, nói gì đến”: ngay cả trẻ con còn biết, huống chi bạn. Tiếng Việt cũng đặt ý dễ trước, ý khó sau.",
    mistakes: [{ wrong: "何况你呢，孩子都会。", right: "孩子都会，何况你呢？", why: "Tiền đề (việc dễ) phải đứng trước, 何况 mở vế sau." }],
    examples: [{ zh: "这么|简单|的|题|孩子|都|会，|何况|你|呢？", vi: "Bài đơn giản thế này trẻ con còn biết, huống chi bạn?" }, { zh: "走路|都|累，|何况|还|要|搬|东西。", vi: "Đi bộ còn mệt, huống chi còn phải khuân đồ." }, { zh: "他|平时|都|不|吃|辣，|何况|是|这么|辣|的|菜。", vi: "Bình thường anh ấy còn không ăn cay, huống chi món cay thế này." }],
    detect: "何况",
  },
  {
    id: "guran", level: L, title: "固然…但是…", pattern: "A 固然 …，但是 / 可是 B", key: ["固然", "但是"],
    explain: "Thừa nhận A là đúng, rồi chuyển sang B mới là điều quan trọng hơn hoặc điều còn thiếu. Trang trọng và mang tính nhận định hơn 虽然…但是….",
    vsVi: "Giống “đúng là… nhưng…”, “cố nhiên… song…”. Khác 虽然: 固然 chỉ nhượng bộ nhẹ, trọng tâm luôn ở vế sau.",
    mistakes: [{ wrong: "固然他很忙，所以他来了。", right: "他固然很忙，但是还是来了。", why: "固然 mở ra nhượng bộ rồi chuyển ý (但是), không phải quan hệ nguyên nhân – kết quả." }],
    examples: [{ zh: "努力|固然|重要，|但是|方法|更|重要。", vi: "Cố gắng đúng là quan trọng, nhưng phương pháp còn quan trọng hơn." }, { zh: "价格|固然|便宜，|但是|质量|不|太|好。", vi: "Giá đúng là rẻ, nhưng chất lượng không tốt lắm." }, { zh: "这|个|方案|固然|好，|但是|成本|太|高|了。", vi: "Phương án này tốt thật, nhưng chi phí quá cao." }],
    detect: "固然",
  },
  {
    id: "yibian-purpose", level: L, title: "以便: để tiện", pattern: "A，以便 B", key: ["以便"],
    explain: "以便 đứng đầu vế sau để nêu mục đích: làm A nhằm tạo điều kiện thuận lợi cho B. Chủ ngữ của vế sau thường là chính người làm A hoặc người liên quan.",
    vsVi: "Giống “để tiện, nhằm để”: để lại số điện thoại để chúng tôi liên lạc.",
    mistakes: [{ wrong: "以便我们联系你，请留下电话。", right: "请留下电话，以便我们联系你。", why: "以便 phải mở vế sau, nêu mục đích của hành động ở vế trước." }],
    examples: [{ zh: "请|留|下|电话，|以便|我们|联系|你。", vi: "Xin để lại số điện thoại để chúng tôi tiện liên lạc với bạn." }, { zh: "他|提前|出发，|以便|赶上|早班|车。", vi: "Anh ấy xuất phát sớm để kịp chuyến xe sớm." }, { zh: "把|重点|写|下来，|以便|复习。", vi: "Ghi lại trọng tâm để tiện ôn tập." }],
    detect: "以便",
  },
  {
    id: "nanmian", level: L, title: "难免: khó tránh", pattern: "A 难免 (会) + động từ / tính từ", key: ["难免"],
    explain: "难免 nói điều gì đó khó tránh khỏi trong hoàn cảnh nhất định, thường là điều không mong muốn nhưng bình thường. Đứng sau chủ ngữ, trước động từ.",
    vsVi: "Giống “khó tránh khỏi, không tránh được”: lần đầu làm khó tránh khỏi sai sót.",
    mistakes: [{ wrong: "他迟到了，难免老师生气。", right: "他迟到了，老师难免会生气。", why: "难免 đứng sau chủ ngữ (老师) và trước động từ, thường kèm 会." }],
    examples: [{ zh: "第一|次|做，|难免|会|出错。", vi: "Lần đầu làm khó tránh khỏi sai." }, { zh: "人|难免|会|犯|错。", vi: "Con người khó tránh khỏi phạm lỗi." }, { zh: "刚|来|的|时候，|难免|有|点|紧张。", vi: "Lúc mới đến khó tránh khỏi hơi căng thẳng." }],
    detect: "难免",
  },
  {
    id: "faner", level: L, title: "反而: ngược lại", pattern: "A 不 / 没 …，反而 B", key: ["反而"],
    explain: "反而 báo kết quả trái với dự đoán: lẽ ra phải thế này nhưng lại ra thế khác. Vế trước thường có 不/没 hoặc nêu điều kiện, vế sau dùng 反而.",
    vsVi: "Giống “ngược lại, trái lại, lại còn”: không những không giận mà ngược lại còn cười.",
    mistakes: [{ wrong: "他很高兴，反而笑了。", right: "他没生气，反而笑了。", why: "反而 cần một vế trước nêu điều ngược kỳ vọng (thường phủ định); “vui rồi cười” là thuận nên không dùng 反而." }],
    examples: [{ zh: "雨|没|停，|反而|越|下|越|大。", vi: "Mưa không tạnh, ngược lại càng lúc càng to." }, { zh: "他|不但|没|生气，|反而|笑|了。", vi: "Anh ấy không những không giận mà còn cười." }, { zh: "吃|了|药，|病|反而|更|重|了。", vi: "Uống thuốc rồi mà bệnh ngược lại nặng hơn." }],
    detect: "反而",
  },
  {
    id: "budebu", level: L, title: "不得不: buộc phải", pattern: "A 不得不 + động từ", key: ["不得不"],
    explain: "不得不 diễn tả việc làm vì hoàn cảnh bắt buộc, không còn lựa chọn khác, dù không muốn. Là phủ định kép nên nghĩa khẳng định, mạnh hơn 只好 một chút.",
    vsVi: "Giống “đành phải, buộc phải, bất đắc dĩ phải”.",
    mistakes: [{ wrong: "我不得不想去。", right: "我不得不去。", why: "不得不 nói việc bị ép phải làm, không đi với 想 (muốn) vì mâu thuẫn." }],
    examples: [{ zh: "太|晚|了，|我|不得不|打车|回家。", vi: "Muộn quá, tôi đành phải bắt taxi về nhà." }, { zh: "下雨|了，|我们|不得不|取消|比赛。", vi: "Trời mưa rồi, chúng tôi buộc phải hủy trận đấu." }, { zh: "为了|工作，|他|不得不|搬家。", vi: "Vì công việc, anh ấy buộc phải chuyển nhà." }],
    detect: "不得不",
  },
  {
    id: "jiran-jiu", level: L, title: "既然…就…", pattern: "既然 A，(那么) 就 B", key: ["既然", "就"],
    explain: "既然 nêu một sự thật đã biết hoặc đã xảy ra làm tiền đề, vế sau với 就 đưa ra kết luận, đề nghị hay quyết định dựa trên tiền đề đó.",
    vsVi: "Giống “đã… thì…”: đã đến rồi thì ngồi thêm chút nữa.",
    mistakes: [{ wrong: "既然你累了，所以休息吧。", right: "既然你累了，就休息吧。", why: "Vế sau của 既然 đi với 就, không dùng 所以." }],
    examples: [{ zh: "既然|你|来|了，|就|多|坐|一会儿。", vi: "Đã đến rồi thì ngồi thêm chút nữa." }, { zh: "既然|决定|了，|就|别|后悔。", vi: "Đã quyết định rồi thì đừng hối hận." }, { zh: "既然|大家|都|同意，|我们|就|开始|吧。", vi: "Mọi người đều đồng ý thì chúng ta bắt đầu thôi." }],
    detect: "既然",
  },
  {
    id: "ningke", level: L, title: "宁可…也不 / 也要", pattern: "宁可 A，也 (不) B", key: ["宁可", "也"],
    explain: "So sánh hai điều không tốt và chọn cái ít tệ hơn: thà A còn hơn B. 宁可 nêu cái chấp nhận, 也不 nêu cái từ chối; 也要 nêu điều nhất định làm.",
    vsVi: "Giống “thà… còn hơn…”, “thà… cũng không…”.",
    mistakes: [{ wrong: "我宁可走路，不想挤地铁。", right: "我宁可走路，也不想挤地铁。", why: "Vế sau của 宁可 cần 也 (也不 / 也要) để hoàn chỉnh mẫu." }],
    examples: [{ zh: "我|宁可|走路，|也|不|想|挤|地铁。", vi: "Tôi thà đi bộ còn hơn chen chúc tàu điện ngầm." }, { zh: "他|宁可|饿着，|也|不|吃|剩饭。", vi: "Anh ấy thà nhịn đói chứ không ăn cơm thừa." }, { zh: "宁可|少|睡，|也|要|完成|工作。", vi: "Thà ngủ ít cũng phải hoàn thành công việc." }],
    detect: "宁可|宁愿",
  },
];
