import type { ReadingDef } from "./reading-types";

/** Viết gọn: câu là [Hán, Việt]; câu hỏi là [hỏi, [3 đáp án], chỉ số đúng]. */
const story = (id: string, title: [string, string], emoji: string, s: [string, string][], q: [string, [string, string, string], 0 | 1 | 2][]): ReadingDef => ({
  id, title: { zh: title[0], vi: title[1] }, emoji,
  sentences: s.map(([zh, vi]) => ({ zh, vi })),
  quiz: q.map(([qq, options, answer]) => ({ q: qq, options, answer })),
});

/** Truyện ngắn có cấp độ, tự viết, xếp từ dễ đến khó. */
export const READINGS: ReadingDef[] = [
  story("kitten-friend", ["小猫找朋友", "Mèo con tìm bạn"], "🐱", [
    ["小猫住在一个小房子里。", "Mèo con sống trong một ngôi nhà nhỏ."],
    ["它每天都一个人玩。", "Ngày nào nó cũng chơi một mình."],
    ["今天,它想找一个朋友。", "Hôm nay, nó muốn tìm một người bạn."],
    ["它先去找小狗。", "Nó đi tìm chú chó con trước."],
    ["小狗说:“我正在吃饭,对不起。”", "Chó con nói: “Tôi đang ăn cơm, xin lỗi.”"],
    ["它又去找小鸟。", "Nó lại đi tìm chim nhỏ."],
    ["小鸟说:“来,我们一起唱歌吧!”", "Chim nhỏ nói: “Đến đây, chúng ta cùng hát nào!”"],
    ["小猫很高兴,它有朋友了。", "Mèo con rất vui, nó đã có bạn rồi."],
  ], [
    ["Hôm nay mèo con muốn làm gì?", ["Tìm một người bạn", "Đi học", "Bắt cá"], 0],
    ["Ai cùng hát với mèo con?", ["Chó con", "Chim nhỏ", "Mèo mẹ"], 1],
  ]),
  story("rainy-day", ["下雨了", "Trời mưa rồi"], "☔", [
    ["今天早上,天气很好。", "Sáng nay thời tiết rất đẹp."],
    ["我没带伞就出门了。", "Tôi không mang ô mà ra khỏi nhà."],
    ["到了公司,外面突然下起大雨。", "Đến công ty, bên ngoài đột nhiên đổ mưa lớn."],
    ["下班的时候,雨还没有停。", "Lúc tan làm, mưa vẫn chưa tạnh."],
    ["同事小王看见我,笑着说:“我们一起走吧。”", "Đồng nghiệp Tiểu Vương thấy tôi, cười nói: “Chúng ta cùng đi nhé.”"],
    ["我们走在一把伞下面,聊了很多。", "Chúng tôi đi chung dưới một chiếc ô, nói chuyện rất nhiều."],
    ["回到家,我的衣服有一点湿,可是心里很暖。", "Về đến nhà, quần áo tôi hơi ướt, nhưng trong lòng rất ấm."],
  ], [
    ["Vì sao người kể bị mắc mưa?", ["Quên chìa khóa", "Dậy muộn", "Không mang ô"], 2],
    ["Ai đã đi chung ô với người kể?", ["Ông chủ", "Đồng nghiệp Tiểu Vương", "Hàng xóm"], 1],
  ]),
  story("bowl-of-noodles", ["一碗面", "Một bát mì"], "🍜", [
    ["我家附近有一家小面馆。", "Gần nhà tôi có một quán mì nhỏ."],
    ["老板是一位六十岁的爷爷,大家都叫他“王爷爷”。", "Ông chủ là một cụ ông sáu mươi tuổi, mọi người đều gọi là “ông Vương”."],
    ["他做的面不贵,味道却特别好。", "Mì ông làm không đắt, nhưng hương vị đặc biệt ngon."],
    ["每次考试以前,我都去吃一碗。", "Mỗi lần trước kỳ thi, tôi đều đến ăn một bát."],
    ["王爷爷总是多放一个鸡蛋,说:“吃了有力气。”", "Ông Vương luôn cho thêm một quả trứng, nói: “Ăn vào có sức.”"],
    ["后来我去外地工作,很久没有回家。", "Sau này tôi đi làm ở nơi khác, rất lâu không về nhà."],
    ["上个月回来,小面馆还在,爷爷也还记得我。", "Tháng trước về lại, quán mì vẫn còn, ông cũng vẫn nhớ tôi."],
  ], [
    ["Ông Vương luôn cho thêm gì vào bát mì?", ["Một quả trứng", "Một ít thịt", "Một chén trà"], 0],
    ["Người kể thường đến ăn mì vào lúc nào?", ["Lúc tan làm", "Trước kỳ thi", "Cuối tuần"], 1],
  ]),
  story("high-speed-rail", ["第一次坐高铁", "Lần đầu đi tàu cao tốc"], "🚄", [
    ["周末,我第一次坐高铁去看奶奶。", "Cuối tuần, lần đầu tôi đi tàu cao tốc về thăm bà."],
    ["车站很大,人也很多,我找了很久才找到站台。", "Ga rất lớn, người cũng đông, tôi tìm mãi mới thấy sân ga."],
    ["上车以后,我坐在窗户旁边。", "Lên tàu rồi, tôi ngồi cạnh cửa sổ."],
    ["火车开得又快又稳,外面的树和房子一下子就过去了。", "Tàu chạy vừa nhanh vừa êm, cây cối và nhà cửa bên ngoài vụt qua trong nháy mắt."],
    ["坐在我旁边的阿姨给了我一个苹果。", "Cô ngồi cạnh tôi cho tôi một quả táo."],
    ["两个小时以后,我到了奶奶住的城市。", "Hai tiếng sau, tôi đến thành phố nơi bà sống."],
    ["奶奶在出口等我,她笑得很开心。", "Bà đợi tôi ở lối ra, bà cười rất vui."],
  ], [
    ["Người kể đi tàu để làm gì?", ["Đi làm", "Thăm bà", "Đi du lịch"], 1],
    ["Chuyến tàu kéo dài bao lâu?", ["Nửa tiếng", "Hai tiếng", "Cả ngày"], 1],
  ]),
  story("making-dumplings", ["学包饺子", "Học gói sủi cảo"], "🥟", [
    ["春节快到了,妈妈说今年让我学包饺子。", "Tết sắp đến, mẹ bảo năm nay để tôi học gói sủi cảo."],
    ["她先教我和面,又教我怎么放肉。", "Mẹ dạy tôi nhào bột trước, rồi dạy tôi cách cho nhân thịt."],
    ["我包的第一个饺子又大又丑,一煮就破了。", "Chiếc sủi cảo đầu tiên tôi gói vừa to vừa xấu, vừa nấu đã vỡ."],
    ["妈妈没有生气,只是笑着说:“别急,慢慢来。”", "Mẹ không giận, chỉ cười nói: “Đừng vội, từ từ thôi.”"],
    ["包到第二十个,我终于包好了。", "Gói đến cái thứ hai mươi, cuối cùng tôi đã gói được ra hình."],
    ["晚上全家人一起吃饺子,爸爸说我包的最好吃。", "Tối cả nhà cùng ăn sủi cảo, bố nói cái tôi gói ngon nhất."],
    ["其实我知道,那是因为他爱我。", "Thật ra tôi biết, đó là vì bố thương tôi."],
  ], [
    ["Chiếc sủi cảo đầu tiên của người kể thế nào?", ["Vừa to vừa xấu, nấu là vỡ", "Nhỏ và rất đẹp", "Cháy khét"], 0],
    ["Phải gói đến cái thứ mấy mới ra hình?", ["Thứ hai", "Thứ mười", "Thứ hai mươi"], 2],
  ]),
];

export const findReading = (id: string): ReadingDef | undefined => READINGS.find((r) => r.id === id);
