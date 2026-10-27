import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện của tiệm thú cưng, tiệm may, tiệm ảnh, phòng khám nha khoa và công trường. */
export const DAILY_SERVICES_STORIES: Record<string, SceneStory> = {
  petshop: story(["给小狗买东西", "Mua đồ cho chú chó"], [
    ["周末,小美带着宠物包来到宠物店。", "Cuối tuần, Tiểu Mỹ mang túi vận chuyển đến tiệm thú cưng."],
    ["她想给新来的小狗买一个项圈。", "Cô muốn mua cho chú chó mới một chiếc vòng cổ."],
    ["店员又拿来一条牵引绳,还有一袋狗粮。", "Nhân viên lại lấy thêm một sợi dây dắt và một túi thức ăn cho chó."],
    ["小美看见了鱼缸,里面的金鱼很漂亮。", "Tiểu Mỹ nhìn thấy bể cá, cá vàng trong đó rất đẹp."],
    ["她也买了一点鱼食,准备送给弟弟。", "Cô cũng mua một ít thức ăn cho cá, định tặng em trai."],
    ["仓鼠在笼子里跑,小猫跳上猫爬架。", "Chuột hamster chạy trong lồng, mèo con nhảy lên cây leo."],
    ["店员用逗猫棒逗小猫,又换了猫砂。", "Nhân viên dùng cần câu chọc mèo, rồi thay cát vệ sinh."],
    ["小美把食盆也放进包里,开心地回家了。", "Tiểu Mỹ cho cả bát ăn vào túi, vui vẻ về nhà."],
  ], ["Tiểu Mỹ mang gì đến tiệm?", "她带着宠物包。", "她带着鱼缸。", "她带着猫爬架。"]),

  tailor: story(["改一条裤子", "Sửa một chiếc quần"], [
    ["小李的裤子太长了,他来裁缝店改裤子。", "Quần của Tiểu Lý quá dài, anh đến tiệm may để sửa."],
    ["裁缝先用软尺量了一量,又用画粉做记号。", "Thợ may đo bằng thước dây trước, rồi dùng phấn may đánh dấu."],
    ["小李到试衣间里试了试,裤子还是有点儿长。", "Tiểu Lý vào phòng thử đồ mặc thử, quần vẫn hơi dài."],
    ["裁缝拿出缝衣针和缝线,手上戴着顶针。", "Thợ may lấy kim và chỉ ra, trên tay đeo cái đê."],
    ["拉链坏了,她又换了一条新的。", "Khóa kéo bị hỏng, bà lại thay một cái mới."],
    ["旁边的人台上,挂着一件用新布料做的衣服。", "Trên ma-nơ-canh bên cạnh treo một bộ đồ may bằng vải mới."],
    ["她打开针线盒,把纽扣也钉好了。", "Cô mở hộp kim chỉ, đính luôn cả cúc áo."],
    ["下午,小李穿上改好的裤子,很合适。", "Buổi chiều, Tiểu Lý mặc chiếc quần đã sửa, rất vừa."],
  ], ["Thợ may dùng gì để đo?", "她用软尺量。", "她用画粉量。", "她用缝纫机量。"]),

  photostudio: story(["拍一张证件照", "Chụp một tấm ảnh thẻ"], [
    ["小王要办护照,来照相馆拍证件照。", "Tiểu Vương cần làm hộ chiếu, đến tiệm ảnh chụp ảnh thẻ."],
    ["摄影师请他坐在蓝色的背景布前面。", "Thợ ảnh mời anh ngồi trước tấm phông nền màu xanh."],
    ["相机放在三脚架上,镜头对着小王。", "Máy ảnh đặt trên chân máy, ống kính hướng về Tiểu Vương."],
    ["助手打开柔光箱,又举起反光板。", "Trợ lý bật hộp tản sáng, rồi giơ tấm hắt sáng lên."],
    ["闪光灯一亮,证件照拍好了。", "Đèn flash vừa sáng, ảnh thẻ đã chụp xong."],
    ["小王看见摄影师的单反相机,也想拍一张全家福。", "Tiểu Vương thấy chiếc máy ảnh DSLR của thợ ảnh, cũng muốn chụp một tấm ảnh gia đình."],
    ["摄影师说:“先洗相纸,你可以看看相册。”", "Thợ ảnh nói: “Cứ in giấy ảnh trước, bạn có thể xem album.”"],
    ["小王拿着新洗的证件照,很满意。", "Tiểu Vương cầm tấm ảnh thẻ mới in, rất hài lòng."],
  ], ["Tiểu Vương đến tiệm làm gì?", "他来拍证件照。", "他来买相机。", "他来修相框。"]),

  dental: story(["第一次看牙", "Lần đầu đi khám răng"], [
    ["小朋友的牙齿有点疼,妈妈带他去看牙。", "Răng của bé hơi đau, mẹ đưa bé đi khám răng."],
    ["医生请他躺在牙科椅上,打开了无影灯。", "Bác sĩ mời bé nằm lên ghế nha khoa, bật đèn không bóng."],
    ["她用口镜看了看,又拍了一张牙片。", "Bà dùng gương nha khoa xem, rồi chụp một tấm phim răng."],
    ["医生说:“你有一颗牙要补,不用害怕。”", "Bác sĩ nói: “Em có một chiếc răng cần trám, đừng sợ.”"],
    ["器械盘里放着牙钻,声音有点吵。", "Trong khay dụng cụ có mũi khoan răng, tiếng hơi ồn."],
    ["补完以后,他用漱口杯漱了口。", "Trám xong, bé dùng cốc súc miệng súc miệng."],
    ["医生又教他用牙刷和牙膏,还有牙线。", "Bác sĩ lại dạy bé dùng bàn chải, kem đánh răng và cả chỉ nha khoa."],
    ["他的哥哥在旁边,笑着说自己也戴过牙套。", "Anh trai bé ở bên cạnh, cười nói mình cũng từng đeo niềng răng."],
  ], ["Bác sĩ dùng gì xem răng?", "她用口镜看牙。", "她用牙刷看牙。", "她用漱口杯看牙。"]),

  construction: story(["工地的一天", "Một ngày ở công trường"], [
    ["早上,工人们戴上安全帽,穿上反光衣。", "Buổi sáng, công nhân đội mũ bảo hộ, mặc áo phản quang."],
    ["工头拿着图纸,告诉大家今天做什么。", "Đốc công cầm bản vẽ, nói với mọi người hôm nay làm gì."],
    ["挖掘机在挖地基,搅拌机一直在转。", "Máy xúc đang đào móng, máy trộn bê tông quay không ngừng."],
    ["有人用铁锹铲水泥,有人搬砖头。", "Có người dùng xẻng xúc xi măng, có người bê gạch."],
    ["钢筋放好以后,工人爬上脚手架。", "Sau khi đặt xong thép, công nhân leo lên giàn giáo."],
    ["他用卷尺量了量,又用水平仪看墙直不直。", "Anh dùng thước cuộn đo, rồi dùng thước thủy xem tường có thẳng không."],
    ["中午太阳很大,大家在树下休息。", "Trưa nắng gắt, mọi người nghỉ dưới gốc cây."],
    ["晚上,新盖的一层楼终于做好了。", "Buổi tối, tầng nhà mới xây cuối cùng đã xong."],
  ], ["Ai cầm bản vẽ?", "工头拿着图纸。", "工人拿着挖掘机。", "客人拿着图纸。"]),
};
