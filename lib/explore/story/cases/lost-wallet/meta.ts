import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  fox: { name: "Cô Cáo nhân viên", sprite: "fox" },
  rabbit: { name: "Thỏ soát vé", sprite: "rabbit" },
  cat: { name: "Cô Mèo thợ tóc", sprite: "cat" },
  pig: { name: "Cô Heo thu ngân", sprite: "pig" },
  dog: { name: "Chú Chó PT", sprite: "dog" },
};

/** Vụ Vừa: hai đồ vật rơi lại (cuống vé xem phim, kẹp tóc) chỉ về hai người, một người mua vé mặc đồ thể thao; phải loại ba người bằng sổ sách rồi hỏi lại người còn lại. */
export const CLUES: ClueDef[] = [
  { id: "stub", title: "Cuống vé xem phim", zh: "柜台旁边有一张电影票根,是下午两点半的场次。", vi: "Cạnh quầy có một cuống vé xem phim, suất 2 giờ 30 chiều.", sceneId: "bank", kind: "object" },
  { id: "hairpin_c", title: "Chiếc kẹp tóc hồng", zh: "地上有一个粉红色的发夹。", vi: "Trên sàn có một chiếc kẹp tóc màu hồng.", sceneId: "bank", kind: "object" },
  { id: "rabbit_alibi", title: "Lời khai của Thỏ", zh: "昨天下午两点到两点二十,我在电影院卖票。", vi: "Chiều qua từ 2 giờ đến 2 giờ 20, tôi bán vé ở rạp phim.", sceneId: "cinema", kind: "testimony" },
  { id: "sales_log", title: "Sổ bán vé của rạp", zh: "电影院昨天下午两点零五分,卖出了一张两点半的票。", vi: "Chiều qua 2 giờ 5, rạp bán ra một vé suất 2 giờ 30.", sceneId: "cinema", kind: "document" },
  { id: "buyer_note", title: "Người mua vé mặc đồ thể thao", zh: "买票的人穿着运动服。", vi: "Người mua vé mặc đồ thể thao.", sceneId: "cinema", kind: "testimony" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天下午两点到两点二十,我在店里给客人剪头发。", vi: "Chiều qua từ 2 giờ đến 2 giờ 20, tôi cắt tóc cho khách trong tiệm.", sceneId: "salon", kind: "testimony" },
  { id: "appointment", title: "Sổ hẹn của hiệu tóc", zh: "猫昨天下午一点半到三点一直在给客人剪头发。", vi: "Mèo cắt tóc cho khách liên tục từ 1 giờ 30 đến 3 giờ chiều qua.", sceneId: "salon", kind: "document" },
  { id: "pig_alibi", title: "Lời khai của Cô Heo", zh: "昨天下午两点到两点二十,我在超市收钱。", vi: "Chiều qua từ 2 giờ đến 2 giờ 20, tôi thu tiền ở siêu thị.", sceneId: "supermarket", kind: "testimony" },
  { id: "pig_receipt", title: "Hóa đơn siêu thị", zh: "下午两点十分,小猪还在收钱。", vi: "2 giờ 10 chiều, Heo vẫn đang thu tiền.", sceneId: "supermarket", kind: "document" },
  { id: "dog_alibi", title: "Lời khai của Chú Chó", zh: "昨天下午两点到两点二十,我在健身房训练。", vi: "Chiều qua từ 2 giờ đến 2 giờ 20, tôi tập ở phòng gym.", sceneId: "gym", kind: "testimony" },
  { id: "gym_signout", title: "Sổ ký tên của phòng gym", zh: "小狗昨天下午一点五十分就签退了。", vi: "Chó đã ký rời phòng gym lúc 1 giờ 50 chiều qua.", sceneId: "gym", kind: "document" },
  { id: "dog_slip", title: "Chó đổi lời", zh: "我……我只是去买电影票。", vi: "Tôi... tôi chỉ đi mua vé xem phim thôi.", sceneId: "gym", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "rabbit", name: "Thỏ soát vé", sprite: "rabbit", sceneId: "cinema", metFlag: "met:rabbit", note: "Nói chiều qua bán vé ở rạp. Sổ bán vé xác nhận, và cho biết người mua vé suất 2 giờ 30 mặc đồ thể thao." },
  { id: "cat", name: "Cô Mèo thợ tóc", sprite: "cat", sceneId: "salon", metFlag: "met:cat", note: "Nói đang cắt tóc cho khách. Sổ hẹn xác nhận cô làm việc liên tục." },
  { id: "pig", name: "Cô Heo thu ngân", sprite: "pig", sceneId: "supermarket", metFlag: "met:pig", note: "Nói đang thu tiền ở siêu thị. Hóa đơn lúc 2 giờ 10 xác nhận cô ở quầy." },
  { id: "dog", name: "Chú Chó PT", sprite: "dog", sceneId: "gym", metFlag: "met:dog", note: "Nói đang tập ở phòng gym. Nhưng sổ ký tên nói ông đã rời lúc 1 giờ 50…" },
];

export const OBJECTIVES: Objective[] = [
  { id: "talk-fox", sceneId: "bank", text: "Nói chuyện với Cô Cáo ở Ngân hàng để nhận vụ án.", done: { all: ["met:fox"] } },
  { id: "inspect-bank", sceneId: "bank", text: "Xem xét quầy giao dịch: xem những thứ bị bỏ lại.", when: { all: ["met:fox"] }, done: { all: ["clue:stub", "clue:hairpin_c"] } },
  { id: "rabbit", sceneId: "cinema", text: "Đến Rạp chiếu phim: hỏi Thỏ, xem sổ bán vé và hỏi ai đã mua vé suất 2 giờ 30.", when: { all: ["clue:stub", "clue:hairpin_c"] }, done: { all: ["met:rabbit", "clue:sales_log", "clue:buyer_note"] } },
  { id: "cat", sceneId: "salon", text: "Đến Hiệu cắt tóc: hỏi Cô Mèo và xem sổ hẹn.", when: { all: ["met:rabbit", "clue:buyer_note"] }, done: { all: ["met:cat", "clue:appointment"] } },
  { id: "pig", sceneId: "supermarket", text: "Đến Siêu thị: hỏi Cô Heo và xem hóa đơn.", when: { all: ["met:cat", "clue:appointment"] }, done: { all: ["met:pig", "clue:pig_receipt"] } },
  { id: "dog", sceneId: "gym", text: "Đến Phòng gym: hỏi Chú Chó, xem sổ ký tên rồi hỏi lại ông khi đã có chứng cứ.", when: { all: ["met:pig", "clue:pig_receipt"] }, done: { all: ["met:dog", "clue:gym_signout", "clue:dog_slip"] } },
  { id: "accuse", sceneId: "bank", text: "Về Ngân hàng, nói với Cô Cáo bạn biết ai đã lấy chiếc ví.", when: { all: ["clue:dog_slip"] }, done: { all: ["case:solved"] } },
];
