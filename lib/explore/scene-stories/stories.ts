import { NEW_VENUE_STORIES } from "./stories-new-venues";
import { VENUES_2_STORIES } from "./stories-venues-2";
import { PLACE_FUN_STORIES } from "./stories-places-fun";
import { SERVICE_STORIES } from "./stories-services";
import { TRAVEL_FOOD_STORIES } from "./stories-travel-food";
import type { SceneStory } from "./story-types";

/** Truyện của từng cảnh (đủ mọi cảnh). Mọi truyện phải dùng gần hết từ của cảnh (có test kiểm tra). */
export const SCENE_STORIES: Record<string, SceneStory> = {
  ...TRAVEL_FOOD_STORIES,
  ...SERVICE_STORIES,
  ...PLACE_FUN_STORIES,
  ...NEW_VENUE_STORIES,
  ...VENUES_2_STORIES,
  restaurant: {
    title: { zh: "小明的第一碗面", vi: "Bát mì đầu tiên của Tiểu Minh" },
    lines: [
      { zh: "小明和妈妈去饭馆吃饭。", vi: "Tiểu Minh và mẹ đến quán ăn." },
      { zh: "服务员给他们一份菜单。", vi: "Nhân viên đưa cho họ một tờ thực đơn." },
      { zh: "妈妈要了饺子和米饭,小明要了一碗面条。", vi: "Mẹ gọi sủi cảo và cơm, Tiểu Minh gọi một bát mì." },
      { zh: "服务员拿来了茶壶,给他们倒茶。", vi: "Nhân viên mang ấm trà đến, rót trà cho họ." },
      { zh: "小明用筷子吃面条,可是面条太滑了。", vi: "Tiểu Minh dùng đũa ăn mì, nhưng mì trơn quá." },
      { zh: "他换了勺子,又喝了一口汤。", vi: "Cậu đổi sang cái thìa, rồi uống thêm một ngụm canh." },
      { zh: "妈妈把盘子里的饺子分给他一半。", vi: "Mẹ chia cho cậu một nửa chỗ sủi cảo trong đĩa." },
      { zh: "吃完饭,小明用餐巾擦了擦嘴。", vi: "Ăn xong, Tiểu Minh dùng khăn ăn lau miệng." },
      { zh: "妈妈看了一下账单,说:“今天很开心!”", vi: "Mẹ xem qua hóa đơn rồi nói: “Hôm nay rất vui!”" },
    ],
    question: { vi: "Tiểu Minh gọi món gì?", right: "他要了一碗面条。", wrong: ["他要了饺子。", "他要了米饭。"] },
  },
  zoo: {
    title: { zh: "动物园的一天", vi: "Một ngày ở sở thú" },
    lines: [
      { zh: "星期六,小红和爸爸去动物园。", vi: "Thứ bảy, Tiểu Hồng và bố đi sở thú." },
      { zh: "爸爸买了两张门票。", vi: "Bố mua hai tấm vé vào cửa." },
      { zh: "她先看见了一只大老虎,它在笼子里睡觉。", vi: "Cô bé thấy trước tiên một con hổ lớn, nó đang ngủ trong lồng." },
      { zh: "大象的鼻子很长,工作人员拿饲料给它吃。", vi: "Vòi voi rất dài, nhân viên lấy thức ăn cho nó ăn." },
      { zh: "猴子在树上跳来跳去,狮子在草地上休息。", vi: "Khỉ nhảy qua nhảy lại trên cây, sư tử nghỉ trên bãi cỏ." },
      { zh: "斑马身上有黑白条纹,企鹅走路摇摇摆摆。", vi: "Ngựa vằn có sọc đen trắng, chim cánh cụt đi lạch bạch." },
      { zh: "长颈鹿太高了,小红用望远镜才看清它的脸。", vi: "Hươu cao cổ cao quá, Tiểu Hồng phải dùng ống nhòm mới thấy rõ mặt nó." },
      { zh: "最后,她最喜欢的是可爱的熊猫。", vi: "Cuối cùng, cô bé thích nhất là chú gấu trúc đáng yêu." },
      { zh: "她对爸爸说:“我明天还想来!”", vi: "Cô bé nói với bố: “Ngày mai con còn muốn đến nữa!”" },
    ],
    question: { vi: "Tiểu Hồng thích con vật nào nhất?", right: "她最喜欢熊猫。", wrong: ["她最喜欢老虎。", "她最喜欢大象。"] },
  },
  garage: {
    title: { zh: "雨天的修车店", vi: "Tiệm sửa xe ngày mưa" },
    lines: [
      { zh: "下雨了,老张的汽车坏了。", vi: "Trời mưa, ô tô của bác Trương hỏng rồi." },
      { zh: "他把车开到修车店。", vi: "Bác lái xe tới tiệm sửa xe." },
      { zh: "师傅先看了看轮胎,说:“轮胎没气了。”", vi: "Thợ xem lốp trước, nói: “Lốp hết hơi rồi.”" },
      { zh: "他从工具箱里拿出扳手和螺丝刀。", vi: "Anh lấy cờ lê và tua vít từ hộp dụng cụ ra." },
      { zh: "一颗螺丝掉了,师傅用锤子和钳子把它装好。", vi: "Một con ốc vít rơi mất, thợ dùng búa và kìm lắp nó lại." },
      { zh: "他用千斤顶把车顶起来,又换了机油。", vi: "Anh dùng kích nâng xe lên, rồi thay dầu máy." },
      { zh: "老张坐在车里,双手握着方向盘。", vi: "Bác Trương ngồi trong xe, hai tay nắm vô lăng." },
      { zh: "师傅笑着说:“骑摩托车的时候,一定要戴头盔。”", vi: "Thợ cười nói: “Khi đi xe máy nhất định phải đội mũ bảo hiểm.”" },
      { zh: "车修好了,老张开心地回家了。", vi: "Xe sửa xong, bác Trương vui vẻ về nhà." },
    ],
    question: { vi: "Lúc đầu xe của bác Trương bị gì?", right: "轮胎没气了。", wrong: ["方向盘坏了。", "机油没有了。"] },
  },
  room: {
    title: { zh: "我的小房间", vi: "Căn phòng nhỏ của tôi" },
    lines: [
      { zh: "早上,闹钟响了。", vi: "Buổi sáng, đồng hồ báo thức reo." },
      { zh: "我从床上坐起来,枕头掉在地上了。", vi: "Tôi ngồi dậy khỏi giường, cái gối rơi xuống đất." },
      { zh: "我拉开窗户,看见一朵花开了。", vi: "Tôi kéo cửa sổ ra, thấy một bông hoa đã nở." },
      { zh: "小猫跳到桌子上,看着我。", vi: "Con mèo nhỏ nhảy lên bàn, nhìn tôi." },
      { zh: "桌子旁边有一把椅子,墙上有一个相框。", vi: "Cạnh bàn có một cái ghế, trên tường có một khung ảnh." },
      { zh: "我用遥控器打开电视。", vi: "Tôi dùng điều khiển bật ti vi." },
      { zh: "妈妈在门口说:“先吃个苹果吧!”", vi: "Mẹ nói ở cửa: “Ăn trước một quả táo đi!”" },
      { zh: "我吃完苹果,关了灯,走出房间。", vi: "Tôi ăn xong quả táo, tắt đèn rồi đi ra khỏi phòng." },
    ],
    question: { vi: "Mẹ bảo bạn nhỏ ăn gì?", right: "先吃个苹果。", wrong: ["先吃个面条。", "先吃个饺子。"] },
  },
};
