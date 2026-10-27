import type { SceneConversation } from "../explore-types";

/** Hội thoại mẫu ngắn của từng cảnh (hai người nói chuyện đúng tình huống ở đó), hiện ở bảng "Hội thoại mẫu". Tự viết, đơn giản. */
export const SCENE_CONVERSATIONS: Record<string, SceneConversation> = {
  "room": {
    speakers: ["Mẹ", "Con"],
    lines: [
      { who: 0, zh: "你回来了?", vi: "Con về rồi à?" },
      { who: 1, zh: "妈妈,我回来了。", vi: "Mẹ ơi, con về rồi." },
      { who: 0, zh: "饭做好了,快去洗手。", vi: "Cơm nấu xong rồi, mau đi rửa tay." },
      { who: 1, zh: "好的,我马上来。", vi: "Vâng, con tới ngay." },
    ],
  },
  "restaurant": {
    speakers: ["Phục vụ", "Khách"],
    lines: [
      { who: 0, zh: "您好,请问几位?", vi: "Xin chào, quý khách đi mấy người?" },
      { who: 1, zh: "两位。", vi: "Hai người." },
      { who: 0, zh: "这是菜单,请慢慢看。", vi: "Đây là thực đơn, mời xem từ từ." },
      { who: 1, zh: "我要一碗面条和一壶茶。", vi: "Cho tôi một bát mì và một ấm trà." },
      { who: 0, zh: "好的,请稍等。", vi: "Vâng, xin chờ một lát." },
    ],
  },
  "market": {
    speakers: ["Chủ sạp", "Khách"],
    lines: [
      { who: 1, zh: "这些水果怎么卖?", vi: "Chỗ trái cây này bán thế nào?" },
      { who: 0, zh: "十块钱一斤。", vi: "Mười tệ một cân." },
      { who: 1, zh: "太贵了,八块行吗?", vi: "Đắt quá, tám tệ được không?" },
      { who: 0, zh: "好吧,给你八块。", vi: "Được rồi, tính cho bạn tám tệ." },
    ],
  },
  "station": {
    speakers: ["Nhân viên bán vé", "Hành khách"],
    lines: [
      { who: 1, zh: "你好,我要买一张去上海的票。", vi: "Xin chào, tôi muốn mua một vé đi Thượng Hải." },
      { who: 0, zh: "要几点的?", vi: "Chuyến mấy giờ?" },
      { who: 1, zh: "上午九点的。", vi: "Chuyến chín giờ sáng." },
      { who: 0, zh: "一共一百块,请在站台等车。", vi: "Tổng cộng một trăm tệ, mời chờ tàu ở sân ga." },
    ],
  },
  "park": {
    speakers: ["Bạn A", "Bạn B"],
    lines: [
      { who: 0, zh: "今天天气真好!", vi: "Hôm nay trời đẹp thật!" },
      { who: 1, zh: "是啊,我们去划船吧。", vi: "Ừ, chúng ta đi chèo thuyền nhé." },
      { who: 0, zh: "好主意!先拍张照吧。", vi: "Ý hay! Chụp tấm ảnh trước đã." },
      { who: 1, zh: "来,笑一笑!", vi: "Nào, cười lên nào!" },
    ],
  },
  "hospital": {
    speakers: ["Bác sĩ", "Bệnh nhân"],
    lines: [
      { who: 0, zh: "你哪儿不舒服?", vi: "Bạn thấy không khỏe ở đâu?" },
      { who: 1, zh: "我头疼,还有点发烧。", vi: "Tôi đau đầu và hơi sốt." },
      { who: 0, zh: "先量一下体温吧。", vi: "Đo nhiệt độ trước nhé." },
      { who: 0, zh: "要吃药,多喝水,好好休息。", vi: "Phải uống thuốc, uống nhiều nước và nghỉ ngơi." },
    ],
  },
  "school": {
    speakers: ["Cô giáo", "Học sinh"],
    lines: [
      { who: 0, zh: "同学们好!", vi: "Chào các em!" },
      { who: 1, zh: "老师好!", vi: "Em chào cô ạ!" },
      { who: 0, zh: "请打开课本第十页。", vi: "Mời các em mở sách giáo khoa trang mười." },
      { who: 1, zh: "老师,我不明白。", vi: "Cô ơi, em không hiểu." },
      { who: 0, zh: "没关系,我再说一遍。", vi: "Không sao, cô nói lại một lần nữa." },
    ],
  },
  "clothing-store": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 0, zh: "欢迎光临,想买什么?", vi: "Chào mừng quý khách, muốn mua gì ạ?" },
      { who: 1, zh: "我想买一件衣服。", vi: "Tôi muốn mua một cái áo." },
      { who: 0, zh: "这件怎么样?", vi: "Cái này thì sao ạ?" },
      { who: 1, zh: "我可以试一试吗?", vi: "Tôi có thể thử không?" },
      { who: 0, zh: "当然可以,试衣间在那边。", vi: "Tất nhiên được, phòng thử đồ ở bên kia." },
    ],
  },
  "hotel": {
    speakers: ["Lễ tân", "Khách"],
    lines: [
      { who: 0, zh: "您好,欢迎入住。", vi: "Xin chào, chào mừng quý khách." },
      { who: 1, zh: "我订了一个房间。", vi: "Tôi đã đặt một phòng." },
      { who: 0, zh: "请给我您的护照。", vi: "Xin cho tôi xem hộ chiếu của quý khách." },
      { who: 0, zh: "这是您的房卡,房间在八楼。", vi: "Đây là thẻ phòng của quý khách, phòng ở tầng tám." },
    ],
  },
  "airport": {
    speakers: ["Nhân viên", "Hành khách"],
    lines: [
      { who: 0, zh: "请出示您的护照和机票。", vi: "Xin xuất trình hộ chiếu và vé máy bay." },
      { who: 1, zh: "给您。", vi: "Của bạn đây." },
      { who: 0, zh: "您有几件行李?", vi: "Quý khách có mấy kiện hành lý?" },
      { who: 1, zh: "一件。", vi: "Một kiện." },
      { who: 0, zh: "登机口在三号,请注意时间。", vi: "Cửa lên máy bay là số ba, xin chú ý thời gian." },
    ],
  },
  "office": {
    speakers: ["Đồng nghiệp A", "Đồng nghiệp B"],
    lines: [
      { who: 0, zh: "早上好!", vi: "Chào buổi sáng!" },
      { who: 1, zh: "早!今天有会议吗?", vi: "Chào! Hôm nay có họp không?" },
      { who: 0, zh: "有,十点开始。", vi: "Có, mười giờ bắt đầu." },
      { who: 1, zh: "好,我把文件带过去。", vi: "Được, tôi mang tài liệu qua." },
    ],
  },
  "library": {
    speakers: ["Thủ thư", "Bạn đọc"],
    lines: [
      { who: 1, zh: "你好,我想借这本书。", vi: "Xin chào, tôi muốn mượn cuốn sách này." },
      { who: 0, zh: "请出示借书证。", vi: "Xin xuất trình thẻ thư viện." },
      { who: 1, zh: "可以借多久?", vi: "Mượn được bao lâu?" },
      { who: 0, zh: "可以借一个月,请按时还书。", vi: "Mượn được một tháng, xin trả sách đúng hạn." },
    ],
  },
  "supermarket": {
    speakers: ["Thu ngân", "Khách"],
    lines: [
      { who: 0, zh: "一共五十块。", vi: "Tổng cộng năm mươi tệ." },
      { who: 1, zh: "可以刷卡吗?", vi: "Có thể quẹt thẻ không?" },
      { who: 0, zh: "可以。需要袋子吗?", vi: "Được. Bạn cần túi không?" },
      { who: 1, zh: "要一个,谢谢。", vi: "Cho tôi một cái, cảm ơn." },
    ],
  },
  "beach": {
    speakers: ["Bạn A", "Bạn B"],
    lines: [
      { who: 0, zh: "海水真蓝!", vi: "Nước biển xanh thật!" },
      { who: 1, zh: "我们去游泳吧。", vi: "Chúng ta đi bơi nhé." },
      { who: 0, zh: "先涂防晒霜。", vi: "Thoa kem chống nắng trước đã." },
      { who: 1, zh: "好,然后一起堆沙堡。", vi: "Được, sau đó cùng xây lâu đài cát." },
    ],
  },
  "stadium": {
    speakers: ["Huấn luyện viên", "Cầu thủ"],
    lines: [
      { who: 0, zh: "大家准备好了吗?", vi: "Mọi người sẵn sàng chưa?" },
      { who: 1, zh: "准备好了!", vi: "Sẵn sàng rồi ạ!" },
      { who: 0, zh: "比赛开始,加油!", vi: "Trận đấu bắt đầu, cố lên!" },
      { who: 1, zh: "我们一定会赢!", vi: "Chúng ta nhất định sẽ thắng!" },
    ],
  },
  "bakery": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 0, zh: "您想要什么?", vi: "Quý khách muốn gì ạ?" },
      { who: 1, zh: "我要一个生日蛋糕。", vi: "Tôi muốn một cái bánh sinh nhật." },
      { who: 0, zh: "要写字吗?", vi: "Có cần viết chữ lên không?" },
      { who: 1, zh: "写:生日快乐。", vi: "Viết: Chúc mừng sinh nhật." },
    ],
  },
  "kitchen": {
    speakers: ["Đầu bếp", "Học việc"],
    lines: [
      { who: 0, zh: "菜切好了吗?", vi: "Rau thái xong chưa?" },
      { who: 1, zh: "切好了。", vi: "Xong rồi ạ." },
      { who: 0, zh: "那把油倒进锅里。", vi: "Vậy đổ dầu vào nồi." },
      { who: 0, zh: "小心,锅很烫!", vi: "Cẩn thận, nồi rất nóng!" },
    ],
  },
  "museum": {
    speakers: ["Hướng dẫn viên", "Khách tham quan"],
    lines: [
      { who: 0, zh: "这是一幅古代的画。", vi: "Đây là một bức tranh cổ." },
      { who: 1, zh: "真漂亮!可以拍照吗?", vi: "Đẹp quá! Có được chụp ảnh không?" },
      { who: 0, zh: "可以,但是不要用闪光灯。", vi: "Được, nhưng đừng dùng đèn flash." },
      { who: 1, zh: "好的,谢谢。", vi: "Vâng, cảm ơn." },
    ],
  },
  "bank": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 0, zh: "您好,请问办什么业务?", vi: "Xin chào, quý khách cần làm gì ạ?" },
      { who: 1, zh: "我想取钱。", vi: "Tôi muốn rút tiền." },
      { who: 0, zh: "请输入密码。", vi: "Xin nhập mật mã." },
      { who: 0, zh: "好了,请拿好您的钱和银行卡。", vi: "Xong rồi, xin cầm cẩn thận tiền và thẻ của quý khách." },
    ],
  },
  "cinema": {
    speakers: ["Nhân viên bán vé", "Khách"],
    lines: [
      { who: 1, zh: "你好,我要两张电影票。", vi: "Xin chào, tôi muốn hai vé xem phim." },
      { who: 0, zh: "看哪一场?", vi: "Xem suất nào?" },
      { who: 1, zh: "晚上七点的。", vi: "Suất bảy giờ tối." },
      { who: 0, zh: "请到三号厅,祝您看得开心。", vi: "Mời vào phòng chiếu số ba, chúc quý khách xem phim vui vẻ." },
    ],
  },
  "gym": {
    speakers: ["Huấn luyện viên", "Học viên"],
    lines: [
      { who: 0, zh: "先热身五分钟。", vi: "Khởi động năm phút trước." },
      { who: 1, zh: "好的。", vi: "Vâng." },
      { who: 0, zh: "然后做二十个俯卧撑。", vi: "Sau đó chống đẩy hai mươi cái." },
      { who: 1, zh: "太累了!", vi: "Mệt quá!" },
      { who: 0, zh: "加油,坚持住!", vi: "Cố lên, kiên trì nào!" },
    ],
  },
  "salon": {
    speakers: ["Thợ tóc", "Khách"],
    lines: [
      { who: 0, zh: "你想剪什么发型?", vi: "Bạn muốn cắt kiểu gì?" },
      { who: 1, zh: "剪短一点。", vi: "Cắt ngắn một chút." },
      { who: 0, zh: "这样可以吗?", vi: "Như thế này được không?" },
      { who: 1, zh: "很好,谢谢。", vi: "Rất tốt, cảm ơn." },
    ],
  },
  "postoffice": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 1, zh: "我想寄一个包裹到上海。", vi: "Tôi muốn gửi một bưu kiện đến Thượng Hải." },
      { who: 0, zh: "好的,请先填快递单。", vi: "Vâng, xin điền phiếu gửi hàng trước." },
      { who: 1, zh: "要几天才能到?", vi: "Mất mấy ngày thì tới?" },
      { who: 0, zh: "三天。请贴好标签。", vi: "Ba ngày. Xin dán nhãn cho kỹ." },
    ],
  },
  "pharmacy": {
    speakers: ["Dược sĩ", "Khách"],
    lines: [
      { who: 0, zh: "你哪里不舒服?", vi: "Bạn thấy khó chịu ở đâu?" },
      { who: 1, zh: "我头疼,还有点发烧。", vi: "Tôi đau đầu, còn hơi sốt." },
      { who: 0, zh: "这个药一天吃三次,饭后吃。", vi: "Thuốc này một ngày uống ba lần, sau bữa ăn." },
      { who: 1, zh: "好的,谢谢你。", vi: "Vâng, cảm ơn cô." },
    ],
  },
  "phoneshop": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 1, zh: "这个手机多少钱?", vi: "Chiếc điện thoại này bao nhiêu tiền?" },
      { who: 0, zh: "三千块,送手机壳。", vi: "Ba nghìn tệ, tặng kèm ốp điện thoại." },
      { who: 1, zh: "可以便宜一点吗?", vi: "Có thể rẻ hơn một chút không?" },
      { who: 0, zh: "好吧,再送你一个充电宝。", vi: "Được rồi, tặng thêm cho bạn một cục sạc dự phòng." },
    ],
  },
  "hotpot": {
    speakers: ["Phục vụ", "Khách"],
    lines: [
      { who: 0, zh: "你们要什么锅底?", vi: "Các bạn muốn nước lẩu loại nào?" },
      { who: 1, zh: "一个辣的,一个不辣的。", vi: "Một nồi cay, một nồi không cay." },
      { who: 0, zh: "还要什么?", vi: "Còn gọi gì nữa?" },
      { who: 1, zh: "再来一盘肉片和一盘虾。", vi: "Cho thêm một đĩa thịt thái lát và một đĩa tôm." },
    ],
  },
  "zoo": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 1, zh: "请问熊猫在哪儿?", vi: "Xin hỏi gấu trúc ở đâu?" },
      { who: 0, zh: "在前面,往右走。", vi: "Ở phía trước, đi về bên phải." },
      { who: 1, zh: "这里可以拍照吗?", vi: "Ở đây được chụp ảnh không?" },
      { who: 0, zh: "可以,但是请不要喂动物。", vi: "Được, nhưng xin đừng cho động vật ăn." },
    ],
  },
  "flowershop": {
    speakers: ["Chủ tiệm", "Khách"],
    lines: [
      { who: 0, zh: "您好,想买什么花?", vi: "Xin chào, bạn muốn mua hoa gì?" },
      { who: 1, zh: "我想买一束花,送给妈妈。", vi: "Tôi muốn mua một bó hoa tặng mẹ." },
      { who: 0, zh: "玫瑰和百合怎么样?", vi: "Hoa hồng và hoa bách hợp thì sao?" },
      { who: 1, zh: "很好,请帮我包一下。", vi: "Rất tốt, xin gói giúp tôi." },
    ],
  },
  "garage": {
    speakers: ["Thợ máy", "Khách"],
    lines: [
      { who: 1, zh: "我的车坏了,请帮我检查一下。", vi: "Xe tôi hỏng rồi, xin kiểm tra giúp tôi." },
      { who: 0, zh: "轮胎没气了,还要换机油。", vi: "Lốp hết hơi, còn phải thay dầu máy." },
      { who: 1, zh: "要修多长时间?", vi: "Sửa mất bao lâu?" },
      { who: 0, zh: "两个小时,明天可以来取车。", vi: "Hai tiếng, ngày mai có thể đến lấy xe." },
    ],
  },
  "bubbletea": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 0, zh: "您好,想喝点什么?", vi: "Xin chào, bạn muốn uống gì?" },
      { who: 1, zh: "我要一杯奶茶,少糖,少冰。", vi: "Cho tôi một ly trà sữa, ít đường, ít đá." },
      { who: 0, zh: "要加珍珠吗?", vi: "Có thêm trân châu không?" },
      { who: 1, zh: "要,请帮我打包。", vi: "Có, xin đóng gói giúp tôi." },
    ],
  },
  "funfair": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 1, zh: "请问摩天轮在哪儿?", vi: "Xin hỏi vòng quay khổng lồ ở đâu?" },
      { who: 0, zh: "在前面,买票就可以坐。", vi: "Ở phía trước, mua vé là ngồi được." },
      { who: 1, zh: "我也想玩过山车。", vi: "Tôi cũng muốn chơi tàu lượn." },
      { who: 0, zh: "好的,晚上还有烟花。", vi: "Được, buổi tối còn có pháo hoa." },
    ],
  },
  "farm": {
    speakers: ["Chủ trại", "Khách"],
    lines: [
      { who: 0, zh: "欢迎来农场!你想看什么?", vi: "Chào mừng đến nông trại! Bạn muốn xem gì?" },
      { who: 1, zh: "我想看看奶牛和绵羊。", vi: "Tôi muốn xem bò sữa và cừu." },
      { who: 0, zh: "它们在篱笆里,请别喂它们。", vi: "Chúng ở trong hàng rào, xin đừng cho chúng ăn." },
      { who: 1, zh: "好的,这里空气真好。", vi: "Vâng, ở đây không khí thật trong lành." },
    ],
  },
  "laundry": {
    speakers: ["Thợ giặt", "Khách"],
    lines: [
      { who: 1, zh: "这件外套能洗干净吗?", vi: "Chiếc áo khoác này giặt sạch được không?" },
      { who: 0, zh: "可以,请先把衬衫也给我。", vi: "Được, xin đưa luôn cho tôi cả áo sơ mi." },
      { who: 1, zh: "什么时候可以来取?", vi: "Khi nào có thể đến lấy?" },
      { who: 0, zh: "明天下午。", vi: "Chiều mai." },
    ],
  },
  "toyshop": {
    speakers: ["Chủ tiệm", "Khách"],
    lines: [
      { who: 1, zh: "这个玩具多少钱?", vi: "Món đồ chơi này bao nhiêu tiền?" },
      { who: 0, zh: "六十块,这是给孩子的好礼物。", vi: "Sáu mươi tệ, đây là món quà tốt cho trẻ." },
      { who: 1, zh: "我想送给我弟弟。", vi: "Tôi muốn tặng em trai tôi." },
      { who: 0, zh: "好,我帮你包装一下。", vi: "Được, tôi gói giúp bạn." },
    ],
  },
  "police": {
    speakers: ["Cảnh sát", "Người dân"],
    lines: [
      { who: 1, zh: "我要报警,我的钱包丢了。", vi: "Tôi muốn báo cảnh sát, ví của tôi bị mất." },
      { who: 0, zh: "请出示您的证件。", vi: "Xin xuất trình giấy tờ của ông." },
      { who: 1, zh: "这是我的证件。", vi: "Đây là giấy tờ của tôi." },
      { who: 0, zh: "请把你看到的告诉我,我来写笔录。", vi: "Xin kể những gì ông thấy, tôi sẽ ghi biên bản." },
    ],
  },
  "subway": {
    speakers: ["Nhân viên", "Hành khách"],
    lines: [
      { who: 1, zh: "请问怎么去人民广场?", vi: "Xin hỏi đi đến Quảng trường Nhân Dân thế nào?" },
      { who: 0, zh: "坐三号线,在下一站换乘。", vi: "Đi tuyến ba, đổi tuyến ở ga tiếp theo." },
      { who: 1, zh: "地铁站的出口在哪儿?", vi: "Lối ra của ga ở đâu?" },
      { who: 0, zh: "上扶梯就是二号出口。", vi: "Lên thang cuốn là lối ra số hai." },
    ],
  },
  "camping": {
    speakers: ["Kiểm lâm", "Du khách"],
    lines: [
      { who: 1, zh: "我们可以在这里生火吗?", vi: "Chúng tôi có thể nhóm lửa ở đây không?" },
      { who: 0, zh: "可以,但是要小心火柴。", vi: "Được, nhưng phải cẩn thận với diêm." },
      { who: 1, zh: "晚上太黑,我有手电筒。", vi: "Buổi tối rất tối, tôi có đèn pin." },
      { who: 0, zh: "别忘了带指南针,山里容易迷路。", vi: "Đừng quên mang la bàn, trong núi dễ lạc đường." },
    ],
  },
  "lab": {
    speakers: ["Thầy giáo", "Học sinh"],
    lines: [
      { who: 0, zh: "做实验要戴上护目镜。", vi: "Làm thí nghiệm phải đeo kính bảo hộ." },
      { who: 1, zh: "好的,老师。试管放在哪儿?", vi: "Vâng thưa thầy. Ống nghiệm để ở đâu?" },
      { who: 0, zh: "放在桌子上,小心酒精灯。", vi: "Để trên bàn, cẩn thận đèn cồn." },
      { who: 1, zh: "我知道了,谢谢老师。", vi: "Em biết rồi, cảm ơn thầy." },
    ],
  },
  "cafe": {
    speakers: ["Nhân viên", "Khách"],
    lines: [
      { who: 0, zh: "欢迎光临!请问喝点什么?", vi: "Chào mừng quý khách! Bạn uống gì ạ?" },
      { who: 1, zh: "我要一杯热拿铁,不要糖浆。", vi: "Cho tôi một ly latte nóng, không siro." },
      { who: 0, zh: "好的,在这儿喝还是外带?", vi: "Vâng, uống tại đây hay mang đi?" },
      { who: 1, zh: "外带,谢谢。再来一块提拉米苏。", vi: "Mang đi, cảm ơn. Thêm một miếng tiramisu nữa." },
    ],
  },
  "bookstore": {
    speakers: ["Chủ tiệm", "Khách"],
    lines: [
      { who: 1, zh: "请问有没有适合小朋友的童话?", vi: "Xin hỏi có truyện cổ tích nào hợp với trẻ nhỏ không?" },
      { who: 0, zh: "有,在旋转书架那边。", vi: "Có, ở chỗ giá sách xoay kia." },
      { who: 1, zh: "这本多少钱?", vi: "Cuốn này bao nhiêu tiền?" },
      { who: 0, zh: "三十块,请到收银台付钱。", vi: "Ba mươi tệ, xin ra quầy thu ngân thanh toán." },
    ],
  },
  "pool": {
    speakers: ["Huấn luyện viên", "Học viên"],
    lines: [
      { who: 0, zh: "下水以前,先戴好泳帽和泳镜。", vi: "Trước khi xuống nước, hãy đội mũ và đeo kính bơi." },
      { who: 1, zh: "我不会游,可以用浮板吗?", vi: "Em chưa biết bơi, em dùng phao tập bơi được không?" },
      { who: 0, zh: "可以,抱着浮板慢慢打水。", vi: "Được, ôm phao rồi từ từ đạp nước." },
      { who: 1, zh: "好的,谢谢教练。", vi: "Vâng, cảm ơn huấn luyện viên." },
    ],
  },
  "firestation": {
    speakers: ["Lính cứu hỏa", "Học sinh"],
    lines: [
      { who: 1, zh: "着火了应该怎么办?", vi: "Khi cháy thì phải làm sao?" },
      { who: 0, zh: "先打电话,再用湿毛巾捂住鼻子。", vi: "Gọi điện trước, rồi dùng khăn ướt bịt mũi." },
      { who: 1, zh: "可以乘电梯下楼吗?", vi: "Có đi thang máy xuống được không?" },
      { who: 0, zh: "不可以,要走楼梯。", vi: "Không được, phải đi cầu thang." },
    ],
  },
  "datacenter": {
    speakers: ["Quản trị viên", "Nhân viên"],
    lines: [
      { who: 1, zh: "网络又断了,怎么办?", vi: "Mạng lại đứt rồi, làm sao đây?" },
      { who: 0, zh: "先看看网线和交换机。", vi: "Hãy xem cáp mạng và bộ chuyển mạch trước." },
      { who: 1, zh: "服务器的灯是红色的。", vi: "Đèn của máy chủ màu đỏ." },
      { who: 0, zh: "别怕,我们有备份。", vi: "Đừng sợ, chúng ta có bản sao lưu." },
    ],
  },
  "devroom": {
    speakers: ["Đồng nghiệp", "Lập trình viên"],
    lines: [
      { who: 0, zh: "你的程序测试过了吗?", vi: "Chương trình của bạn kiểm thử chưa?" },
      { who: 1, zh: "测试过了,可是还有一个漏洞。", vi: "Kiểm thử rồi, nhưng còn một lỗi." },
      { who: 0, zh: "那就先别发布新版本。", vi: "Vậy tạm thời đừng phát hành phiên bản mới." },
      { who: 1, zh: "好的,我现在就修。", vi: "Vâng, tôi sửa ngay bây giờ." },
    ],
  },
  "ailab": {
    speakers: ["Nhà nghiên cứu", "Sinh viên"],
    lines: [
      { who: 1, zh: "这个模型是怎么学会说话的?", vi: "Mô hình này học nói bằng cách nào?" },
      { who: 0, zh: "我们给它很多数据,让它不停地训练。", vi: "Chúng tôi cho nó rất nhiều dữ liệu và để nó liên tục luyện tập." },
      { who: 1, zh: "它的回答都是对的吗?", vi: "Câu trả lời của nó đều đúng sao?" },
      { who: 0, zh: "不一定,所以我们要自己检查。", vi: "Chưa chắc, nên chúng ta phải tự kiểm tra." },
    ],
  },
  "port": {
    speakers: ["Điều phối viên", "Khách hàng"],
    lines: [
      { who: 1, zh: "我的货到了吗?", vi: "Hàng của tôi đã đến chưa?" },
      { who: 0, zh: "到了,请先交关税。", vi: "Đến rồi, xin nộp thuế quan trước." },
      { who: 1, zh: "报关单我已经填好了。", vi: "Tờ khai hải quan tôi đã điền xong." },
      { who: 0, zh: "好,拿提单来提货吧。", vi: "Được, mang vận đơn đến nhận hàng nhé." },
    ],
  },
  "greenhouse": {
    speakers: ["Kỹ sư", "Nông dân"],
    lines: [
      { who: 1, zh: "今天温室里太热了。", vi: "Hôm nay trong nhà kính nóng quá." },
      { who: 0, zh: "那就拉上遮阳网,再开一开滴灌。", vi: "Vậy kéo lưới che nắng lại, rồi bật tưới nhỏ giọt." },
      { who: 1, zh: "番茄的种苗要不要施肥料?", vi: "Cây giống cà chua có cần bón phân không?" },
      { who: 0, zh: "现在不用,过一个星期再说。", vi: "Bây giờ chưa cần, một tuần nữa hãy tính." },
    ],
  },
};
