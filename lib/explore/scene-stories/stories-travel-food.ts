import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện các cảnh đi lại, ăn uống và ngân hàng. */
export const TRAVEL_FOOD_STORIES: Record<string, SceneStory> = {
  airport: story(["去旅行的早晨", "Buổi sáng đi du lịch"], [
    ["周末,小李一家要坐飞机去旅行。", "Cuối tuần, gia đình anh Lý sẽ đi máy bay đi du lịch."],
    ["他把衣服放进行李箱,又带上护照。", "Anh bỏ quần áo vào vali, rồi mang theo hộ chiếu."],
    ["到了机场,工作人员把行李箱放上传送带。", "Đến sân bay, nhân viên đặt vali lên băng chuyền."],
    ["他拿到了登机牌和行李牌。", "Anh nhận được thẻ lên máy bay và thẻ hành lý."],
    ["然后,他走过安检门,一切都很顺利。", "Sau đó anh đi qua cổng an ninh, mọi thứ đều suôn sẻ."],
    ["他抬头看航班牌,他们的飞机八点起飞。", "Anh ngẩng lên xem bảng chuyến bay, máy bay của họ cất cánh lúc tám giờ."],
    ["窗外是高高的塔台。", "Ngoài cửa sổ là tháp điều khiển cao cao."],
    ["上了飞机,他系好安全带,儿子戴着一顶机长帽。", "Lên máy bay, anh thắt dây an toàn, con trai đội một chiếc mũ cơ trưởng."],
    ["空姐送来飞机餐,孩子们吃得很开心。", "Tiếp viên mang suất ăn trên máy bay đến, bọn trẻ ăn rất vui."],
  ], ["Gia đình anh Lý sắp đi làm gì?", "他们要去旅行。", "他们要去上班。", "他们要去上学。"]),

  bakery: story(["蛋糕上的蜡烛", "Những cây nến trên chiếc bánh"], [
    ["早上五点,面包师傅就起床了。", "Năm giờ sáng, thợ làm bánh đã thức dậy."],
    ["他系上围裙,把面粉倒进大碗里。", "Anh thắt tạp dề, đổ bột mì vào chiếc bát lớn."],
    ["他用擀面杖把面团压得平平的。", "Anh dùng cây cán bột cán bột cho thật phẳng."],
    ["烤箱里飘出了牛角包的香味。", "Từ lò nướng bay ra mùi thơm của bánh sừng bò."],
    ["吐司和法棍也烤好了。", "Bánh mì sandwich và bánh mì baguette cũng nướng xong."],
    ["小朋友们喜欢饼干和甜甜圈。", "Các bạn nhỏ thích bánh quy và bánh donut."],
    ["大人们进来,先点一杯咖啡。", "Người lớn bước vào, gọi trước một ly cà phê."],
    ["今天是小美的生日,妈妈订了一个蛋糕。", "Hôm nay là sinh nhật Tiểu Mỹ, mẹ đặt một chiếc bánh kem."],
    ["师傅在蛋糕上插了八根蜡烛。", "Thợ cắm tám cây nến lên bánh kem."],
  ], ["Hôm nay là sinh nhật của ai?", "今天是小美的生日。", "今天是妈妈的生日。", "今天是师傅的生日。"]),

  bank: story(["王奶奶去银行", "Bà Vương đến ngân hàng"], [
    ["王奶奶早上去银行办事。", "Sáng sớm bà Vương đến ngân hàng làm việc."],
    ["她先在门口拿了一张号码单。", "Bà lấy trước một phiếu số thứ tự ở cửa."],
    ["她的钱包里有存折和银行卡。", "Trong ví của bà có sổ tiết kiệm và thẻ ngân hàng."],
    ["年轻人在取款机前取现金。", "Các bạn trẻ rút tiền mặt trước máy ATM."],
    ["柜台的人用刷卡机帮她办好了业务。", "Nhân viên quầy dùng máy quẹt thẻ làm xong việc cho bà."],
    ["她在支票上写好名字,又盖上印章。", "Bà viết tên lên tờ séc rồi đóng con dấu."],
    ["经理打开保险箱上的锁,把文件放进去。", "Quản lý mở ổ khóa của két sắt, cất tài liệu vào."],
    ["最后,她把钱放进零钱包,开心地回家了。", "Cuối cùng bà bỏ tiền vào ví đựng tiền lẻ, vui vẻ về nhà."],
  ], ["Bà Vương làm gì trước tiên?", "她先拿了号码单。", "她先打开了保险箱。", "她先写了支票。"]),

  bubbletea: story(["放学后的奶茶", "Ly trà sữa sau giờ tan học"], [
    ["放学后,小雨和朋友去奶茶店。", "Tan học, Tiểu Vũ và bạn đến quán trà sữa."],
    ["他们先看墙上的价目表。", "Họ xem bảng giá trên tường trước."],
    ["小雨要了一杯芒果奶茶,少糖,多冰块。", "Tiểu Vũ gọi một ly trà sữa xoài, ít đường, nhiều đá viên."],
    ["朋友点了草莓味的,还要加珍珠。", "Bạn gọi vị dâu tây, còn muốn thêm trân châu."],
    ["店员用摇杯把柠檬茶摇一摇。", "Nhân viên lắc trà chanh bằng bình lắc."],
    ["她把奶茶倒进杯子里,再插上吸管。", "Cô rót trà sữa vào ly, rồi cắm ống hút."],
    ["最后,店员把杯子放进打包袋。", "Cuối cùng, nhân viên cho ly vào túi mang đi."],
    ["小雨说:“谢谢!明天我们再来。”", "Tiểu Vũ nói: “Cảm ơn! Ngày mai tụi mình lại đến.”"],
  ], ["Tiểu Vũ gọi món gì?", "她点了芒果奶茶。", "她点了草莓奶茶。", "她点了柠檬茶。"]),

  hotpot: story(["冬天的火锅", "Nồi lẩu mùa đông"], [
    ["冬天很冷,小林一家去吃火锅。", "Mùa đông lạnh, nhà Tiểu Lâm đi ăn lẩu."],
    ["桌子上有肉片、虾、丸子和蘑菇。", "Trên bàn có thịt thái lát, tôm, viên và nấm."],
    ["还有白菜、玉米和粉丝。", "Còn có cải thảo, bắp ngô và miến."],
    ["小林先调了一碗蘸料。", "Tiểu Lâm pha trước một bát nước chấm."],
    ["爸爸用漏勺把丸子捞出来。", "Bố dùng muôi lọc vớt viên lên."],
    ["妈妈说:“白菜要最后放。”", "Mẹ nói: “Cải thảo phải cho vào sau cùng.”"],
    ["爸爸喝了一杯啤酒,小林喝酸梅汤。", "Bố uống một ly bia, Tiểu Lâm uống nước ô mai."],
    ["大家吃得满头大汗,开心极了。", "Mọi người ăn đến đổ mồ hôi đầy đầu, vui vô cùng."],
  ], ["Tiểu Lâm uống gì?", "小林喝酸梅汤。", "小林喝啤酒。", "小林喝牛奶。"]),

  kitchen: story(["爸爸做晚饭", "Bố nấu cơm tối"], [
    ["今天晚上,爸爸要做饭。", "Tối nay bố sẽ nấu cơm."],
    ["他先从冰箱里拿出大蒜和菜。", "Bố lấy tỏi và rau từ tủ lạnh ra trước."],
    ["他用刀在菜板上把大蒜切好。", "Bố dùng dao thái tỏi trên thớt."],
    ["水槽里的水哗哗地响,他把菜洗干净。", "Nước trong bồn rửa chảy ào ào, bố rửa rau sạch sẽ."],
    ["他把炒锅放在炉子上,倒了一点油。", "Bố đặt chảo xào lên bếp, đổ một ít dầu."],
    ["他用锅铲翻一翻,再放一点盐。", "Bố đảo bằng xẻng xào, rồi cho thêm chút muối."],
    ["电饭锅里的米饭也好了。", "Cơm trong nồi cơm điện cũng chín rồi."],
    ["他还用一个锅煮汤,用汤勺尝一尝。", "Bố còn nấu canh bằng một cái nồi, dùng cái môi nếm thử."],
    ["水壶里的水开了,妈妈泡了一壶茶。", "Nước trong ấm sôi rồi, mẹ pha một ấm trà."],
  ], ["Bố dùng gì để thái tỏi?", "他用刀切大蒜。", "他用锅铲切大蒜。", "他用汤勺切大蒜。"]),

  market: story(["奶奶逛菜市场", "Bà đi chợ"], [
    ["早上,奶奶带着篮子去菜市场。", "Buổi sáng, bà xách giỏ đi chợ."],
    ["她先买了一些水果:香蕉和西瓜。", "Bà mua trước ít trái cây: chuối và dưa hấu."],
    ["卖鱼的叔叔把鱼放在秤上称一称。", "Chú bán cá đặt cá lên cân để cân."],
    ["奶奶又买了肉、鸡蛋和一块豆腐。", "Bà mua thêm thịt, trứng gà và một miếng đậu phụ."],
    ["她还买了新鲜的菜和几个辣椒。", "Bà còn mua rau tươi và mấy quả ớt."],
    ["老板把东西装进袋子里。", "Chủ sạp cho đồ vào túi."],
    ["奶奶付了钱,高高兴兴地回家。", "Bà trả tiền, vui vẻ về nhà."],
  ], ["Bà mang theo gì đi chợ?", "她带着篮子。", "她带着秤。", "她带着豆腐。"]),

  supermarket: story(["周末去超市", "Cuối tuần đi siêu thị"], [
    ["周末,爸爸带小雪去超市。", "Cuối tuần, bố đưa Tiểu Tuyết đi siêu thị."],
    ["小雪推着购物车,走在前面。", "Tiểu Tuyết đẩy xe mua hàng, đi phía trước."],
    ["她先拿了牛奶和酸奶,又拿了一瓶果汁。", "Cô bé lấy trước sữa bò và sữa chua, rồi lấy một chai nước ép."],
    ["爸爸买了方便面、卫生纸和洗发水。", "Bố mua mì ăn liền, giấy vệ sinh và dầu gội."],
    ["小雪想要冰淇淋和薯片,爸爸笑着说可以。", "Tiểu Tuyết muốn kem và khoai tây chiên, bố cười nói được."],
    ["到了收银台,阿姨用扫码器一件一件扫。", "Đến quầy thu ngân, cô dùng máy quét mã quét từng món."],
    ["阿姨把小票给了爸爸。", "Cô đưa hóa đơn nhỏ cho bố."],
  ], ["Tiểu Tuyết đẩy gì?", "小雪推着购物车。", "小雪推着小票。", "小雪推着薯片。"]),
};
