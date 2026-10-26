import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện các cảnh vui chơi, thiên nhiên, học tập và mua sắm. */
export const PLACE_FUN_STORIES: Record<string, SceneStory> = {
  park: story(["春天的公园", "Công viên mùa xuân"], [
    ["春天的公园很漂亮。", "Công viên mùa xuân rất đẹp."],
    ["树上有一只小鸟在唱歌,一只松鼠跳来跳去。", "Trên cây có một chú chim nhỏ đang hót, một con sóc nhảy qua nhảy lại."],
    ["爷爷坐在长椅上,看着池塘边的喷泉。", "Ông ngồi trên ghế dài, ngắm đài phun nước cạnh ao."],
    ["小朋友们在玩秋千,还有人骑自行车。", "Các bạn nhỏ chơi xích đu, còn có người đạp xe."],
    ["小狗追着蝴蝶跑。", "Chú chó con đuổi theo con bướm."],
    ["天空中飘着一只风筝。", "Trên trời có một con diều đang bay."],
    ["一家人在亭子旁边铺开野餐垫。", "Một gia đình trải tấm trải dã ngoại cạnh cái đình."],
    ["突然下雨了,大家赶紧撑起雨伞。", "Đột nhiên trời mưa, mọi người vội vàng giương ô lên."],
  ], ["Đột nhiên xảy ra chuyện gì?", "突然下雨了。", "突然刮风了。", "突然天黑了。"]),

  farm: story(["外婆的农场", "Nông trại của bà ngoại"], [
    ["暑假,小花去外婆的农场玩。", "Kỳ nghỉ hè, Tiểu Hoa đến nông trại của bà ngoại chơi."],
    ["农场很大,外面有一圈篱笆。", "Nông trại rất rộng, bên ngoài có một vòng hàng rào."],
    ["田里的麦子黄了,稻草人站在中间。", "Lúa mì trên ruộng đã chín vàng, bù nhìn rơm đứng ở giữa."],
    ["外公开着拖拉机,把南瓜运到谷仓里。", "Ông ngoại lái máy kéo, chở bí ngô vào kho thóc."],
    ["母鸡在院子里找吃的,绵羊在草地上休息。", "Gà mái tìm ăn trong sân, cừu nghỉ ngơi trên bãi cỏ."],
    ["奶牛在吃干草。", "Bò sữa đang ăn cỏ khô."],
    ["小花骑上一匹马,看见远处的风车在转。", "Tiểu Hoa cưỡi một con ngựa, thấy cối xay gió ở xa đang quay."],
    ["傍晚,外婆做了南瓜汤。", "Chiều tối, bà ngoại nấu canh bí ngô."],
  ], ["Ông ngoại lái gì?", "外公开着拖拉机。", "外公开着汽车。", "外公骑着马。"]),

  beach: story(["海边的一天", "Một ngày ở bãi biển"], [
    ["夏天的早上,太阳很大。", "Buổi sáng mùa hè, mặt trời rất gắt."],
    ["小宇穿上泳衣,妈妈给他涂了防晒霜。", "Tiểu Vũ mặc đồ bơi, mẹ bôi kem chống nắng cho cậu."],
    ["他们在沙滩上撑开一把太阳伞。", "Họ dựng một chiếc ô che nắng trên bãi cát."],
    ["小宇拿着水桶,和姐姐一起堆沙堡。", "Tiểu Vũ cầm cái xô, cùng chị đắp lâu đài cát."],
    ["他在沙子里找到了一个漂亮的贝壳。", "Cậu tìm được một chiếc vỏ sò đẹp trong cát."],
    ["水里有一只小螃蟹,石头旁边还有一只海星。", "Trong nước có một con cua nhỏ, cạnh tảng đá còn có một con sao biển."],
    ["姐姐拿着冲浪板,去海里玩。", "Chị cầm ván lướt sóng, ra biển chơi."],
    ["小宇套上救生圈,坐在海边看远处的船。", "Tiểu Vũ mặc phao cứu sinh, ngồi bên bờ biển nhìn chiếc thuyền ở xa."],
  ], ["Tiểu Vũ làm gì trên bãi cát?", "他和姐姐堆了沙堡。", "他去冲浪了。", "他去坐船了。"]),

  stadium: story(["学校的足球赛", "Trận bóng đá ở trường"], [
    ["今天,学校有一场足球比赛。", "Hôm nay trường có một trận bóng đá."],
    ["队员们穿上蓝色的球衣,走进球场。", "Các cầu thủ mặc áo thi đấu màu xanh, bước vào sân."],
    ["裁判吹响了哨子,比赛开始了。", "Trọng tài thổi còi, trận đấu bắt đầu."],
    ["小伟一脚把球踢向球门,可是守门员接住了。", "Tiểu Vĩ sút quả bóng về phía khung thành, nhưng thủ môn bắt được."],
    ["记分牌上写着一比一。", "Trên bảng tỉ số ghi một một."],
    ["休息的时候,大家喝水,教练拿着秒表计时。", "Giờ nghỉ, mọi người uống nước, huấn luyện viên cầm đồng hồ bấm giờ."],
    ["旁边的场地上,有人拿着球拍,隔着球网打羽毛球。", "Ở sân bên cạnh, có người cầm vợt, đánh cầu lông qua lưới."],
    ["有人犯规了,裁判给了他一张红牌。", "Có người phạm lỗi, trọng tài rút thẻ đỏ với cậu."],
    ["最后,蓝队赢了,拿到了奖杯和奖牌。", "Cuối cùng, đội xanh thắng, nhận được cúp và huy chương."],
  ], ["Ai thổi còi?", "裁判吹哨子。", "教练吹哨子。", "小伟吹哨子。"]),

  gym: story(["小刚的健身日", "Ngày tập thể hình của Tiểu Cương"], [
    ["小刚决定每天去健身房。", "Tiểu Cương quyết định ngày nào cũng đến phòng gym."],
    ["他先把包放进储物柜,换上运动服。", "Cậu cất túi vào tủ để đồ trước, rồi thay đồ tập."],
    ["他戴着耳机,在跑步机上跑了二十分钟。", "Cậu đeo tai nghe, chạy hai mươi phút trên máy chạy bộ."],
    ["然后,他拿起哑铃,又试了试杠铃。", "Sau đó, cậu cầm tạ tay lên, rồi thử cả tạ đòn."],
    ["旁边的姐姐在瑜伽垫上做瑜伽。", "Chị bên cạnh tập yoga trên thảm yoga."],
    ["小刚打了一会儿沙袋,还跳了五分钟跳绳。", "Tiểu Cương đấm bao cát một lúc, còn nhảy dây năm phút."],
    ["他喝了水瓶里的水,又冲了一杯蛋白粉。", "Cậu uống nước trong bình, rồi pha một ly bột protein."],
    ["最后,他站上体重秤,高兴地笑了。", "Cuối cùng, cậu đứng lên cân sức khỏe, vui vẻ bật cười."],
  ], ["Tiểu Cương cất túi ở đâu?", "他把包放进储物柜。", "他把包放在跑步机上。", "他把包放在瑜伽垫上。"]),

  funfair: story(["游乐场的周末", "Cuối tuần ở công viên giải trí"], [
    ["周末,游乐场里人很多。", "Cuối tuần, công viên giải trí rất đông người."],
    ["小丑在门口送给孩子们气球。", "Chú hề tặng bóng bay cho bọn trẻ ở cổng."],
    ["小美先坐了旋转木马,又玩了碰碰车。", "Tiểu Mỹ ngồi đu quay ngựa trước, rồi chơi xe điện đụng."],
    ["哥哥更喜欢过山车,跑得又快又高。", "Anh trai thích tàu lượn hơn, chạy vừa nhanh vừa cao."],
    ["在一个摊位前,他扔飞镖,赢了一个奖品。", "Trước một gian hàng, anh phóng phi tiêu và thắng một giải thưởng."],
    ["他们买了一个大棉花糖,两个人一起吃。", "Họ mua một cây kẹo bông lớn, hai người cùng ăn."],
    ["马戏团在大帐篷里表演。", "Đoàn xiếc biểu diễn trong chiếc lều lớn."],
    ["傍晚,他们坐上摩天轮,看到了整个城市。", "Chiều tối, họ ngồi lên vòng quay khổng lồ, nhìn thấy cả thành phố."],
    ["晚上八点,天空中放起了烟花。", "Tám giờ tối, pháo hoa nổ trên bầu trời."],
  ], ["Anh trai thích nhất trò gì?", "哥哥最喜欢过山车。", "哥哥最喜欢摩天轮。", "哥哥最喜欢碰碰车。"]),

  museum: story(["博物馆里的发现", "Phát hiện ở bảo tàng"], [
    ["周日,小东和老师去博物馆。", "Chủ nhật, Tiểu Đông và cô giáo đến bảo tàng."],
    ["门口,老师给每个人一个讲解器。", "Ở cổng, cô giáo đưa mỗi người một máy thuyết minh."],
    ["大厅里挂着很多画,中间还有一座雕像。", "Trong đại sảnh treo nhiều bức tranh, ở giữa còn có một bức tượng."],
    ["展柜里放着古币和一只很老的花瓶。", "Trong tủ trưng bày có đồng tiền cổ và một chiếc bình hoa rất xưa."],
    ["展板上写着这些东西的故事。", "Trên bảng triển lãm viết câu chuyện về những món đồ này."],
    ["他们看到一个长长的卷轴和一套盔甲。", "Họ thấy một cuộn tranh dài và một bộ giáp."],
    ["最大的是一只恐龙化石,外面有围栏。", "Lớn nhất là một hóa thạch khủng long, bên ngoài có hàng rào chắn."],
    ["出口挂着红色的灯笼,小东说:“我还想再来!”", "Ở lối ra treo đèn lồng đỏ, Tiểu Đông nói: “Em còn muốn đến nữa!”"],
  ], ["Ai đưa máy thuyết minh?", "老师给大家讲解器。", "小东给大家讲解器。", "爸爸给大家讲解器。"]),

  cinema: story(["周末看电影", "Cuối tuần đi xem phim"], [
    ["星期天,小军和哥哥去看电影。", "Chủ nhật, Tiểu Quân và anh trai đi xem phim."],
    ["门口的海报上有他们喜欢的英雄。", "Trên áp phích ở cổng có anh hùng mà họ thích."],
    ["哥哥买了两张电影票,还买了爆米花和可乐。", "Anh trai mua hai vé xem phim, còn mua bắp rang và nước cola."],
    ["小军想吃糖果,他也买了一包。", "Tiểu Quân muốn ăn kẹo, cậu cũng mua một gói."],
    ["他们找到自己的座位,戴上三维眼镜。", "Họ tìm được chỗ ngồi của mình, đeo kính 3D."],
    ["放映机亮了,幕布拉开,银幕上出现了画面。", "Máy chiếu sáng lên, tấm màn kéo ra, trên màn ảnh hiện hình ảnh."],
    ["电影里有个导演,他拿着场记板,旁边的摄像机正在拍。", "Trong phim có một đạo diễn, ông cầm bảng clap, máy quay bên cạnh đang quay."],
    ["看完电影,小军说:“我也想当导演!”", "Xem phim xong, Tiểu Quân nói: “Em cũng muốn làm đạo diễn!”"],
  ], ["Ai mua vé xem phim?", "哥哥买了电影票。", "小军买了电影票。", "妈妈买了电影票。"]),

  station: story(["去外地的火车", "Chuyến tàu đi tỉnh khác"], [
    ["小华和奶奶要坐火车去外地。", "Tiểu Hoa và bà sắp đi tàu hỏa đến tỉnh khác."],
    ["他们先看了墙上的地图和时刻表。", "Họ xem bản đồ và bảng giờ tàu trên tường trước."],
    ["奶奶去售票窗口买票,小华在自动售票机买了另一张。", "Bà ra quầy bán vé mua vé, Tiểu Hoa mua một vé khác ở máy bán vé tự động."],
    ["大厅里的钟指着八点。", "Đồng hồ trong sảnh chỉ tám giờ."],
    ["他们坐在候车椅上,吃了一盒盒饭。", "Họ ngồi trên ghế chờ tàu, ăn một hộp cơm."],
    ["站牌上写着“北京站”。", "Trên biển tên ga viết “Ga Bắc Kinh”."],
    ["工作人员推着行李车,走过检票口。", "Nhân viên đẩy xe hành lý, đi qua cổng soát vé."],
    ["铁轨上,站台的人挥着信号旗。", "Trên đường ray, người ở sân ga vẫy cờ hiệu."],
    ["火车慢慢进站了。", "Tàu hỏa từ từ vào ga."],
  ], ["Bà mua vé ở đâu?", "奶奶在售票窗口买票。", "奶奶在检票口买票。", "奶奶在候车椅上买票。"]),

  school: story(["小明的一天", "Một ngày của Tiểu Minh"], [
    ["早上,小明背着书包去上学。", "Buổi sáng, Tiểu Minh đeo cặp đi học."],
    ["铃响了,同学们坐在课桌旁。", "Chuông reo, các bạn ngồi bên bàn học."],
    ["老师在黑板上用粉笔写字。", "Cô giáo viết chữ lên bảng đen bằng phấn."],
    ["小明拿出课本和本子,又拿出笔和橡皮。", "Tiểu Minh lấy sách giáo khoa và vở ra, rồi lấy cả bút và cục tẩy."],
    ["写错了字,他就用橡皮擦掉。", "Viết sai chữ, cậu dùng cục tẩy xóa đi."],
    ["他用尺子画线,还用胶水贴图。", "Cậu dùng thước kẻ vẽ đường, còn dùng hồ dán dán hình."],
    ["美术课上,老师带来了一个地球仪,他用画笔把它画下来。", "Giờ mỹ thuật, cô giáo mang đến một quả địa cầu, cậu dùng bút vẽ vẽ lại nó."],
  ], ["Ai viết chữ lên bảng đen?", "老师在黑板上写字。", "小明在黑板上写字。", "同学在黑板上写字。"]),

  "clothing-store": story(["冬天的购物", "Mua sắm mùa đông"], [
    ["冬天来了,小梅去商店买衣服。", "Mùa đông đến, Tiểu Mai đến cửa hàng mua quần áo."],
    ["她看中一条红裙子,还有一条黑裤子。", "Cô ưng một chiếc váy đỏ, còn có một chiếc quần đen."],
    ["她站在镜子前试一试,很合适。", "Cô đứng trước gương thử, rất vừa."],
    ["她又选了一顶帽子、一条围巾和一双手套。", "Cô lại chọn một chiếc mũ, một chiếc khăn quàng và một đôi găng tay."],
    ["爸爸要一条领带,他戴着眼镜仔细看。", "Bố cần một chiếc cà vạt, ông đeo kính xem kỹ."],
    ["弟弟想要一双新鞋和几双袜子。", "Em trai muốn một đôi giày mới và vài đôi tất."],
    ["最后,妈妈买了一个包。", "Cuối cùng, mẹ mua một chiếc túi."],
  ], ["Vì sao Tiểu Mai đi mua sắm?", "因为冬天来了。", "因为夏天来了。", "因为她要去旅行。"]),

  flowershop: story(["送给妈妈的花", "Hoa tặng mẹ"], [
    ["明天是妈妈的生日,小亮去花店买花。", "Ngày mai là sinh nhật mẹ, Tiểu Lượng đến tiệm hoa mua hoa."],
    ["店里有红色的玫瑰、黄色的向日葵,还有粉色的郁金香。", "Trong tiệm có hoa hồng đỏ, hoa hướng dương vàng, và hoa tulip hồng."],
    ["他选了玫瑰和百合,让老板做成一个花束。", "Cậu chọn hoa hồng và hoa bách hợp, nhờ chủ tiệm kết thành một bó hoa."],
    ["老板用彩带把花束系好。", "Chủ tiệm dùng dải ruy băng buộc bó hoa lại."],
    ["小亮在贺卡上写:“妈妈,生日快乐!”", "Tiểu Lượng viết lên thiệp chúc mừng: “Mẹ ơi, chúc mừng sinh nhật!”"],
    ["他还看见窗边有一个小花盆,里面是仙人掌。", "Cậu còn thấy cạnh cửa sổ có một chậu hoa nhỏ, bên trong là cây xương rồng."],
    ["老板拿着浇水壶给花浇水,又用铲子给花盆换土。", "Chủ tiệm cầm bình tưới nước tưới hoa, lại dùng xẻng nhỏ thay đất cho chậu."],
    ["小亮买了一包种子,打算和妈妈一起种。", "Tiểu Lượng mua một gói hạt giống, định cùng mẹ gieo."],
  ], ["Vì sao Tiểu Lượng mua hoa?", "因为明天是妈妈的生日。", "因为明天是他的生日。", "因为明天是老板的生日。"]),

  toyshop: story(["玩具店里的生日", "Sinh nhật trong cửa hàng đồ chơi"], [
    ["小宝的生日快到了,爸爸带他去玩具店。", "Sinh nhật Tiểu Bảo sắp đến, bố đưa cậu đến cửa hàng đồ chơi."],
    ["小宝一进门就看见一只大玩具熊。", "Vừa bước vào cửa, Tiểu Bảo đã thấy một chú gấu bông lớn."],
    ["他先玩了积木和拼图。", "Cậu chơi khối xếp hình và tranh ghép trước."],
    ["哥哥喜欢遥控车和玩具火车。", "Anh trai thích xe điều khiển từ xa và tàu hỏa đồ chơi."],
    ["妹妹想要一个洋娃娃,还有一个会唱歌的机器人。", "Em gái muốn một con búp bê, còn có một người máy biết hát."],
    ["旁边的男孩在玩溜溜球、陀螺和魔方。", "Cậu bé bên cạnh đang chơi con quay dây, con vụ và khối rubik."],
    ["爸爸买了一盒弹珠和一副象棋。", "Bố mua một hộp bi ve và một bộ cờ tướng."],
    ["小宝说:“谢谢爸爸,这是最好的生日!”", "Tiểu Bảo nói: “Cảm ơn bố, đây là sinh nhật tuyệt nhất!”"],
  ], ["Ai muốn búp bê?", "妹妹想要洋娃娃。", "哥哥想要洋娃娃。", "爸爸想要洋娃娃。"]),
};
