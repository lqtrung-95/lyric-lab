/**
 * Kho "Hai thật một giả" (真话还是假话): mỗi vòng có ba câu tiếng Trung đơn giản về kiến thức đời sống, hai câu đúng và MỘT câu sai; người chơi tìm câu sai.
 * Tự viết, chỉ dùng kiến thức chắc chắn đúng/sai (không dựa vào ý kiến), câu ngắn ở cấp thấp. `lie` là câu sai, `explain` giải thích bằng tiếng Việt vì sao sai.
 */
export interface Statement { zh: string; vi: string }
export interface TruthRound { topic: string; truths: [Statement, Statement]; lie: Statement; explain: string }

const t = (zh: string, vi: string): Statement => ({ zh, vi });

export const TRUTH_ROUNDS: TruthRound[] = [
  { topic: "Trung Quốc", truths: [t("北京是中国的首都。", "Bắc Kinh là thủ đô của Trung Quốc."), t("长城在中国。", "Vạn Lý Trường Thành ở Trung Quốc.")], lie: t("上海是中国的首都。", "Thượng Hải là thủ đô của Trung Quốc."), explain: "Thủ đô của Trung Quốc là Bắc Kinh, còn Thượng Hải là thành phố lớn nhất." },
  { topic: "Việt Nam", truths: [t("河内是越南的首都。", "Hà Nội là thủ đô của Việt Nam."), t("越南在东南亚。", "Việt Nam ở Đông Nam Á.")], lie: t("越南的首都是胡志明市。", "Thủ đô của Việt Nam là Thành phố Hồ Chí Minh."), explain: "Thủ đô của Việt Nam là Hà Nội; Thành phố Hồ Chí Minh là thành phố đông dân nhất." },
  { topic: "Một tuần", truths: [t("一个星期有七天。", "Một tuần có bảy ngày."), t("星期五在星期六前面。", "Thứ sáu đứng trước thứ bảy.")], lie: t("星期三在星期一前面。", "Thứ tư đứng trước thứ hai."), explain: "Trong tuần, thứ hai đứng trước thứ tư." },
  { topic: "Một năm", truths: [t("一年有十二个月。", "Một năm có mười hai tháng."), t("二月比一月短。", "Tháng hai ngắn hơn tháng một.")], lie: t("一年有十个月。", "Một năm có mười tháng."), explain: "Một năm có mười hai tháng, không phải mười." },
  { topic: "Tính toán", truths: [t("三加四等于七。", "Ba cộng bốn bằng bảy."), t("十减五等于五。", "Mười trừ năm bằng năm.")], lie: t("二乘三等于八。", "Hai nhân ba bằng tám."), explain: "Hai nhân ba bằng sáu." },
  { topic: "Động vật", truths: [t("熊猫喜欢吃竹子。", "Gấu trúc thích ăn tre."), t("鱼住在水里。", "Cá sống trong nước.")], lie: t("大象比老鼠小。", "Voi nhỏ hơn chuột."), explain: "Voi to hơn chuột rất nhiều." },
  { topic: "Màu sắc", truths: [t("天空常常是蓝色的。", "Bầu trời thường có màu xanh."), t("香蕉是黄色的。", "Chuối màu vàng.")], lie: t("西瓜里面是蓝色的。", "Bên trong dưa hấu màu xanh dương."), explain: "Ruột dưa hấu màu đỏ." },
  { topic: "Ăn uống", truths: [t("米饭是用大米做的。", "Cơm được nấu từ gạo."), t("饺子是中国菜。", "Sủi cảo là món Trung Quốc.")], lie: t("面包是用大米做的。", "Bánh mì được làm từ gạo."), explain: "Bánh mì làm từ bột mì (面粉), không phải gạo." },
  { topic: "Thời gian", truths: [t("一小时有六十分钟。", "Một giờ có sáu mươi phút."), t("一天有二十四个小时。", "Một ngày có hai mươi bốn giờ.")], lie: t("一分钟有一百秒。", "Một phút có một trăm giây."), explain: "Một phút có sáu mươi giây." },
  { topic: "Cơ thể", truths: [t("我们用眼睛看东西。", "Chúng ta nhìn đồ vật bằng mắt."), t("我们用耳朵听声音。", "Chúng ta nghe âm thanh bằng tai.")], lie: t("我们用鼻子听声音。", "Chúng ta nghe âm thanh bằng mũi."), explain: "Nghe bằng tai (耳朵), mũi (鼻子) dùng để ngửi." },
  { topic: "Đi lại", truths: [t("飞机比火车快。", "Máy bay nhanh hơn tàu hỏa."), t("地铁在地下。", "Tàu điện ngầm chạy dưới lòng đất.")], lie: t("自行车比飞机快。", "Xe đạp nhanh hơn máy bay."), explain: "Máy bay nhanh hơn xe đạp rất nhiều." },
  { topic: "Thời tiết", truths: [t("冬天常常很冷。", "Mùa đông thường rất lạnh."), t("夏天的天气很热。", "Thời tiết mùa hè rất nóng.")], lie: t("下雪的时候天气很热。", "Lúc tuyết rơi thời tiết rất nóng."), explain: "Tuyết rơi khi trời rất lạnh." },
  { topic: "Gia đình", truths: [t("爸爸的妈妈是奶奶。", "Mẹ của bố là bà nội."), t("妈妈的爸爸是外公。", "Bố của mẹ là ông ngoại.")], lie: t("爸爸的爸爸是外公。", "Bố của bố là ông ngoại."), explain: "Bố của bố là ông nội (爷爷); 外公 là bố của mẹ." },
  { topic: "Nghề nghiệp", truths: [t("学生在学校学习。", "Học sinh học ở trường."), t("医生在医院工作。", "Bác sĩ làm việc ở bệnh viện.")], lie: t("老师在医院给人看病。", "Giáo viên khám bệnh cho người ở bệnh viện."), explain: "Người khám bệnh là bác sĩ (医生), giáo viên dạy ở trường." },
  { topic: "Thức ăn", truths: [t("苹果是水果。", "Táo là trái cây."), t("白菜是蔬菜。", "Cải thảo là rau.")], lie: t("牛肉是水果。", "Thịt bò là trái cây."), explain: "Thịt bò là thịt (肉), không phải trái cây." },
  { topic: "Lễ hội", truths: [t("中秋节要吃月饼。", "Tết Trung thu ăn bánh trung thu."), t("春节是中国的传统节日。", "Tết Nguyên đán là lễ truyền thống của Trung Quốc.")], lie: t("端午节在冬天。", "Tết Đoan Ngọ vào mùa đông."), explain: "Tết Đoan Ngọ rơi vào khoảng tháng sáu, giữa mùa hè." },
  { topic: "Địa lý", truths: [t("太阳从东边出来。", "Mặt trời mọc ở phía đông."), t("中国在亚洲。", "Trung Quốc ở châu Á.")], lie: t("中国在欧洲。", "Trung Quốc ở châu Âu."), explain: "Trung Quốc nằm ở châu Á." },
  { topic: "Đồ dùng", truths: [t("钱可以买东西。", "Có tiền thì mua được đồ."), t("手机可以打电话。", "Điện thoại gọi điện được.")], lie: t("雨伞是用来吃饭的。", "Ô dùng để ăn cơm."), explain: "Ô dùng để che mưa (挡雨), không phải để ăn." },
  { topic: "Tiền tệ", truths: [t("一块钱是十毛。", "Một tệ bằng mười hào."), t("一百块比十块多。", "Một trăm tệ nhiều hơn mười tệ.")], lie: t("十块比一百块多。", "Mười tệ nhiều hơn một trăm tệ."), explain: "Một trăm tệ nhiều hơn mười tệ." },
  { topic: "Tiếng Trung", truths: [t("汉语有四个声调。", "Tiếng Trung có bốn thanh điệu."), t("中国人说汉语。", "Người Trung Quốc nói tiếng Hán.")], lie: t("汉语没有声调。", "Tiếng Trung không có thanh điệu."), explain: "Tiếng Trung có bốn thanh điệu (cộng thanh nhẹ), và thanh điệu làm đổi nghĩa từ." },
  { topic: "Nhà bếp", truths: [t("我们用刀切菜。", "Chúng ta dùng dao thái rau."), t("冰箱里面很冷。", "Bên trong tủ lạnh rất lạnh.")], lie: t("冰箱是用来烧水的。", "Tủ lạnh dùng để đun nước."), explain: "Tủ lạnh dùng để giữ đồ lạnh; đun nước dùng ấm hoặc bếp." },
  { topic: "Bốn mùa", truths: [t("春天花开了。", "Mùa xuân hoa nở."), t("秋天叶子会变黄。", "Mùa thu lá chuyển vàng.")], lie: t("一年有五个季节。", "Một năm có năm mùa."), explain: "Một năm có bốn mùa: xuân, hạ, thu, đông." },
  { topic: "Thể thao", truths: [t("足球运动员用脚踢球。", "Cầu thủ bóng đá dùng chân đá bóng."), t("游泳要在水里。", "Bơi lội phải ở dưới nước.")], lie: t("打篮球不用球。", "Chơi bóng rổ không cần bóng."), explain: "Chơi bóng rổ cần có bóng." },
];
