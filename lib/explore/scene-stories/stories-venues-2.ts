import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện của quán cà phê, hiệu sách, hồ bơi và trạm cứu hỏa. */
export const VENUES_2_STORIES: Record<string, SceneStory> = {
  cafe: story(["一杯拿铁的下午", "Buổi chiều của một ly latte"], [
    ["小林下班以后,走进了一家小咖啡店。", "Tiểu Lâm tan làm, bước vào một quán cà phê nhỏ."],
    ["窗边的盆栽很绿,吧台后面站着一位店员。", "Chậu cây cảnh bên cửa sổ rất xanh, sau quầy bar có một nhân viên đứng."],
    ["店员把咖啡豆倒进咖啡机,屋子里马上香了。", "Nhân viên đổ hạt cà phê vào máy pha cà phê, cả phòng liền thơm."],
    ["小林坐在高脚凳上,点了一杯热拿铁。", "Tiểu Lâm ngồi lên ghế cao, gọi một ly latte nóng."],
    ["店员在拿铁上面加了一层奶泡,又问要不要糖浆。", "Nhân viên thêm một lớp bọt sữa lên latte, rồi hỏi có muốn siro không."],
    ["点心柜里有提拉米苏和粉色的马卡龙。", "Trong tủ bánh có tiramisu và bánh macaron màu hồng."],
    ["小林各要了一块,用外带杯装好咖啡带回家。", "Tiểu Lâm lấy mỗi loại một cái, rót cà phê vào cốc mang đi rồi mang về nhà."],
    ["回到家,他一边喝拿铁一边吃马卡龙,觉得很幸福。", "Về nhà, anh vừa uống latte vừa ăn macaron, thấy rất hạnh phúc."],
  ], ["Tiểu Lâm gọi đồ uống gì?", "他点了一杯热拿铁。", "他点了一杯果汁。", "他点了一杯奶茶。"]),

  bookstore: story(["书店里的周末", "Cuối tuần ở hiệu sách"], [
    ["周末,小美和弟弟来到一家书店。", "Cuối tuần, Tiểu Mỹ và em trai đến một hiệu sách."],
    ["门口有一个旋转书架,弟弟一下子找到了漫画。", "Ở cửa có một giá sách xoay, em trai liền tìm thấy truyện tranh."],
    ["小美在书堆里翻到一本好看的小说。", "Tiểu Mỹ lật trong chồng sách thấy một cuốn tiểu thuyết hay."],
    ["她还想给妈妈买一本食谱,因为妈妈爱做饭。", "Cô còn muốn mua cho mẹ một cuốn sách nấu ăn vì mẹ thích nấu ăn."],
    ["老板常常坐在阅读灯下,给孩子们讲童话。", "Chủ tiệm hay ngồi dưới đèn đọc sách, kể truyện cổ tích cho các em nhỏ."],
    ["柜台上摆着日历、便利贴和一支漂亮的钢笔。", "Trên quầy bày lịch, giấy nhớ và một cây bút máy đẹp."],
    ["小美买了一本笔记本,想把新学的词记下来。", "Tiểu Mỹ mua một cuốn sổ tay, muốn ghi lại từ mới học."],
    ["他们抱着书走到收银台,高高兴兴地付了钱。", "Hai chị em ôm sách ra quầy thu ngân, vui vẻ trả tiền."],
  ], ["Em trai của Tiểu Mỹ tìm thấy gì?", "他找到了漫画。", "他找到了食谱。", "他找到了日历。"]),

  pool: story(["第一次游泳课", "Buổi học bơi đầu tiên"], [
    ["星期六,小雨第一次来游泳馆上课。", "Thứ bảy, Tiểu Vũ lần đầu đến bể bơi học."],
    ["教练让她戴好泳帽和泳镜,再戴上耳塞。", "Huấn luyện viên bảo cô đội mũ bơi, đeo kính bơi, rồi đeo nút tai."],
    ["小雨还用鼻夹夹住鼻子,抱着浮板走到泳道线旁边。", "Tiểu Vũ còn kẹp mũi, ôm phao tập bơi đi đến cạnh dây phân làn."],
    ["旁边的小朋友戴着臂圈,在水里玩得很开心。", "Các bé bên cạnh đeo phao tay, chơi rất vui trong nước."],
    ["远处有人站在跳水板上,也有人从滑梯上冲下来。", "Phía xa có người đứng trên ván nhảy, cũng có người lao xuống từ cầu trượt."],
    ["小雨游累了,就躺在躺椅上休息。", "Tiểu Vũ bơi mệt thì nằm nghỉ trên ghế dài."],
    ["上岸以后,她先去淋浴头下冲了一冲。", "Lên bờ rồi, cô đi tắm qua dưới vòi sen trước."],
    ["最后她用浴巾擦干身体,开心地回家了。", "Cuối cùng cô dùng khăn tắm lau khô người, vui vẻ về nhà."],
  ], ["Tiểu Vũ ôm gì khi tập bơi?", "她抱着浮板。", "她抱着浴巾。", "她抱着臂圈。"]),

  firestation: story(["警报响了", "Chuông báo vang lên"], [
    ["夜里,消防站的警报器突然响了。", "Ban đêm, chuông báo của trạm cứu hỏa đột nhiên reo."],
    ["消防员顺着滑杆滑下来,马上穿上防护服。", "Lính cứu hỏa trượt xuống theo cột trượt, lập tức mặc đồ bảo hộ."],
    ["他们戴好消防帽,背上氧气瓶,跳上消防车。", "Họ đội mũ cứu hỏa, đeo bình oxy, nhảy lên xe cứu hỏa."],
    ["消防车很快到了现场,停在消防栓旁边。", "Xe cứu hỏa nhanh chóng đến hiện trường, đỗ cạnh trụ nước chữa cháy."],
    ["两个人抱着水带冲向大楼,另一个人拿着灭火器。", "Hai người ôm vòi rồng lao vào tòa nhà, một người khác cầm bình chữa cháy."],
    ["门被卡住了,队长用消防斧劈开了门。", "Cửa bị kẹt, đội trưởng dùng rìu cứu hỏa bổ cửa ra."],
    ["楼上的人用绳子慢慢下来,云梯也升得很高。", "Người trên lầu từ từ xuống bằng dây, thang xe cứu hỏa cũng vươn rất cao."],
    ["火很快就灭了,大家都平安无事。", "Lửa nhanh chóng được dập, mọi người đều bình an."],
  ], ["Đội trưởng dùng gì để mở cửa bị kẹt?", "队长用消防斧劈开了门。", "队长用灭火器灭了火。", "队长用绳子爬下了楼。"]),
};
