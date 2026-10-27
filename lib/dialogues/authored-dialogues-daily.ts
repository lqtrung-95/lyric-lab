import type { DialogueDef, DialogueLine, DialogueTopic } from "./dialogue-types";

/** Viết gọn: mỗi dòng [người nói, Hán, Việt]. */
export function dlg(id: string, title: [string, string], topic: DialogueTopic, speakers: [string, string], lines: [number, string, string][]): DialogueDef {
  return { id, title: { zh: title[0], vi: title[1] }, topic, speakers, lines: lines.map(([who, zh, vi]): DialogueLine => ({ who, zh, vi })) };
}

/** Hội thoại đời sống hằng ngày, câu ngắn, từ thông dụng (cấp thấp). Tự viết. */
export const DAILY_DIALOGUES: DialogueDef[] = [
  dlg("weekend-plans", ["周末做什么?", "Cuối tuần làm gì?"], "life", ["李娜", "赵宇"], [
    [0, "赵宇,这个星期六你做什么?", "Triệu Vũ, thứ bảy này bạn làm gì?"],
    [1, "我还没想好。你呢?", "Tôi chưa nghĩ ra. Còn bạn?"],
    [0, "我想去公园玩,你想去吗?", "Tôi muốn đi công viên chơi, bạn có muốn đi không?"],
    [1, "好啊。天气怎么样?", "Được chứ. Thời tiết thế nào?"],
    [0, "听说天气很好,不冷也不热。", "Nghe nói thời tiết rất đẹp, không lạnh cũng không nóng."],
    [1, "那我们带一点吃的吧。", "Vậy chúng ta mang theo chút đồ ăn nhé."],
    [0, "好,我带水果,你带面包。", "Được, tôi mang trái cây, bạn mang bánh mì."],
    [1, "没问题。几点见面?", "Không vấn đề. Mấy giờ gặp nhau?"],
    [0, "上午九点,在公园门口。", "Chín giờ sáng, ở cổng công viên."],
    [1, "好的,星期六见!", "Được, thứ bảy gặp!"],
  ]),
  dlg("birthday-cake", ["谁去买生日蛋糕?", "Ai đi mua bánh sinh nhật?"], "life", ["小美", "小明"], [
    [0, "明天是妈妈的生日。", "Ngày mai là sinh nhật của mẹ."],
    [1, "我知道。我们要买一个蛋糕。", "Mình biết. Chúng ta phải mua một chiếc bánh."],
    [0, "你去买,还是我去买?", "Bạn đi mua hay mình đi mua?"],
    [1, "我下午有课,你去吧。", "Chiều nay mình có tiết, bạn đi đi."],
    [0, "好。她喜欢什么口味?", "Được. Mẹ thích vị gì?"],
    [1, "她喜欢草莓的,不要太甜。", "Mẹ thích vị dâu, đừng ngọt quá."],
    [0, "要不要写字?", "Có cần viết chữ lên không?"],
    [1, "写“妈妈,生日快乐”。", "Viết “Mẹ, sinh nhật vui vẻ”."],
    [0, "没问题,我现在就去。", "Không vấn đề, mình đi ngay bây giờ."],
  ]),
  dlg("new-home", ["找一个新住处", "Tìm chỗ ở mới"], "life", ["中介", "客人"], [
    [0, "您好,您想租什么样的房子?", "Xin chào, quý khách muốn thuê nhà thế nào?"],
    [1, "我想租一个小一点的,离地铁站近。", "Tôi muốn thuê căn nhỏ một chút, gần ga tàu điện ngầm."],
    [0, "这套怎么样?走路五分钟就到。", "Căn này thế nào? Đi bộ năm phút là tới."],
    [1, "一个月多少钱?", "Một tháng bao nhiêu tiền?"],
    [0, "三千块,包水电。", "Ba nghìn tệ, đã gồm tiền điện nước."],
    [1, "有点儿贵,能便宜一点吗?", "Hơi đắt, có thể rẻ hơn một chút không?"],
    [0, "我问问房东。两千八怎么样?", "Để tôi hỏi chủ nhà. Hai nghìn tám thì sao?"],
    [1, "可以。我想先看看房子。", "Được. Tôi muốn xem nhà trước."],
    [0, "好的,请跟我来。", "Vâng, mời đi theo tôi."],
  ]),
  dlg("order-dinner", ["在饭馆点菜", "Gọi món ở nhà hàng"], "food", ["服务员", "客人"], [
    [0, "欢迎光临,几位?", "Chào mừng quý khách, mấy người ạ?"],
    [1, "三位,有靠窗的位子吗?", "Ba người, có chỗ gần cửa sổ không?"],
    [0, "有,请坐。这是菜单。", "Có, mời ngồi. Đây là thực đơn."],
    [1, "我们要一个鱼,一个青菜,还有三碗米饭。", "Chúng tôi lấy một món cá, một món rau xanh và ba bát cơm."],
    [0, "要喝点什么?", "Quý khách uống gì ạ?"],
    [1, "三杯茶,谢谢。", "Ba cốc trà, cảm ơn."],
    [0, "好的,请稍等。", "Vâng, xin chờ một lát."],
    [1, "服务员,菜上齐了吗?", "Phục vụ ơi, món đã đủ chưa?"],
    [0, "上齐了,请慢用。", "Đủ rồi ạ, mời quý khách dùng bữa."],
    [1, "太好吃了!买单。", "Ngon quá! Tính tiền nhé."],
  ]),
  dlg("phone-repair", ["手机坏了", "Điện thoại bị hỏng"], "shopping", ["店员", "顾客"], [
    [0, "您好,有什么可以帮您?", "Xin chào, tôi có thể giúp gì cho quý khách?"],
    [1, "我的手机屏幕坏了。", "Màn hình điện thoại của tôi bị hỏng."],
    [0, "我看一看。是摔坏的吗?", "Để tôi xem. Là do bị rơi vỡ à?"],
    [1, "是的,昨天掉在地上了。", "Đúng vậy, hôm qua rơi xuống đất."],
    [0, "要换一个新屏幕,三百块。", "Phải thay màn hình mới, ba trăm tệ."],
    [1, "要多长时间?", "Mất bao lâu?"],
    [0, "大概一个小时。", "Khoảng một tiếng."],
    [1, "好,我去旁边吃点东西,一会儿回来。", "Được, tôi đi ăn chút gì bên cạnh, lát quay lại."],
  ]),
];
