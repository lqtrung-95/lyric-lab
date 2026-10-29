import type { ReadingDef } from "./reading-types";

/** Viết gọn: đoạn là mảng câu [Hán, Việt]; câu hỏi là [hỏi, [3 đáp án], chỉ số đúng]. */
const story = (id: string, title: [string, string], emoji: string, paragraphs: [string, string][][], q: [string, [string, string, string], 0 | 1 | 2][]): ReadingDef => ({
  id, title: { zh: title[0], vi: title[1] }, emoji,
  paragraphs: paragraphs.map((p) => p.map(([zh, vi]) => ({ zh, vi }))),
  quiz: q.map(([qq, options, answer]) => ({ q: qq, options, answer })),
});

/** Truyện ngắn có cấp độ, tự viết, xếp từ dễ đến khó. Mỗi truyện chia đoạn để đọc như một bài văn. */
export const READINGS: ReadingDef[] = [
  story("kitten-friend", ["小猫找朋友", "Mèo con tìm bạn"], "🐱", [
    [
      ["小猫住在一个小房子里。", "Mèo con sống trong một ngôi nhà nhỏ."],
      ["它每天都一个人玩。", "Ngày nào nó cũng chơi một mình."],
      ["今天,它想找一个朋友。", "Hôm nay, nó muốn tìm một người bạn."],
    ],
    [
      ["它先去找小狗。", "Nó đi tìm chú chó con trước."],
      ["小狗说:“我正在吃饭,对不起。”", "Chó con nói: “Tôi đang ăn cơm, xin lỗi.”"],
      ["它又去找小鸟。", "Nó lại đi tìm chim nhỏ."],
      ["小鸟说:“来,我们一起唱歌吧!”", "Chim nhỏ nói: “Đến đây, chúng ta cùng hát nào!”"],
      ["小猫很高兴,它有朋友了。", "Mèo con rất vui, nó đã có bạn rồi."],
    ],
  ], [
    ["Hôm nay mèo con muốn làm gì?", ["Tìm một người bạn", "Đi học", "Bắt cá"], 0],
    ["Ai cùng hát với mèo con?", ["Chó con", "Chim nhỏ", "Mèo mẹ"], 1],
  ]),
  story("rainy-day", ["下雨了", "Trời mưa rồi"], "☔", [
    [
      ["今天早上,天气很好。", "Sáng nay thời tiết rất đẹp."],
      ["我没带伞就出门了。", "Tôi không mang ô mà ra khỏi nhà."],
      ["到了公司,外面突然下起大雨。", "Đến công ty, bên ngoài đột nhiên đổ mưa lớn."],
    ],
    [
      ["下班的时候,雨还没有停。", "Lúc tan làm, mưa vẫn chưa tạnh."],
      ["同事小王看见我,笑着说:“我们一起走吧。”", "Đồng nghiệp Tiểu Vương thấy tôi, cười nói: “Chúng ta cùng đi nhé.”"],
      ["我们走在一把伞下面,聊了很多。", "Chúng tôi đi chung dưới một chiếc ô, nói chuyện rất nhiều."],
      ["回到家,我的衣服有一点湿,可是心里很暖。", "Về đến nhà, quần áo tôi hơi ướt, nhưng trong lòng rất ấm."],
    ],
  ], [
    ["Vì sao người kể bị mắc mưa?", ["Quên chìa khóa", "Dậy muộn", "Không mang ô"], 2],
    ["Ai đã đi chung ô với người kể?", ["Ông chủ", "Đồng nghiệp Tiểu Vương", "Hàng xóm"], 1],
  ]),
  story("bowl-of-noodles", ["一碗面", "Một bát mì"], "🍜", [
    [
      ["我家附近有一家小面馆。", "Gần nhà tôi có một quán mì nhỏ."],
      ["老板是一位六十岁的爷爷,大家都叫他“王爷爷”。", "Ông chủ là một cụ ông sáu mươi tuổi, mọi người đều gọi là “ông Vương”."],
      ["他做的面不贵,味道却特别好。", "Mì ông làm không đắt, nhưng hương vị đặc biệt ngon."],
    ],
    [
      ["每次考试以前,我都去吃一碗。", "Mỗi lần trước kỳ thi, tôi đều đến ăn một bát."],
      ["王爷爷总是多放一个鸡蛋,说:“吃了有力气。”", "Ông Vương luôn cho thêm một quả trứng, nói: “Ăn vào có sức.”"],
    ],
    [
      ["后来我去外地工作,很久没有回家。", "Sau này tôi đi làm ở nơi khác, rất lâu không về nhà."],
      ["上个月回来,小面馆还在,爷爷也还记得我。", "Tháng trước về lại, quán mì vẫn còn, ông cũng vẫn nhớ tôi."],
    ],
  ], [
    ["Ông Vương luôn cho thêm gì vào bát mì?", ["Một quả trứng", "Một ít thịt", "Một chén trà"], 0],
    ["Người kể thường đến ăn mì vào lúc nào?", ["Lúc tan làm", "Trước kỳ thi", "Cuối tuần"], 1],
  ]),
  story("high-speed-rail", ["第一次坐高铁", "Lần đầu đi tàu cao tốc"], "🚄", [
    [
      ["周末,我第一次坐高铁去看奶奶。", "Cuối tuần, lần đầu tôi đi tàu cao tốc về thăm bà."],
      ["车站很大,人也很多,我找了很久才找到站台。", "Ga rất lớn, người cũng đông, tôi tìm mãi mới thấy sân ga."],
    ],
    [
      ["上车以后,我坐在窗户旁边。", "Lên tàu rồi, tôi ngồi cạnh cửa sổ."],
      ["火车开得又快又稳,外面的树和房子一下子就过去了。", "Tàu chạy vừa nhanh vừa êm, cây cối và nhà cửa bên ngoài vụt qua trong nháy mắt."],
      ["坐在我旁边的阿姨给了我一个苹果。", "Cô ngồi cạnh tôi cho tôi một quả táo."],
    ],
    [
      ["两个小时以后,我到了奶奶住的城市。", "Hai tiếng sau, tôi đến thành phố nơi bà sống."],
      ["奶奶在出口等我,她笑得很开心。", "Bà đợi tôi ở lối ra, bà cười rất vui."],
    ],
  ], [
    ["Người kể đi tàu để làm gì?", ["Đi làm", "Thăm bà", "Đi du lịch"], 1],
    ["Chuyến tàu kéo dài bao lâu?", ["Nửa tiếng", "Hai tiếng", "Cả ngày"], 1],
  ]),
  story("making-dumplings", ["学包饺子", "Học gói sủi cảo"], "🥟", [
    [
      ["春节快到了,妈妈说今年让我学包饺子。", "Tết sắp đến, mẹ bảo năm nay để tôi học gói sủi cảo."],
      ["她先教我和面,又教我怎么放肉。", "Mẹ dạy tôi nhào bột trước, rồi dạy tôi cách cho nhân thịt."],
    ],
    [
      ["我包的第一个饺子又大又丑,一煮就破了。", "Chiếc sủi cảo đầu tiên tôi gói vừa to vừa xấu, vừa nấu đã vỡ."],
      ["妈妈没有生气,只是笑着说:“别急,慢慢来。”", "Mẹ không giận, chỉ cười nói: “Đừng vội, từ từ thôi.”"],
      ["包到第二十个,我终于包好了。", "Gói đến cái thứ hai mươi, cuối cùng tôi đã gói được ra hình."],
    ],
    [
      ["晚上全家人一起吃饺子,爸爸说我包的最好吃。", "Tối cả nhà cùng ăn sủi cảo, bố nói cái tôi gói ngon nhất."],
      ["其实我知道,那是因为他爱我。", "Thật ra tôi biết, đó là vì bố thương tôi."],
    ],
  ], [
    ["Chiếc sủi cảo đầu tiên của người kể thế nào?", ["Vừa to vừa xấu, nấu là vỡ", "Nhỏ và rất đẹp", "Cháy khét"], 0],
    ["Phải gói đến cái thứ mấy mới ra hình?", ["Thứ hai", "Thứ mười", "Thứ hai mươi"], 2],
  ]),
  story("lost-phone", ["手机不见了", "Mất điện thoại"], "📱", [
    [
      ["昨天下班以后,我在地铁上发现手机不见了。", "Hôm qua sau giờ làm, tôi phát hiện trên tàu điện ngầm mất điện thoại."],
      ["我马上想起来,上车以前我还用它看过时间。", "Tôi lập tức nhớ ra, trước khi lên tàu tôi còn dùng nó xem giờ."],
      ["所以手机一定是在车上丢的。", "Vì vậy điện thoại chắc chắn đã mất trên tàu."],
    ],
    [
      ["我急得不知道怎么办,只好向旁边的人借手机,给自己的号码打电话。", "Tôi sốt ruột không biết làm sao, đành mượn điện thoại người bên cạnh gọi vào số của mình."],
      ["电话通了,可是没有人接。", "Gọi được nhưng không ai nghe."],
      ["我又打了一次,这一次,一个年轻的声音说:“你是手机的主人吧?”", "Tôi gọi lại, lần này một giọng trẻ nói: “Bạn là chủ chiếc điện thoại đúng không?”"],
    ],
    [
      ["原来他是一个大学生,在座位上捡到了手机,正在等我联系。", "Hóa ra bạn ấy là sinh viên, nhặt được điện thoại trên ghế và đang đợi tôi liên lạc."],
      ["我们约好在下一站见面。", "Chúng tôi hẹn gặp ở ga tiếp theo."],
      ["我想请他吃饭,他却摆摆手说:“这点小事,不用客气。”", "Tôi muốn mời bạn ấy ăn cơm, bạn lại xua tay nói: “Việc nhỏ này, không cần khách sáo.”"],
      ["那天晚上,我对这个城市的印象一下子变好了。", "Tối hôm đó, ấn tượng của tôi về thành phố này bỗng tốt hẳn lên."],
    ],
  ], [
    ["Người kể mất điện thoại ở đâu?", ["Ở công ty", "Trên tàu điện ngầm", "Ở nhà hàng"], 1],
    ["Người kể liên lạc lại với chiếc điện thoại bằng cách nào?", ["Mượn điện thoại người khác gọi vào số của mình", "Báo cảnh sát", "Nhờ đồng nghiệp tìm"], 0],
    ["Bạn sinh viên phản ứng thế nào khi được mời ăn cơm?", ["Nhận lời ngay", "Xua tay, nói không cần khách sáo", "Đòi tiền công"], 1],
  ]),
  story("renting-room", ["租房记", "Chuyện thuê nhà"], "🏠", [
    [
      ["我刚来上海工作的时候,最大的问题就是找房子。", "Lúc mới đến Thượng Hải làm việc, vấn đề lớn nhất là tìm nhà."],
      ["网上的房子看起来都很漂亮,可是真的去看,才发现照片和实际差得很远。", "Nhà trên mạng nhìn đều rất đẹp, nhưng đi xem thật mới phát hiện ảnh và thực tế khác xa."],
      ["有一套房子离公司很近,可是窗户对着墙,白天也要开灯。", "Có một căn rất gần công ty, nhưng cửa sổ đối diện bức tường, ban ngày cũng phải bật đèn."],
    ],
    [
      ["最后,我在一个老小区找到了一间小卧室。", "Cuối cùng, tôi tìm được một phòng ngủ nhỏ ở một khu chung cư cũ."],
      ["房东是一位退休的老师,她说只要我爱干净、不太吵,房租可以便宜两百块。", "Chủ nhà là một cô giáo đã nghỉ hưu, bà nói chỉ cần tôi sạch sẽ, không quá ồn thì tiền thuê có thể rẻ hơn hai trăm tệ."],
      ["我当然马上答应了。", "Tất nhiên tôi đồng ý ngay."],
    ],
    [
      ["住了半年以后,我才明白,好房东比好房子更重要。", "Ở được nửa năm, tôi mới hiểu: chủ nhà tốt quan trọng hơn nhà tốt."],
      ["下雨天,她会提醒我收衣服;我生病的时候,她还煮了粥给我。", "Ngày mưa, bà nhắc tôi thu quần áo; lúc tôi ốm, bà còn nấu cháo cho tôi."],
      ["现在我搬到了新的地方,但是每个春节,我都会回去看她。", "Giờ tôi đã chuyển đến chỗ mới, nhưng mỗi dịp Tết tôi đều quay lại thăm bà."],
    ],
  ], [
    ["Vấn đề lớn nhất của người kể lúc mới đến Thượng Hải là gì?", ["Tìm việc", "Tìm nhà", "Học tiếng"], 1],
    ["Căn nhà gần công ty có nhược điểm gì?", ["Quá đắt", "Quá ồn", "Cửa sổ đối diện tường nên phải bật đèn cả ngày"], 2],
    ["Cuối cùng người kể rút ra điều gì?", ["Chủ nhà tốt quan trọng hơn nhà tốt", "Nên thuê nhà gần công ty", "Không nên tin ảnh trên mạng"], 0],
  ]),
  story("diet-plan", ["减肥计划", "Kế hoạch giảm cân"], "🏃", [
    [
      ["新年的第一天,我给自己定了一个计划:一年内减十公斤。", "Ngày đầu năm mới, tôi đặt cho mình một kế hoạch: trong một năm giảm mười ký."],
      ["我下载了运动软件,买了新的跑鞋,还在冰箱上贴了一张“不许吃夜宵”的纸条。", "Tôi tải ứng dụng thể thao, mua giày chạy mới, còn dán lên tủ lạnh tờ giấy “cấm ăn khuya”."],
    ],
    [
      ["头两个星期,我每天早上六点起床跑步,感觉自己像换了一个人。", "Hai tuần đầu, mỗi sáng tôi dậy sáu giờ chạy bộ, cảm thấy như thành người khác."],
      ["可是到了第三个星期,天气变冷了,被子变得特别舒服。", "Nhưng đến tuần thứ ba, trời trở lạnh, chăn trở nên đặc biệt dễ chịu."],
      ["我对自己说:“就休息一天吧。”结果这一休息,就是一个月。", "Tôi tự nhủ: “Nghỉ một ngày thôi.” Kết quả nghỉ một cái là cả tháng."],
    ],
    [
      ["后来,同事小李邀请我一起去爬山。", "Sau đó, đồng nghiệp Tiểu Lý rủ tôi cùng đi leo núi."],
      ["有了朋友陪着,我不再觉得运动是一件痛苦的事。", "Có bạn đi cùng, tôi không còn thấy tập thể dục là chuyện khổ sở."],
      ["一年过去了,我只瘦了五公斤,不过我学会了一个道理:坚持比计划更重要。", "Một năm trôi qua, tôi chỉ giảm năm ký, nhưng tôi học được một đạo lý: kiên trì quan trọng hơn kế hoạch."],
    ],
  ], [
    ["Vì sao người kể ngừng chạy buổi sáng?", ["Bị đau chân", "Trời lạnh, chăn quá dễ chịu", "Phải đi công tác"], 1],
    ["Điều gì giúp người kể quay lại vận động?", ["Có bạn đi cùng", "Mua thêm giày mới", "Được tăng lương"], 0],
    ["Cuối năm người kể giảm được bao nhiêu?", ["Mười ký", "Hai ký", "Năm ký"], 2],
  ]),
  story("old-letter", ["一封旧信", "Một lá thư cũ"], "✉️", [
    [
      ["搬家的时候,我在书柜最下面发现了一封旧信。", "Lúc dọn nhà, tôi tìm thấy một lá thư cũ dưới cùng tủ sách."],
      ["信封已经发黄,上面的字却还很清楚,是十年前好朋友写给我的。", "Phong bì đã ngả vàng, nhưng chữ vẫn còn rõ, là thư bạn thân viết cho tôi mười năm trước."],
    ],
    [
      ["那一年,我们毕业了,各自去了不同的城市。", "Năm đó, chúng tôi tốt nghiệp, mỗi người đi một thành phố khác."],
      ["他在信里说:“不管将来变成什么样,我们都要记得今天的梦想。”", "Trong thư anh viết: “Dù sau này ra sao, chúng ta đều phải nhớ ước mơ của hôm nay.”"],
      ["可惜,工作越来越忙,我们的联系也越来越少。", "Tiếc là công việc ngày càng bận, liên lạc giữa chúng tôi cũng ngày càng ít."],
    ],
    [
      ["看完信,我犹豫了很久,还是拨通了他的电话。", "Đọc xong thư, tôi do dự rất lâu, rồi vẫn gọi cho anh."],
      ["电话那头沉默了几秒钟,然后传来熟悉的笑声:“你怎么突然想起我了?”", "Đầu dây im lặng vài giây, rồi vang lên tiếng cười quen thuộc: “Sao tự nhiên cậu nhớ ra mình vậy?”"],
      ["我们聊了整整两个小时,好像十年的时间从来没有存在过。", "Chúng tôi nói chuyện trọn hai tiếng, như thể mười năm chưa từng tồn tại."],
    ],
  ], [
    ["Người kể tìm thấy lá thư trong lúc nào?", ["Lúc dọn nhà", "Lúc đi làm", "Lúc đọc sách"], 0],
    ["Vì sao hai người ít liên lạc dần?", ["Giận nhau", "Công việc ngày càng bận", "Mất số điện thoại"], 1],
    ["Sau cuộc gọi, người kể cảm thấy thế nào?", ["Ngượng ngùng", "Như thể mười năm chưa từng tồn tại", "Hối hận vì đã gọi"], 1],
  ]),
];

export const findReading = (id: string): ReadingDef | undefined => READINGS.find((r) => r.id === id);
