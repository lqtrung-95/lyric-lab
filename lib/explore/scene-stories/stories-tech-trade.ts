import { story } from "./story-helper";
import type { SceneStory } from "./story-types";

/** Truyện của trung tâm dữ liệu, công ty phần mềm, phòng thí nghiệm AI, cảng xuất nhập khẩu và nhà kính. */
export const TECH_TRADE_STORIES: Record<string, SceneStory> = {
  datacenter: story(["机房里的一夜", "Một đêm trong phòng máy"], [
    ["夜里,机房的警报突然响了。", "Ban đêm, chuông báo trong phòng máy bỗng reo."],
    ["管理员小王走到机柜前,看了看显示器。", "Quản trị viên Tiểu Vương đến trước tủ rack, nhìn màn hình."],
    ["屏幕上写着:服务器连不上网。", "Trên màn hình ghi: máy chủ không kết nối được mạng."],
    ["他先检查网线,又看了看交换机,都没有问题。", "Anh kiểm tra cáp mạng trước, rồi xem bộ chuyển mạch, đều không sao."],
    ["原来是空调坏了,风扇转得太慢,机器太热。", "Hóa ra điều hòa hỏng, quạt quay quá chậm, máy quá nóng."],
    ["小王马上换了电源,又把重要的文件备份到硬盘里。", "Tiểu Vương lập tức thay nguồn điện, rồi sao lưu tệp quan trọng vào ổ cứng."],
    ["防火墙也没有被人攻击,他用新密码重新登录。", "Tường lửa cũng không bị tấn công, anh đăng nhập lại bằng mật khẩu mới."],
    ["天亮以前,所有的服务器都恢复正常了。", "Trước khi trời sáng, mọi máy chủ đã trở lại bình thường."],
  ], ["Vì sao máy chủ bị nóng?", "空调坏了,风扇转得太慢。", "网线断了。", "密码忘记了。"]),

  devroom: story(["发布前的一天", "Một ngày trước khi phát hành"], [
    ["小林刷了工牌,走到自己的工位。", "Tiểu Lâm quẹt thẻ nhân viên, đi đến chỗ ngồi của mình."],
    ["今天要发布软件的新版本。", "Hôm nay phải phát hành phiên bản mới của phần mềm."],
    ["会议室的投影仪上写着客户的新需求。", "Trên máy chiếu phòng họp ghi yêu cầu mới của khách hàng."],
    ["小林一边看文档,一边改代码。", "Tiểu Lâm vừa đọc tài liệu vừa sửa mã nguồn."],
    ["他运行程序,屏幕上突然出现一个红色的漏洞提示。", "Anh chạy chương trình, trên màn hình bỗng hiện một cảnh báo lỗi màu đỏ."],
    ["同事小周帮他做了一次测试,找到了问题。", "Đồng nghiệp Tiểu Chu giúp anh kiểm thử một lần, tìm ra vấn đề."],
    ["修好以后,他们又测试了一遍。", "Sửa xong, họ lại kiểm thử thêm một lượt."],
    ["晚上,新版本终于顺利发布了。", "Buổi tối, phiên bản mới cuối cùng đã phát hành suôn sẻ."],
  ], ["Cuối cùng chuyện gì xảy ra?", "新版本顺利发布了。", "新版本没有发布。", "小林换了工作。"]),

  ailab: story(["会学习的机器", "Cỗ máy biết học"], [
    ["实验室里放着一个会学习的模型。", "Trong phòng thí nghiệm có một mô hình biết học."],
    ["研究员给它很多数据,让它用新的算法训练。", "Nhà nghiên cứu cho nó rất nhiều dữ liệu, để nó huấn luyện bằng thuật toán mới."],
    ["训练的时候,显卡很热,芯片也跑得很快。", "Lúc huấn luyện, card đồ họa rất nóng, chip cũng chạy rất nhanh."],
    ["摄像头看见了桌子上的杯子。", "Camera nhìn thấy chiếc cốc trên bàn."],
    ["传感器告诉机械臂:杯子在左边。", "Cảm biến báo cho cánh tay robot: chiếc cốc ở bên trái."],
    ["机械臂拿起杯子,放到了触摸屏旁边。", "Cánh tay robot cầm cốc lên, đặt cạnh màn hình cảm ứng."],
    ["小李对语音助手说话,写了一个很清楚的提示词。", "Tiểu Lý nói với trợ lý giọng nói, đưa ra một câu lệnh rất rõ ràng."],
    ["无人机听懂了,就飞出去送了一份文件。", "Máy bay không người lái hiểu rồi, liền bay đi giao một tập tài liệu."],
  ], ["Cánh tay robot làm gì?", "机械臂拿起了杯子。", "机械臂写了一份文件。", "机械臂关了摄像头。"]),

  port: story(["一批进口的货", "Một lô hàng nhập khẩu"], [
    ["清晨,一艘货轮开进了码头。", "Sáng sớm, một chiếc tàu hàng tiến vào bến cảng."],
    ["起重机把一个个集装箱吊了下来。", "Cần cẩu nhấc từng container xuống."],
    ["老板要进口一批咖啡,先填好了报关单。", "Ông chủ muốn nhập khẩu một lô cà phê, đã điền xong tờ khai hải quan."],
    ["工作人员检查了提单,又打开样品看了看。", "Nhân viên kiểm tra vận đơn, lại mở hàng mẫu ra xem."],
    ["海关说这批货要交关税,老板也付了运费。", "Hải quan nói lô hàng phải nộp thuế quan, ông chủ cũng trả cước vận chuyển."],
    ["叉车把箱子运进仓库,放到货架上。", "Xe nâng chở thùng vào kho, đặt lên giá."],
    ["下午,客人来取货,看到咖啡豆很新鲜。", "Buổi chiều, khách đến nhận hàng, thấy hạt cà phê rất tươi."],
    ["老板笑着说:“进口生意真不容易!”", "Ông chủ cười nói: “Làm ăn nhập khẩu thật không dễ!”"],
  ], ["Ai chở hàng vào kho?", "叉车把箱子运进了仓库。", "起重机把箱子运进了仓库。", "货轮把箱子运进了仓库。"]),

  greenhouse: story(["温室里的早晨", "Buổi sáng trong nhà kính"], [
    ["早上,小兔检查了温室的薄膜和遮阳网。", "Buổi sáng, Bé Thỏ kiểm tra màng phủ và lưới che nắng của nhà kính."],
    ["她先看湿度计,湿度刚好。", "Cô xem ẩm kế trước, độ ẩm vừa đúng."],
    ["育苗盘里的种苗长高了,可以种到菜畦里了。", "Cây giống trong khay ươm đã cao, có thể trồng xuống luống rau."],
    ["她推着手推车,把肥料运到菜畦旁边。", "Cô đẩy xe đẩy tay, chở phân bón đến cạnh luống rau."],
    ["滴灌管一开,水就一滴一滴地流出来。", "Ống tưới nhỏ giọt vừa mở, nước chảy ra từng giọt một."],
    ["架子上的黄瓜又长又绿,番茄也快熟了。", "Dưa chuột trên giàn vừa dài vừa xanh, cà chua cũng sắp chín."],
    ["烂掉的菜叶,她都放进堆肥桶。", "Lá rau hỏng, cô đều bỏ vào thùng ủ phân."],
    ["中午,她摘了一篮番茄和黄瓜,开心地回家了。", "Buổi trưa, cô hái một giỏ cà chua và dưa chuột, vui vẻ về nhà."],
  ], ["Bé Thỏ chở phân bón bằng gì?", "她用手推车运肥料。", "她用滴灌管运肥料。", "她用育苗盘运肥料。"]),
};
