import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện của nhóm cảnh ẩm thực đường phố, văn hóa và dịch vụ đời thường (quán điểm tâm, chợ đêm, trà quán, Đông y, thư pháp, chuyển phát, karaoke, Tết). */
export const CULTURE_LIFE_STORIES: Record<string, SceneStory> = {
  breakfast: story(["早餐店的早晨", "Buổi sáng ở quán điểm tâm"], [
    ["天刚亮,小李来到早餐店,蒸笼里冒着热气。", "Trời vừa sáng, Tiểu Lý đến quán điểm tâm, hơi nóng bốc lên từ xửng hấp."],
    ["老板娘用豆浆机做豆浆,油锅里炸着油条。", "Bà chủ dùng máy làm sữa đậu nành, trong chảo dầu đang chiên quẩy."],
    ["小李要了两个包子和一个茶叶蛋。", "Tiểu Lý gọi hai cái bánh bao và một quả trứng trà."],
    ["他又点了一碗粥,配一点咸菜。", "Anh lại gọi thêm một bát cháo, ăn kèm chút dưa muối."],
    ["旁边的阿姨在吃热乎乎的馒头。", "Cô bên cạnh đang ăn màn thầu nóng hổi."],
    ["一位学生买了煎饼,边走边吃。", "Một học sinh mua bánh kếp, vừa đi vừa ăn."],
    ["小李用餐巾纸擦了擦手,吃得很开心。", "Tiểu Lý dùng khăn giấy lau tay, ăn rất vui vẻ."],
    ["付完钱,他带着一杯豆浆去上班了。", "Trả tiền xong, anh mang theo một ly sữa đậu nành đi làm."],
  ], ["Tiểu Lý đã gọi món gì?", "他要了包子和茶叶蛋。", "他要了烤鸭和面条。", "他要了咖啡和蛋糕。"]),

  nightmarket: story(["夜市的晚上", "Buổi tối ở chợ đêm"], [
    ["天黑了,夜市里挂满了彩灯,特别热闹。", "Trời tối rồi, chợ đêm treo đầy đèn màu, thật náo nhiệt."],
    ["小贩推着小推车,把摊子摆好。", "Người bán hàng đẩy xe đến, bày sạp xong."],
    ["烤炉上的烤串滋滋作响,香味飘得很远。", "Xiên nướng trên lò kêu xèo xèo, mùi thơm bay rất xa."],
    ["小美先买了一块鸡排,又要了一串糖葫芦。", "Tiểu Mỹ mua trước một miếng gà chiên xù, lại lấy thêm một xiên mứt quả."],
    ["弟弟喜欢烤玉米,爸爸想吃烤鱿鱼。", "Em trai thích ngô nướng, bố muốn ăn mực nướng."],
    ["妈妈买了烤红薯,还点了一份炒面。", "Mẹ mua khoai lang nướng, còn gọi thêm một phần mì xào."],
    ["大家坐在塑料凳上,一边吃一边聊天。", "Mọi người ngồi trên ghế nhựa, vừa ăn vừa trò chuyện."],
    ["最后,他们还尝了一小块臭豆腐。", "Cuối cùng, họ còn nếm thử một miếng đậu phụ thối nhỏ."],
  ], ["Em trai thích ăn gì?", "弟弟喜欢烤玉米。", "弟弟喜欢咖啡。", "弟弟喜欢蛋糕。"]),

  teahouse: story(["茶馆里的下午", "Buổi chiều ở trà quán"], [
    ["下午,阿明来到茶馆,在茶桌旁坐下。", "Buổi chiều, A Minh đến trà quán, ngồi xuống bên bàn trà."],
    ["老板用茶炉烧开水,又拿出茶罐。", "Ông chủ dùng lò đun nước sôi, lại lấy hộp trà ra."],
    ["他把茶叶放进紫砂壶,倒在茶杯里。", "Ông cho lá trà vào ấm tử sa, rót vào chén trà."],
    ["茶具都摆在茶盘上,还有一只可爱的茶宠。", "Bộ đồ trà bày trên khay trà, còn có một tượng thú trà đáng yêu."],
    ["旁边的屏风后面,有人在弹古琴。", "Phía sau bình phong bên cạnh, có người đang gảy đàn cổ cầm."],
    ["服务员送来一碟茶点,很好吃。", "Nhân viên mang đến một đĩa điểm tâm trà, rất ngon."],
    ["天气有点热,老爷爷摇着蒲扇聊天。", "Trời hơi nóng, ông cụ phe phẩy quạt cọ trò chuyện."],
    ["阿明喝着茶,觉得心情很平静。", "A Minh uống trà, cảm thấy lòng rất bình yên."],
  ], ["Ai đang gảy đàn?", "有人在弹古琴。", "有人在唱京剧。", "有人在跳舞。"]),

  tcm: story(["中医馆看病", "Khám bệnh ở phòng Đông y"], [
    ["奶奶最近睡不好,孙女陪她去中医馆。", "Dạo này bà ngủ không ngon, cháu gái đưa bà đến phòng khám Đông y."],
    ["医生请她坐在诊桌前,把手放在脉枕上。", "Thầy thuốc mời bà ngồi trước bàn khám, đặt tay lên gối bắt mạch."],
    ["医生一边把脉,一边看墙上的经络图。", "Thầy thuốc vừa bắt mạch vừa xem hình kinh lạc trên tường."],
    ["他拿出银针,在奶奶的手上轻轻扎了几下。", "Ông lấy kim bạc ra, châm nhẹ vài cái lên tay bà."],
    ["然后点上艾条,又给她拔了火罐。", "Rồi đốt điếu ngải, lại giác hơi cho bà."],
    ["药师用药秤称好中药,再放进枸杞和人参。", "Dược sĩ dùng cân thuốc cân xong thuốc Đông y, rồi cho thêm kỷ tử và nhân sâm."],
    ["回到家,孙女把药倒进药罐,放在药炉上煮。", "Về nhà, cháu gái đổ thuốc vào nồi sắc, đặt lên lò đun."],
    ["奶奶喝了药,觉得舒服多了。", "Bà uống thuốc xong, thấy dễ chịu hơn nhiều."],
  ], ["Ai đi cùng bà đến phòng khám?", "孙女陪她去。", "邻居陪她去。", "老师陪她去。"]),

  calligraphy: story(["第一堂书法课", "Buổi học thư pháp đầu tiên"], [
    ["书法教室里很安静,小朋友们坐在蒲团上。", "Lớp thư pháp rất yên tĩnh, các bạn nhỏ ngồi trên đệm."],
    ["老师把毛毡铺在书法桌上,又放好宣纸。", "Thầy trải nỉ lên bàn viết thư pháp, rồi đặt giấy Tuyên ngay ngắn."],
    ["他们用墨条在砚台里磨墨。", "Các em dùng thỏi mực mài mực trong nghiên."],
    ["小林拿起毛笔,照着字帖慢慢写。", "Tiểu Lâm cầm bút lông, viết chậm theo sách mẫu chữ."],
    ["他用镇纸压住宣纸,免得纸动来动去。", "Cậu dùng chặn giấy đè giấy Tuyên, để giấy khỏi xê dịch."],
    ["写完以后,毛笔要放在笔架上。", "Viết xong, bút lông phải đặt lên giá gác bút."],
    ["别的毛笔都插在笔筒里,排得整整齐齐。", "Những cây bút khác đều cắm trong ống đựng bút, xếp ngay ngắn."],
    ["墙上的条幅,是老师送给大家的字。", "Dải chữ treo trên tường là chữ thầy tặng mọi người."],
  ], ["Viết xong thì bút để ở đâu?", "毛笔放在笔架上。", "毛笔放在书包里。", "毛笔放在碗里。"]),

  courier: story(["寄快递", "Gửi hàng chuyển phát"], [
    ["小周要给外地的朋友寄一份生日礼物。", "Tiểu Chu muốn gửi một món quà sinh nhật cho người bạn ở nơi khác."],
    ["他在快递站拿了一个纸箱,里面垫上泡沫。", "Anh lấy một thùng carton ở trạm chuyển phát, lót xốp bên trong."],
    ["工作人员用封箱带把纸箱封好。", "Nhân viên dùng băng dính dán thùng dán kín thùng carton."],
    ["然后把箱子放在电子秤上称重量。", "Rồi đặt thùng lên cân điện tử để cân."],
    ["小周在登记本上写下名字和电话。", "Tiểu Chu ghi tên và số điện thoại vào sổ đăng ký."],
    ["工作人员贴上面单,条形码清清楚楚。", "Nhân viên dán phiếu gửi, mã vạch rõ ràng sạch sẽ."],
    ["她用扫描枪扫一扫,包裹就送上分拣台。", "Cô dùng súng quét mã quét một cái, gói hàng được đưa lên bàn phân loại."],
    ["快递袋和周转箱都装满了,收件人到快递柜取件。", "Túi chuyển phát và thùng luân chuyển đều đầy, người nhận đến tủ nhận hàng lấy hàng."],
  ], ["Tiểu Chu gửi gì?", "他寄的是生日礼物。", "他寄的是一封信。", "他寄的是一束花。"]),

  ktv: story(["周末去唱歌", "Cuối tuần đi hát"], [
    ["周末,朋友们一起来唱歌,坐在卡座上。", "Cuối tuần, bạn bè cùng đến hát, ngồi trên ghế sofa."],
    ["小红先在点歌机上点了一首歌。", "Tiểu Hồng chọn trước một bài trên máy chọn bài."],
    ["她拿起麦克风,把话筒架调得高高的。", "Cô cầm micro, chỉnh giá micro lên cao."],
    ["灯球转起来,音响里传出好听的音乐。", "Quả cầu đèn xoay lên, trong dàn loa vang ra âm nhạc hay."],
    ["小明在看歌单,小刚摇着沙锤。", "Tiểu Minh đang xem danh sách bài hát, Tiểu Cương lắc maracas."],
    ["大家挥着荧光棒,还有人拿着铃鼓打节拍。", "Mọi người vẫy gậy phát sáng, còn có người cầm trống lắc gõ nhịp."],
    ["唱累了,他们一边吃果盘,一边玩骰子。", "Hát mệt rồi, họ vừa ăn trái cây vừa chơi xúc xắc."],
    ["最后,所有人一起唱了一首大家都会的歌。", "Cuối cùng, tất cả cùng hát một bài mà ai cũng biết."],
  ], ["Ai chọn bài đầu tiên?", "小红点了第一首歌。", "小明点了第一首歌。", "小刚点了第一首歌。"]),

  newyear: story(["过年啦", "Tết đến rồi"], [
    ["大年三十,家里挂起了红灯笼。", "Ngày ba mươi Tết, trong nhà treo lên đèn lồng đỏ."],
    ["爸爸贴上春联和福字,奶奶贴了窗花。", "Bố dán câu đối và chữ Phúc, bà dán hoa giấy cửa sổ."],
    ["客厅里摆着金桔树,墙上挂着中国结。", "Phòng khách đặt cây quất, trên tường treo nút thắt Trung Hoa."],
    ["门边还贴了一张年画,红红火火的。", "Cạnh cửa còn dán một bức tranh Tết, đỏ rực rỡ."],
    ["晚上,全家人围坐在圆桌旁吃团圆饭。", "Buổi tối, cả nhà ngồi quanh bàn tròn ăn bữa cơm đoàn viên."],
    ["桌上有年糕,也有瓜子和糖果。", "Trên bàn có bánh niangao, cũng có hạt dưa và kẹo."],
    ["孩子们收到了红包,高兴得跳起来。", "Bọn trẻ nhận được lì xì, vui đến nhảy cẫng lên."],
    ["外面传来鞭炮声,新的一年开始了。", "Bên ngoài vọng đến tiếng pháo, năm mới bắt đầu rồi."],
  ], ["Cả nhà ăn cơm đoàn viên ở đâu?", "他们围坐在圆桌旁。", "他们坐在沙发上。", "他们坐在床上。"]),
};
