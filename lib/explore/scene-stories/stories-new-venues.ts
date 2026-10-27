import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện của đồn cảnh sát, ga tàu điện ngầm, khu cắm trại và phòng thí nghiệm. */
export const NEW_VENUE_STORIES: Record<string, SceneStory> = {
  police: story(["钱包去哪儿了?", "Chiếc ví đã đi đâu?"], [
    ["星期五晚上,老张的钱包不见了,他走进派出所。", "Tối thứ sáu, ví của bác Trương biến mất, bác bước vào đồn công an."],
    ["警察请他出示证件,再把他的话写进笔录。", "Cảnh sát mời bác xuất trình giấy tờ, rồi ghi lời bác vào biên bản."],
    ["警察戴着警帽,胸前有一枚警徽。", "Cảnh sát đội mũ cảnh sát, trước ngực có một huy hiệu."],
    ["他用放大镜看了看窗边的指纹,没有发现什么。", "Anh dùng kính lúp xem dấu vân tay cạnh cửa sổ, không phát hiện gì."],
    ["警察又看了监控,也没有发现小偷。", "Cảnh sát lại xem camera giám sát, cũng không thấy kẻ trộm."],
    ["他拿起对讲机,问同事有没有人捡到钱包。", "Anh cầm bộ đàm lên, hỏi đồng nghiệp có ai nhặt được ví không."],
    ["同事开着警车去了地铁站,可是没有找到。", "Đồng nghiệp lái xe cảnh sát đến ga tàu điện ngầm, nhưng không tìm thấy."],
    ["回来以后,老张在失物招领箱里看到了自己的钱包!", "Trở về, bác Trương thấy chiếc ví của mình trong hòm đồ thất lạc!"],
    ["警察在档案上写下这件事,还拿出手铐开玩笑:“这次没有小偷!”", "Cảnh sát ghi chuyện này vào hồ sơ, còn lấy còng tay ra đùa: “Lần này không có kẻ trộm!”"],
  ], ["Cuối cùng chiếc ví ở đâu?", "钱包在失物招领箱里。", "钱包在警车里。", "钱包在监控旁边。"]),

  subway: story(["上班的路上", "Trên đường đi làm"], [
    ["小周每天坐地铁去上班。", "Tiểu Chu ngày nào cũng đi tàu điện ngầm đi làm."],
    ["他先从二号出口走进站,把交通卡放在闸机上。", "Anh đi vào ga từ lối ra số hai, đặt thẻ đi lại lên cổng soát vé."],
    ["他站上扶梯,看见墙上有一张路线图。", "Anh bước lên thang cuốn, thấy trên tường có một sơ đồ tuyến."],
    ["到了站台,他站在安全线后面等车。", "Đến sân ga, anh đứng sau vạch an toàn chờ tàu."],
    ["广播说:“列车进站,请注意安全。”", "Loa thông báo: “Tàu vào ga, xin chú ý an toàn.”"],
    ["地铁来了,他走进车厢,没有座位。", "Tàu điện ngầm đến, anh bước vào toa, không có chỗ ngồi."],
    ["他抓住拉环,看着窗外。", "Anh nắm tay vịn treo, nhìn ra ngoài cửa sổ."],
    ["在人民广场站,他换乘了另一条线。", "Ở ga Quảng trường Nhân Dân, anh đổi sang tuyến khác."],
  ], ["Tiểu Chu đi làm bằng gì?", "他坐地铁去上班。", "他骑自行车去上班。", "他开车去上班。"]),

  camping: story(["山里的夜晚", "Đêm trên núi"], [
    ["周末,小林和朋友去山里露营。", "Cuối tuần, Tiểu Lâm và bạn lên núi cắm trại."],
    ["他们穿着登山鞋,背着大背包。", "Họ đi giày leo núi, đeo ba lô lớn."],
    ["天黑以前,他们用火柴点起了篝火。", "Trước khi trời tối, họ dùng diêm nhóm lên lửa trại."],
    ["大家坐在折叠椅上,烧烤架上的肉香极了。", "Mọi người ngồi trên ghế xếp, thịt trên vỉ nướng thơm cực kỳ."],
    ["小林点了一盘蚊香,蚊子就不来了。", "Tiểu Lâm đốt một cuộn nhang muỗi, muỗi không đến nữa."],
    ["晚上很冷,他钻进了睡袋。", "Buổi tối rất lạnh, cậu chui vào túi ngủ."],
    ["他打开手电筒,拿出指南针看方向。", "Cậu bật đèn pin, lấy la bàn ra xem hướng."],
    ["天上的月亮很圆,星星又多又亮。", "Mặt trăng trên trời rất tròn, sao vừa nhiều vừa sáng."],
  ], ["Tiểu Lâm dùng gì để nhóm lửa?", "他用火柴点起篝火。", "他用手电筒点起篝火。", "他用蚊香点起篝火。"]),

  lab: story(["小科学家", "Nhà khoa học nhỏ"], [
    ["星期三下午,小雨在学校的实验室做实验。", "Chiều thứ tư, Tiểu Vũ làm thí nghiệm trong phòng thí nghiệm của trường."],
    ["她穿上白大褂,戴上护目镜。", "Cô mặc áo choàng trắng, đeo kính bảo hộ."],
    ["老师先让她看显微镜下的蝴蝶标本。", "Thầy trước tiên cho cô xem mẫu vật con bướm dưới kính hiển vi."],
    ["然后她把水倒进烧杯,又倒进量筒量一量。", "Sau đó cô rót nước vào cốc đốt, lại rót vào ống đong để đo."],
    ["她用滴管把试剂滴进试管里。", "Cô dùng ống nhỏ giọt nhỏ thuốc thử vào ống nghiệm."],
    ["温度计显示水有八十度。", "Nhiệt kế cho thấy nước có tám mươi độ."],
    ["她点着酒精灯,把试管放上去烤。", "Cô châm đèn cồn, đặt ống nghiệm lên hơ."],
    ["最后她用天平称一称,把数字写在本子上。", "Cuối cùng cô dùng cân thăng bằng cân, rồi ghi con số vào vở."],
  ], ["Tiểu Vũ mặc gì khi làm thí nghiệm?", "她穿着白大褂。", "她穿着运动服。", "她穿着浴袍。"]),
};
