import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  dog: { name: "Chú Chó PT", sprite: "dog" },
  fox: { name: "Cô Cáo nhân viên", sprite: "fox" },
  rabbit: { name: "Thỏ soát vé", sprite: "rabbit" },
  cat: { name: "Cô Mèo thợ tóc", sprite: "cat" },
  owl: { name: "Cô Cú giám đốc", sprite: "owl" },
};

/**
 * Manh mối vụ Khó với bước ngoặt: người báo án (Chó) mới là người nói dối. Lớp bụi dày cho thấy cúp đã mất từ nhiều ngày trước (không phải chiều qua);
 * Cáo chỉ kể điều quan trọng khi đã thấy lớp bụi; đơn mượn của bảo tàng ghi tên Chó; hỏi lại Chó cần cả ba thứ. Hai mồi nhử (thùng bắp vàng của Thỏ, nhũ vàng của Mèo).
 */
export const CLUES: ClueDef[] = [
  { id: "dust_shelf", title: "Lớp bụi trên giá cúp", zh: "奖杯架上有一层厚厚的灰,奖杯至少五天不在了。", vi: "Trên giá để cúp có một lớp bụi dày, cúp đã không còn ở đây ít nhất năm ngày.", sceneId: "gym", kind: "object" },
  { id: "gold_dust", title: "Vết nhũ vàng", zh: "架子旁边有一点金色的闪粉。", vi: "Cạnh giá có một chút nhũ vàng lấp lánh.", sceneId: "gym", kind: "object" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "昨天下午三点,我在银行上班。", vi: "Chiều qua lúc 3 giờ, tôi làm việc ở ngân hàng.", sceneId: "bank", kind: "testimony" },
  { id: "witness_fox", title: "Cô Cáo kể chuyện tuần trước", zh: "上个星期二,我看见小狗拿着一个金色的盒子走向博物馆。", vi: "Thứ Ba tuần trước, tôi thấy Chó cầm một cái hộp màu vàng đi về phía bảo tàng.", sceneId: "bank", kind: "testimony" },
  { id: "rabbit_alibi", title: "Lời khai của Thỏ", zh: "昨天下午三点,我在电影院卖票。", vi: "Chiều qua lúc 3 giờ, tôi bán vé ở rạp phim.", sceneId: "cinema", kind: "testimony" },
  { id: "sales_log", title: "Sổ bán vé của rạp", zh: "电影院昨天下午两点到四点一直有人买票。兔子一直在窗口。", vi: "Rạp phim chiều qua từ 2 đến 4 giờ lúc nào cũng có người mua vé. Thỏ ở quầy suốt.", sceneId: "cinema", kind: "document" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天下午三点,我在店里给客人染头发。", vi: "Chiều qua lúc 3 giờ, tôi nhuộm tóc cho khách trong tiệm.", sceneId: "salon", kind: "testimony" },
  { id: "appointment", title: "Sổ hẹn của hiệu tóc", zh: "猫昨天下午两点半到四点半一直在店里。", vi: "Mèo ở trong tiệm suốt từ 2 giờ 30 đến 4 giờ 30 chiều qua.", sceneId: "salon", kind: "document" },
  { id: "owl_alibi", title: "Lời khai của Cô Cú", zh: "昨天下午三点,我在博物馆开会。", vi: "Chiều qua lúc 3 giờ, tôi họp ở bảo tàng.", sceneId: "museum", kind: "testimony" },
  { id: "loan_form", title: "Đơn mượn trưng bày", zh: "借展单:金奖杯。借出人:小狗。借展七天。", vi: "Đơn mượn trưng bày: cúp vàng. Người cho mượn: Chó. Thời hạn bảy ngày.", sceneId: "museum", kind: "document" },
  { id: "dog_slip", title: "Chó thú nhận", zh: "我……我忘了,是我自己把奖杯借给博物馆的。", vi: "Tôi... tôi quên mất, chính tôi đã cho bảo tàng mượn cúp.", sceneId: "gym", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "dog", name: "Chú Chó PT (người báo án)", sprite: "dog", sceneId: "gym", metFlag: "met:dog", note: "Báo cúp bị mất chiều qua lúc 3 giờ. Nhưng bụi trên giá cho thấy cúp đã đi từ lâu." },
  { id: "fox", name: "Cô Cáo nhân viên", sprite: "fox", sceneId: "bank", metFlag: "met:fox", note: "Nói chiều qua đi làm. Cô nhớ thấy Chó mang một cái hộp vàng đi bảo tàng tuần trước." },
  { id: "rabbit", name: "Thỏ soát vé", sprite: "rabbit", sceneId: "cinema", metFlag: "met:rabbit", note: "Nói bán vé cả buổi. Sổ bán vé xác nhận; thùng bắp vàng của anh chỉ là mồi nhử." },
  { id: "cat", name: "Cô Mèo thợ tóc", sprite: "cat", sceneId: "salon", metFlag: "met:cat", note: "Nói đang nhuộm tóc cho khách. Sổ hẹn xác nhận; nhũ vàng là của tiệm cô." },
  { id: "owl", name: "Cô Cú giám đốc", sprite: "owl", sceneId: "museum", metFlag: "met:owl", note: "Nói chiều qua họp ở bảo tàng. Đơn mượn trưng bày ghi tên người cho mượn cúp." },
];

export const OBJECTIVES: Objective[] = [
  { id: "talk-dog", sceneId: "gym", text: "Nói chuyện với Chú Chó ở Phòng gym để nhận vụ án.", done: { all: ["met:dog"] } },
  { id: "inspect-gym", sceneId: "gym", text: "Xem xét giá để cúp: xem kỹ những gì còn lại trên giá.", when: { all: ["met:dog"] }, done: { all: ["clue:dust_shelf", "clue:gold_dust"] } },
  { id: "fox", sceneId: "bank", text: "Đến Ngân hàng: hỏi Cô Cáo, rồi hỏi cô có nhớ lần cuối thấy chiếc cúp không.", when: { all: ["clue:dust_shelf", "clue:gold_dust"] }, done: { all: ["met:fox", "clue:witness_fox"] } },
  { id: "rabbit", sceneId: "cinema", text: "Đến Rạp chiếu phim: hỏi Thỏ và xem sổ bán vé.", when: { all: ["met:fox", "clue:witness_fox"] }, done: { all: ["met:rabbit", "clue:sales_log"] } },
  { id: "cat", sceneId: "salon", text: "Đến Hiệu cắt tóc: hỏi Cô Mèo và xem sổ hẹn.", when: { all: ["met:rabbit", "clue:sales_log"] }, done: { all: ["met:cat", "clue:appointment"] } },
  { id: "owl", sceneId: "museum", text: "Đến Bảo tàng: hỏi Cô Cú và xem đơn mượn trưng bày.", when: { all: ["met:cat", "clue:appointment"] }, done: { all: ["met:owl", "clue:loan_form"] } },
  { id: "dog-again", sceneId: "gym", text: "Quay lại Phòng gym: hỏi lại Chú Chó khi đã có đủ chứng cứ.", when: { all: ["clue:loan_form", "clue:witness_fox", "clue:dust_shelf"] }, done: { all: ["clue:dog_slip"] } },
  { id: "accuse", sceneId: "gym", text: "Nói với Chú Chó bạn biết cúp ở đâu và ai đã nói dối.", when: { all: ["clue:dog_slip"] }, done: { all: ["case:solved"] } },
];
