import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện của nhóm cảnh đời sống thị trấn (trạm xe buýt, cửa hàng tiện lợi, trường mẫu giáo, ký túc xá, núi, nhà hát kinh kịch). */
export const TOWN_LIFE_STORIES: Record<string, SceneStory> = {
  busstop: story(["等公交的早晨", "Buổi sáng chờ xe buýt"], [
    ["早上,小王站在公交站等车。", "Buổi sáng, Tiểu Vương đứng ở trạm chờ xe buýt."],
    ["他看了看路牌和线路图,确定要坐三路车。", "Anh nhìn biển tên đường và sơ đồ tuyến, chắc chắn phải đi xe số ba."],
    ["电子站牌上写着:三路车还有五分钟。", "Bảng điện tử ghi: xe số ba còn năm phút."],
    ["雨忽然下大了,大家都躲进候车亭。", "Mưa bỗng lớn, mọi người đều chạy vào nhà chờ."],
    ["公交车来了,车门慢慢打开。", "Xe buýt tới, cửa xe từ từ mở ra."],
    ["小王刷了公交卡,走到后面,抓住扶手。", "Tiểu Vương quẹt thẻ xe buýt, đi ra phía sau, nắm lấy tay vịn."],
    ["看见一位老奶奶上车,他马上把爱心座让给了她。", "Thấy một bà cụ lên xe, anh lập tức nhường ghế ưu tiên cho bà."],
    ["到站以前,他按了一下下车铃。", "Trước khi đến trạm, anh bấm chuông xuống xe."],
  ], ["Tiểu Vương đã làm gì khi thấy bà cụ lên xe?", "他把爱心座让给了老奶奶。", "他假装没看见。", "他和老奶奶换了车票。"]),

  convenience: story(["深夜的便利店", "Cửa hàng tiện lợi lúc nửa đêm"], [
    ["夜里十一点,小林加班回来,肚子很饿。", "Mười một giờ đêm, Tiểu Lâm tăng ca về, bụng rất đói."],
    ["他走进还亮着灯的便利店,自动门轻轻打开。", "Anh bước vào cửa hàng tiện lợi vẫn sáng đèn, cửa tự động nhẹ nhàng mở."],
    ["冷藏柜里有各种饭团和便当,他挑了一个便当。", "Trong tủ mát có đủ loại cơm nắm và cơm hộp, anh chọn một hộp cơm."],
    ["他又拿了一杯杯面和一瓶饮料。", "Anh lấy thêm một ly mì và một chai đồ uống."],
    ["店员用微波炉帮他加热了便当。", "Nhân viên hâm cơm hộp giúp anh bằng lò vi sóng."],
    ["柜台旁边的关东煮闻起来很香,他也买了一份。", "Món oden cạnh quầy thơm quá, anh cũng mua một phần."],
    ["他还拿了几包零食,把东西都放进购物筐。", "Anh còn lấy vài gói đồ ăn vặt, bỏ hết đồ vào giỏ mua hàng."],
    ["柜台上有个打火机,是别人忘在那儿的。", "Trên quầy có chiếc bật lửa, là người khác để quên ở đó."],
    ["付完钱,他顺便买了一盒口香糖。", "Trả tiền xong, anh tiện tay mua một hộp kẹo cao su."],
    ["走出便利店,夜风凉凉的,他觉得今天也没那么累了。", "Bước ra khỏi cửa hàng, gió đêm mát lạnh, anh thấy hôm nay cũng không mệt đến thế."],
  ], ["Tiểu Lâm đã làm gì với hộp cơm?", "店员用微波炉帮他加热。", "他放进了冰箱。", "他送给了朋友。"]),

  kindergarten: story(["幼儿园的一天", "Một ngày ở trường mẫu giáo"], [
    ["早上,小朋友们背着书包走进幼儿园。", "Buổi sáng, các bạn nhỏ đeo cặp bước vào trường mẫu giáo."],
    ["他们把书包放进自己的储物格,再去拿水杯。", "Các bé để cặp vào ngăn đồ của mình rồi đi lấy cốc nước."],
    ["上午,老师发了蜡笔,大家画了一幅画。", "Buổi sáng, cô phát bút sáp màu, mọi người vẽ một bức tranh."],
    ["乐乐用彩泥捏了一只小狗,得到了一张贴纸。", "Lạc Lạc nặn một chú chó bằng đất nặn màu, được thưởng một hình dán."],
    ["吃午饭的时候,大家都戴上了围兜。", "Lúc ăn trưa, mọi người đều đeo yếm."],
    ["午睡垫铺好了,小朋友们安静地睡着了。", "Nệm ngủ trưa đã trải xong, các bạn nhỏ yên lặng ngủ thiếp đi."],
    ["下午,他们去玩攀爬架和跷跷板,还在沙坑里挖沙子。", "Buổi chiều, các bé đi chơi khung leo trèo và bập bênh, còn đào cát trong hố cát."],
    ["傍晚,爸爸妈妈来接孩子,老师笑着说:“明天见!”", "Chiều tối, bố mẹ đến đón con, cô cười nói: “Mai gặp nhé!”"],
  ], ["Lạc Lạc nặn gì bằng đất nặn màu?", "他捏了一只小狗。", "他捏了一辆汽车。", "他捏了一座房子。"]),

  dormitory: story(["宿舍的夜晚", "Buổi tối ở ký túc xá"], [
    ["晚上十点,四个室友都回到了宿舍。", "Mười giờ tối, bốn bạn cùng phòng đều đã về ký túc xá."],
    ["小张拿起牙缸刷了牙,又用热水壶烧了一壶水。", "Tiểu Trương cầm cốc đánh răng đi đánh răng, rồi dùng bình đun nấu một bình nước."],
    ["小李把脏衣服放进脸盆,准备明天洗。", "Tiểu Lý để quần áo bẩn vào chậu, định mai giặt."],
    ["插线板上的灯一闪一闪,大家的手机都在充电。", "Đèn trên ổ cắm kéo dài nhấp nháy, điện thoại của mọi người đều đang sạc."],
    ["天气很热,小张在床上铺了凉席。", "Trời rất nóng, Tiểu Trương trải chiếu mát lên giường."],
    ["小李躺着,把手机放在手机支架上看视频。", "Tiểu Lý nằm xem video, để điện thoại trên giá đỡ điện thoại."],
    ["门口的鞋柜里放满了大家的鞋。", "Tủ giày ở cửa để đầy giày của mọi người."],
    ["宿舍在五楼,每天都要爬楼梯。", "Ký túc xá ở tầng năm, ngày nào cũng phải leo cầu thang."],
    ["要进宿舍大门,得先刷门禁卡。", "Muốn vào cổng ký túc xá phải quẹt thẻ ra vào trước."],
    ["小王睡在上下铺的上铺,上去要爬梯子。", "Tiểu Vương ngủ giường trên của giường tầng, lên phải leo thang."],
    ["十一点,宿舍熄灯了,有人爬上了上铺。", "Mười một giờ, ký túc xá tắt đèn, có người leo lên giường trên."],
    ["小王怕蚊子,挂好了蚊帐。", "Tiểu Vương sợ muỗi, đã treo màn."],
    ["隔壁有人说话,小张只好把被子蒙过头。", "Phòng bên có người nói chuyện, Tiểu Trương đành trùm chăn qua đầu."],
    ["很快,宿舍里只剩下安静的呼吸声。", "Chẳng mấy chốc, trong phòng chỉ còn tiếng thở yên tĩnh."],
  ], ["Vì sao Tiểu Trương trùm chăn qua đầu?", "因为隔壁有人说话。", "因为他要听音乐。", "因为他怕冷。"]),

  mountain: story(["爬山看日出", "Leo núi ngắm bình minh"], [
    ["凌晨四点,小明和朋友们开始爬山。", "Bốn giờ sáng, Tiểu Minh và các bạn bắt đầu leo núi."],
    ["路标告诉他们,山顶还有两公里。", "Biển chỉ đường cho họ biết đỉnh núi còn hai cây số."],
    ["石阶很陡,他们走得很慢,一边走一边看路边的野花。", "Bậc thang đá rất dốc, họ đi chậm, vừa đi vừa ngắm hoa dại ven đường."],
    ["走累了,大家在大石头上坐了一会儿。", "Đi mệt, mọi người ngồi nghỉ một lát trên tảng đá lớn."],
    ["听着小溪的水声,他们又有了力气。", "Nghe tiếng nước suối, họ lại có thêm sức lực."],
    ["路边有一排松树,他们在树下拍了照。", "Ven đường có một hàng cây thông, họ chụp ảnh dưới gốc cây."],
    ["瀑布从山上落下来,水花溅到了脸上。", "Thác nước đổ xuống từ trên núi, nước bắn lên cả mặt."],
    ["大家在凉亭里看登山地图,商量下一步怎么走。", "Mọi người xem bản đồ leo núi trong chòi, bàn xem đi tiếp thế nào."],
    ["快到山顶的时候,天开始亮了。", "Sắp đến đỉnh núi thì trời bắt đầu sáng."],
    ["他们就是为了看日出才来的。", "Họ đến đây chính là để ngắm bình minh."],
    ["太阳从云海里慢慢升起来,所有人都安静了。", "Mặt trời từ biển mây từ từ nhô lên, mọi người đều lặng đi."],
    ["下山的时候,他们坐上了缆车,说说笑笑。", "Lúc xuống núi, họ đi cáp treo, vừa nói vừa cười."],
  ], ["Họ đã xuống núi bằng cách nào?", "他们坐缆车下山。", "他们坐汽车下山。", "他们走路下山。"]),

  opera: story(["第一次看京剧", "Lần đầu xem kinh kịch"], [
    ["周末,小雨第一次和爷爷去戏院看京剧。", "Cuối tuần, Tiểu Vũ lần đầu cùng ông đi xem kinh kịch."],
    ["观众席上已经坐满了人,大家都在等开场。", "Khán đài đã ngồi đầy người, ai cũng đang đợi mở màn."],
    ["一声锣响,幕布拉开,鼓声和京胡一起响了起来。", "Một tiếng cồng vang lên, màn kéo ra, trống và đàn nhị cùng cất tiếng."],
    ["戏台上走出一位穿着漂亮戏服的演员。", "Trên sân khấu bước ra một diễn viên mặc trang phục kịch rất đẹp."],
    ["演员在化妆镜前戴好了漂亮的头饰。", "Diễn viên đội xong đồ cài đầu đẹp trước gương trang điểm."],
    ["戏台两边的字幕屏上显示着唱词。", "Màn phụ đề hai bên sân khấu hiện lời hát."],
    ["他脸上画着红色的脸谱,手里拿着折扇。", "Trên mặt anh vẽ mặt nạ màu đỏ, trong tay cầm quạt gấp."],
    ["另一位演员轻轻一甩水袖,台下响起了掌声。", "Một diễn viên khác khẽ phất tay áo dài, dưới sân khấu vang lên tiếng vỗ tay."],
    ["小雨虽然听不太懂,但是觉得很有意思。", "Tiểu Vũ tuy nghe không hiểu lắm nhưng thấy rất thú vị."],
    ["回家的路上,爷爷告诉她每一种脸谱的意思。", "Trên đường về, ông kể cho cô ý nghĩa của từng loại mặt nạ vẽ."],
  ], ["Tiểu Vũ cảm thấy thế nào khi xem kinh kịch?", "她觉得很有意思。", "她觉得很无聊。", "她觉得很害怕。"]),
};
