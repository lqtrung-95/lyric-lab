import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  owl: { name: "Cụ Cú quản lý bảo tàng", sprite: "owl" },
  rabbit: { name: "Bé Thỏ bán vé", sprite: "rabbit" },
  duck: { name: "Chú Vịt tiệm giặt", sprite: "duck" },
  fox: { name: "Cô Cáo nhân viên ngân hàng", sprite: "fox" },
  pig: { name: "Anh Heo soát vé", sprite: "pig" },
};

/** Vụ có đồng phạm: Thỏ và Vịt làm chứng cho nhau (cả hai đều sai: suất chiếu bị hủy, tiệm giặt đóng cửa); Cáo và Heo có chứng cứ ngoại phạm thật. Phải chọn đúng cả hai người. */
export const CLUES: ClueDef[] = [
  { id: "museum_time", title: "Sổ trưng bày", zh: "展柜记录:三点整玉瓶还在,三点半玉瓶不见了。", vi: "Sổ trưng bày: đúng 3 giờ bình ngọc còn, 3 giờ rưỡi bình ngọc biến mất.", sceneId: "museum", kind: "document" },
  { id: "footprints", title: "Dấu chân trong phòng", zh: "展厅的地上有两种脚印,一种大,一种小。", vi: "Trên sàn phòng trưng bày có hai loại dấu chân, một to một nhỏ.", sceneId: "museum", kind: "object" },
  { id: "soap_dust", title: "Bột trắng ở bậu cửa", zh: "窗台上有一点白色的洗衣粉。", vi: "Trên bậu cửa sổ có chút bột giặt trắng.", sceneId: "museum", kind: "object" },
  { id: "rabbit_alibi", title: "Lời khai của Bé Thỏ", zh: "三点到三点半,我在电影院卖票。三点十分,鸭子来看电影。", vi: "Từ 3 đến 3 rưỡi, tôi bán vé ở rạp phim. Lúc 3:10 Vịt đến xem phim.", sceneId: "cinema", kind: "testimony" },
  { id: "cinema_log", title: "Sổ của rạp phim", zh: "电影院记录:今天下午三点十分的电影取消了,没有放映,也没有卖出电影票。", vi: "Sổ rạp phim: suất chiếu 3:10 chiều nay bị hủy, không chiếu và cũng không bán vé nào.", sceneId: "cinema", kind: "document" },
  { id: "rabbit_slip", title: "Thỏ đổi lời", zh: "我们……我们只是想借玉瓶拍张照,马上就还。", vi: "Chúng tôi... chúng tôi chỉ định mượn bình ngọc chụp một tấm ảnh rồi trả ngay.", sceneId: "cinema", kind: "testimony" },
  { id: "duck_alibi", title: "Lời khai của Chú Vịt", zh: "三点到三点半,我在电影院看电影。兔子卖给我一张票。", vi: "Từ 3 đến 3 rưỡi, tôi xem phim ở rạp. Thỏ bán cho tôi một vé.", sceneId: "laundry", kind: "testimony" },
  { id: "laundry_log", title: "Bảng của tiệm giặt", zh: "洗衣店三点到三点半关着门,店里没有人。", vi: "Tiệm giặt đóng cửa từ 3 đến 3 rưỡi, trong tiệm không có ai.", sceneId: "laundry", kind: "document" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "三点到三点半,我在银行上班。", vi: "Từ 3 đến 3 rưỡi, tôi làm việc ở ngân hàng.", sceneId: "bank", kind: "testimony" },
  { id: "bank_log", title: "Sổ giao dịch ngân hàng", zh: "银行记录:三点到三点半,狐狸一直在窗口办理业务,有十位客人签了字。", vi: "Sổ ngân hàng: từ 3 đến 3 rưỡi, Cáo ở quầy giao dịch suốt, mười khách đã ký tên.", sceneId: "bank", kind: "document" },
  { id: "pig_alibi", title: "Lời khai của Anh Heo", zh: "三点到三点半,我在机场检票。", vi: "Từ 3 đến 3 rưỡi, tôi soát vé ở sân bay.", sceneId: "airport", kind: "testimony" },
  { id: "flight_log", title: "Sổ chuyến bay", zh: "机场记录:三点二十分有一班飞机起飞,检票员小猪一直在检票口。", vi: "Sổ sân bay: 3:20 có một chuyến bay cất cánh, nhân viên soát vé Heo ở cổng suốt.", sceneId: "airport", kind: "document" },
  { id: "d_film", title: "Vịt không xem phim", zh: "三点十分的电影取消了,所以鸭子没有看电影。", vi: "Suất 3:10 bị hủy nên lời khai xem phim của Vịt là sai.", sceneId: "museum", kind: "deduction", link: ["cinema_log", "duck_alibi"] },
  { id: "d_ticket", title: "Thỏ cũng nói sai", zh: "没有卖出电影票,所以兔子的话也是假的。", vi: "Không có vé nào được bán nên lời khai bán vé cho Vịt của Thỏ cũng sai.", sceneId: "museum", kind: "deduction", link: ["cinema_log", "rabbit_alibi"] },
  { id: "d_ring", title: "hai người che cho nhau", zh: "兔子给鸭子作证,鸭子给兔子作证,可是两个人的话都是假的,他们在互相掩护。", vi: "Thỏ làm chứng cho Vịt, Vịt làm chứng cho Thỏ, nhưng cả hai đều nói sai: họ che giấu cho nhau.", sceneId: "museum", kind: "deduction", link: ["rabbit_alibi", "duck_alibi"] },
  { id: "d_two", title: "không chỉ một người", zh: "地上有两种脚印,所以小偷不止一个人。", vi: "Có hai loại dấu chân nên kẻ trộm không chỉ một người, và chuyện xảy ra trong 30 phút.", sceneId: "museum", kind: "deduction", link: ["footprints", "museum_time"] },
  { id: "d_fox_ok", title: "lời khai của Cáo khớp sổ ngân hàng", zh: "狐狸说她在银行上班,银行记录也证明了。", vi: "Cáo nói làm ở ngân hàng và sổ giao dịch chứng minh điều đó.", sceneId: "museum", kind: "deduction", link: ["fox_alibi", "bank_log"] },
  { id: "d_pig_ok", title: "lời khai của Heo khớp sổ chuyến bay", zh: "小猪说他在检票,机场记录也证明了。", vi: "Heo nói đang soát vé và sổ chuyến bay chứng minh điều đó.", sceneId: "museum", kind: "deduction", link: ["pig_alibi", "flight_log"] },
  { id: "d_fox", title: "Cáo có ngoại phạm", zh: "三点到三点半狐狸一直在银行,所以不是她。", vi: "Từ 3 đến 3 rưỡi Cáo ở ngân hàng suốt, nên không phải Cáo.", sceneId: "museum", kind: "deduction", link: ["d_fox_ok", "museum_time"] },
  { id: "d_pig", title: "Heo có ngoại phạm", zh: "三点到三点半小猪一直在检票口,所以不是他。", vi: "Từ 3 đến 3 rưỡi Heo ở cổng soát vé suốt, nên không phải Heo.", sceneId: "museum", kind: "deduction", link: ["d_pig_ok", "museum_time"] },
];

export const SUSPECTS: Suspect[] = [
  { id: "rabbit", name: "Bé Thỏ bán vé", sprite: "rabbit", sceneId: "cinema", metFlag: "met:rabbit", note: "Nói bán vé ở rạp và thấy Vịt xem phim. Sổ rạp nói gì?" },
  { id: "duck", name: "Chú Vịt tiệm giặt", sprite: "duck", sceneId: "laundry", metFlag: "met:duck", note: "Nói xem phim ở rạp, Thỏ bán vé cho. Nhưng tiệm giặt đóng cửa." },
  { id: "fox", name: "Cô Cáo ngân hàng", sprite: "fox", sceneId: "bank", metFlag: "met:fox", note: "Nói làm việc ở ngân hàng. Sổ giao dịch xác nhận." },
  { id: "pig", name: "Anh Heo soát vé", sprite: "pig", sceneId: "airport", metFlag: "met:pig", note: "Nói soát vé ở sân bay. Sổ chuyến bay xác nhận." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-owl", sceneId: "museum", text: "Nói chuyện với Cụ Cú ở Bảo tàng để nhận vụ án.", done: { all: ["met:owl"] } },
  { id: "rabbit", sceneId: "cinema", text: "Đến Rạp phim: hỏi Bé Thỏ và xem sổ rạp.", when: { all: ["met:owl"] }, done: { all: ["met:rabbit", "clue:cinema_log"] } },
  { id: "duck", sceneId: "laundry", text: "Đến Tiệm giặt: hỏi Chú Vịt và xem bảng cửa tiệm.", when: { all: ["met:rabbit", "clue:cinema_log"] }, done: { all: ["met:duck", "clue:laundry_log"] } },
  { id: "fox", sceneId: "bank", text: "Đến Ngân hàng: hỏi Cô Cáo và xem sổ giao dịch.", when: { all: ["met:duck", "clue:laundry_log"] }, done: { all: ["met:fox", "clue:bank_log"] } },
  { id: "pig", sceneId: "airport", text: "Đến Sân bay: hỏi Anh Heo và xem sổ chuyến bay.", when: { all: ["met:fox", "clue:bank_log"] }, done: { all: ["met:pig", "clue:flight_log"] } },
  { id: "confront", sceneId: "cinema", text: "Hỏi lại Bé Thỏ và đưa ra đúng bằng chứng.", when: { all: ["met:pig", "clue:flight_log"] }, done: { all: ["clue:rabbit_slip"] } },
  { id: "accuse", sceneId: "museum", text: "Về Bảo tàng, nói với Cụ Cú bạn biết ai đã lấy bình ngọc.", when: { all: ["clue:rabbit_slip"] }, done: { all: ["case:solved"] } },
];
