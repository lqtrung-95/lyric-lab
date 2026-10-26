import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện các cảnh dịch vụ: bệnh viện, hiệu thuốc, bưu điện, cắt tóc, giặt là, cửa hàng điện thoại, khách sạn, văn phòng, thư viện. */
export const SERVICE_STORIES: Record<string, SceneStory> = {
  hospital: story(["小英生病了", "Tiểu Anh bị ốm"], [
    ["小英发烧了,妈妈带她去医院。", "Tiểu Anh bị sốt, mẹ đưa cô bé đến bệnh viện."],
    ["他们都戴着口罩。", "Họ đều đeo khẩu trang."],
    ["护士戴着护士帽,用体温计给她量体温。", "Y tá đội mũ y tá, dùng nhiệt kế đo thân nhiệt cho cô bé."],
    ["医生拿起听诊器听了听,又用血压计量了血压。", "Bác sĩ cầm ống nghe lên nghe, rồi dùng máy đo huyết áp đo huyết áp."],
    ["他在病历上写了几行字。", "Ông viết vài dòng lên bệnh án."],
    ["隔壁的爷爷腿受伤了,他扶着拐杖,坐上轮椅。", "Ông cụ bên cạnh bị thương ở chân, chống nạng rồi ngồi lên xe lăn."],
    ["几个人用担架把一位叔叔抬到病床上。", "Mấy người dùng cáng khiêng một chú lên giường bệnh."],
    ["护士给叔叔换了绷带,还挂上了输液瓶。", "Y tá thay băng gạc cho chú, còn treo bình truyền dịch."],
    ["医生对小英说:“多喝水,按时吃药。”", "Bác sĩ nói với Tiểu Anh: “Uống nhiều nước, uống thuốc đúng giờ.”"],
  ], ["Tiểu Anh bị sao?", "她发烧了。", "她腿受伤了。", "她手破了。"]),

  pharmacy: story(["药店里的小米", "Tiểu Mễ ở hiệu thuốc"], [
    ["小米的手指破了,她去药店。", "Ngón tay Tiểu Mễ bị rách, cô bé đến hiệu thuốc."],
    ["药师先用消毒水给伤口洗一洗,再用棉签擦干。", "Dược sĩ rửa vết thương bằng nước sát trùng, rồi lau khô bằng tăm bông."],
    ["然后贴上创可贴,又涂了一点药膏。", "Sau đó dán băng cá nhân, bôi thêm chút thuốc mỡ."],
    ["小米说眼睛有点干,药师给了她眼药水。", "Tiểu Mễ nói mắt hơi khô, dược sĩ đưa cho cô bé thuốc nhỏ mắt."],
    ["妈妈的药方上写着药片,药师从药柜里拿出来。", "Đơn thuốc của mẹ có viết viên thuốc, dược sĩ lấy ra từ tủ thuốc."],
    ["弟弟咳嗽,要喝药水。", "Em trai bị ho, phải uống thuốc nước."],
    ["药师还建议每天吃一片维生素。", "Dược sĩ còn khuyên mỗi ngày uống một viên vitamin."],
    ["店里还卖急救箱和洗手液。", "Trong tiệm còn bán hộp sơ cứu và nước rửa tay."],
  ], ["Cái gì của Tiểu Mễ bị rách?", "她的手指破了。", "她的脚破了。", "她的眼睛破了。"]),

  postoffice: story(["寄给朋友的信", "Lá thư gửi cho bạn"], [
    ["小路想给远方的朋友寄东西。", "Tiểu Lộ muốn gửi đồ cho người bạn ở phương xa."],
    ["他先写了一张明信片,又把信放进信封。", "Cậu viết trước một tấm bưu thiếp, rồi cho thư vào phong bì."],
    ["在信封上,他贴了一张邮票。", "Trên phong bì, cậu dán một con tem."],
    ["包裹要用胶带封好,再填快递单。", "Bưu kiện phải dán kín bằng băng keo, rồi điền phiếu gửi hàng."],
    ["工作人员把包裹放在邮件秤上称一称。", "Nhân viên đặt bưu kiện lên cân bưu kiện để cân."],
    ["他在包裹上贴了标签。", "Cậu dán nhãn lên bưu kiện."],
    ["小路把信件投进邮筒。", "Tiểu Lộ bỏ thư từ vào hòm thư."],
    ["邮递员背着邮袋,把信送到每个人家的信箱里。", "Người đưa thư đeo túi thư, đưa thư vào hộp thư nhà từng người."],
  ], ["Ai đeo túi thư?", "邮递员背着邮袋。", "小路背着邮袋。", "工作人员背着邮袋。"]),

  salon: story(["小丽的新发型", "Kiểu tóc mới của Tiểu Lệ"], [
    ["星期六,小丽去理发店。", "Thứ bảy, Tiểu Lệ đến tiệm cắt tóc."],
    ["她坐上理发椅,理发师给她围上围布。", "Cô ngồi lên ghế cắt tóc, thợ choàng tấm choàng cho cô."],
    ["理发师先用梳子梳头,再用剪刀剪短一点。", "Thợ chải tóc bằng lược trước, rồi dùng kéo cắt ngắn một chút."],
    ["旁边的叔叔用推子剃头,爷爷用剃刀刮胡子。", "Chú bên cạnh dùng tông đơ cạo đầu, ông cụ dùng dao cạo cạo râu."],
    ["理发师给小丽用了护发素,又喷了一点发胶。", "Thợ dùng dầu xả cho Tiểu Lệ, rồi xịt một ít keo tóc."],
    ["她用发刷把头发刷好,别上一个发夹。", "Cô dùng bàn chải tóc chải gọn tóc, cài một chiếc kẹp tóc."],
    ["最后,她用皮筋扎起头发。", "Cuối cùng, cô buộc tóc lên bằng dây thun."],
    ["墙边有一顶假发,很有意思。", "Cạnh tường có một bộ tóc giả, rất thú vị."],
  ], ["Tiểu Lệ ngồi ở đâu?", "她坐在理发椅上。", "她坐在沙发上。", "她坐在课桌旁。"]),

  laundry: story(["洗衣店的一天", "Một ngày ở tiệm giặt là"], [
    ["星期六,小云和妈妈去洗衣店。", "Thứ bảy, Tiểu Vân và mẹ đến tiệm giặt là."],
    ["她们把衬衫、外套和床单放进洗衣机。", "Họ cho áo sơ mi, áo khoác và ga giường vào máy giặt."],
    ["妈妈倒了一点洗衣粉,小云拿来一块肥皂洗袜子。", "Mẹ đổ một ít bột giặt, Tiểu Vân lấy một cục xà phòng giặt tất."],
    ["洗好以后,有些衣服放进烘干机。", "Giặt xong, một số quần áo được cho vào máy sấy."],
    ["有些衣服要晾在晾衣绳上,用衣夹夹住。", "Một số quần áo phải phơi trên dây phơi, kẹp lại bằng kẹp quần áo."],
    ["干了的衬衫挂在衣架上。", "Áo sơ mi khô được treo lên móc áo."],
    ["阿姨用熨斗把衬衫熨平。", "Cô thợ dùng bàn ủi ủi phẳng áo sơ mi."],
    ["外套破了一个小洞,阿姨用缝纫机补好了。", "Áo khoác bị rách một lỗ nhỏ, cô thợ dùng máy khâu vá lại."],
  ], ["Ai dùng bàn ủi?", "阿姨用熨斗。", "小云用熨斗。", "妈妈用熨斗。"]),

  phoneshop: story(["小凯买手机配件", "Tiểu Khải mua phụ kiện điện thoại"], [
    ["小凯的手机快没电了,他走进手机店。", "Điện thoại Tiểu Khải sắp hết pin, cậu bước vào tiệm điện thoại."],
    ["店员给他拿来充电器和一根数据线。", "Nhân viên lấy cho cậu cục sạc và một sợi dây cáp."],
    ["小凯还买了一个手机壳,颜色是蓝色的。", "Tiểu Khải còn mua một chiếc ốp điện thoại màu xanh dương."],
    ["他的旧电池不好用,所以又买了一个充电宝。", "Pin cũ của cậu dùng không tốt, nên cậu mua thêm một cục sạc dự phòng."],
    ["柜台旁边有插座,可以马上试一试。", "Cạnh quầy có ổ cắm điện, có thể thử ngay."],
    ["他又看了看智能手表、平板电脑和音箱。", "Cậu lại xem đồng hồ thông minh, máy tính bảng và loa."],
    ["家里的网很慢,他想换一个路由器。", "Mạng ở nhà rất chậm, cậu muốn đổi một bộ phát wifi."],
    ["店员说:“这是保修卡,请收好。”", "Nhân viên nói: “Đây là thẻ bảo hành, xin giữ kỹ.”"],
    ["小凯试了试话筒,笑着走出了商店。", "Tiểu Khải thử micro, cười bước ra khỏi cửa hàng."],
  ], ["Vì sao Tiểu Khải đến tiệm?", "因为他的手机快没电了。", "因为他的手机掉了。", "因为他想买音箱。"]),

  hotel: story(["住进酒店", "Nhận phòng khách sạn"], [
    ["小张一家到了酒店。", "Gia đình anh Trương đến khách sạn."],
    ["这家酒店不用钥匙,只用房卡。", "Khách sạn này không dùng chìa khóa, chỉ dùng thẻ phòng."],
    ["他们坐电梯上楼,用房卡打开了门。", "Họ đi thang máy lên lầu, dùng thẻ phòng mở cửa."],
    ["房间里有沙发、衣柜和小冰箱。", "Trong phòng có ghế sofa, tủ quần áo và tủ lạnh mini."],
    ["浴室里有毛巾、吹风机和浴袍。", "Trong phòng tắm có khăn tắm, máy sấy tóc và áo choàng tắm."],
    ["爸爸换上拖鞋,打电话订早餐。", "Bố đổi sang dép đi trong nhà, gọi điện đặt bữa sáng."],
    ["门口挂着“请勿打扰”的牌子,他们好好睡了一觉。", "Ngoài cửa treo biển “xin đừng làm phiền”, họ ngủ một giấc thật ngon."],
  ], ["Họ mở cửa bằng gì?", "他们用房卡开门。", "他们用钥匙开门。", "他们用电话开门。"]),

  office: story(["星期一的办公室", "Văn phòng sáng thứ hai"], [
    ["星期一早上,小周来到办公室。", "Sáng thứ hai, Tiểu Chu đến văn phòng."],
    ["他打开电脑,一只手握着鼠标,一只手敲键盘。", "Anh mở máy tính, một tay cầm chuột, một tay gõ bàn phím."],
    ["他的手机响了,是客户打来的。", "Điện thoại của anh reo, là khách hàng gọi đến."],
    ["他把文件放进打印机,印出三份。", "Anh cho tài liệu vào máy in, in ra ba bản."],
    ["订书机把纸订好,再放进文件夹。", "Cái dập ghim ghim giấy lại, rồi cho vào cặp hồ sơ."],
    ["他用计算器算了一下钱,又递给客户一张名片。", "Anh dùng máy tính bỏ túi tính tiền, rồi đưa cho khách một tấm danh thiếp."],
    ["会议桌旁的白板上写着今天的工作。", "Trên bảng trắng cạnh bàn họp viết công việc hôm nay."],
    ["台灯亮着,他去饮水机那里接了一杯水。", "Đèn bàn đang sáng, anh ra máy nước uống lấy một cốc nước."],
  ], ["Ai gọi điện đến?", "客户打来了电话。", "老师打来了电话。", "妈妈打来了电话。"]),

  library: story(["图书馆里的小文", "Tiểu Văn ở thư viện"], [
    ["小文喜欢去图书馆。", "Tiểu Văn thích đến thư viện."],
    ["他先拿出借书证,走到书架前。", "Cậu lấy thẻ thư viện ra trước, đi đến giá sách."],
    ["最上面的书太高了,他站上梯子才拿到。", "Quyển sách trên cùng cao quá, cậu đứng lên thang mới lấy được."],
    ["管理员推着书车,把书放回书架。", "Thủ thư đẩy xe sách, xếp sách về giá."],
    ["阅览桌上有一块安静牌,上面写着“请保持安静”。", "Trên bàn đọc có một tấm biển giữ yên lặng, trên đó viết “Xin giữ yên lặng”."],
    ["他坐在阅览桌旁,翻开一本杂志,又看了看报纸。", "Cậu ngồi cạnh bàn đọc, mở một cuốn tạp chí, rồi xem thêm tờ báo."],
    ["遇到不认识的字,他就查词典。", "Gặp chữ không biết, cậu tra từ điển."],
    ["他用荧光笔画下重点,再夹上书签。", "Cậu dùng bút dạ quang gạch ý chính, rồi kẹp thẻ đánh dấu sách."],
    ["书立让书不会倒下来。", "Cái chặn sách giúp sách không bị đổ xuống."],
  ], ["Tiểu Văn làm gì trước tiên?", "他先拿出借书证。", "他先翻开杂志。", "他先查词典。"]),
};
