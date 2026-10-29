import type { Journey } from "./journeys";

/** Hành trình trong ngày: mỗi bước dẫn tới một cảnh với 3 từ mục tiêu (id vật trong cảnh). Câu hướng dẫn tự viết, dùng đủ 3 từ mục tiêu. */
export const JOURNEYS: Journey[] = [
  {
    id: "commute", emoji: "🏙️", title: { zh: "上班的一天", vi: "Một ngày đi làm" },
    blurb: "Từ lúc chuông báo thức reo đến khi tan làm: ngủ dậy, điểm tâm, tàu điện, văn phòng, cà phê.",
    steps: [
      { sceneId: "room", targets: ["alarmclock", "bed", "window"], zh: "早上闹钟响了,我从床上起来,打开窗户。", vi: "Sáng chuông báo thức reo, tôi ngủ dậy và mở cửa sổ." },
      { sceneId: "breakfast", targets: ["soymilk", "baozi", "youtiao"], zh: "出门前,我在早餐店买了豆浆、包子和油条。", vi: "Trước khi ra khỏi nhà, tôi mua sữa đậu nành, bánh bao và quẩy ở quán điểm tâm." },
      { sceneId: "subway", targets: ["transitcard", "platform", "subwaytrain"], zh: "我用交通卡进站,在站台上等地铁。", vi: "Tôi dùng thẻ giao thông vào ga, chờ tàu điện ngầm ở sân ga." },
      { sceneId: "office", targets: ["laptop", "document", "printer"], zh: "到了办公室,我打开电脑,用打印机打印文件。", vi: "Đến văn phòng, tôi mở máy tính, dùng máy in để in tài liệu." },
      { sceneId: "cafe", targets: ["latte", "espressomachine", "barcounter"], zh: "下班前,我在吧台点了一杯拿铁,咖啡机嗡嗡地响。", vi: "Trước giờ tan làm, tôi gọi một ly latte ở quầy bar, máy pha cà phê kêu ù ù." },
    ],
  },
  {
    id: "weekend", emoji: "🎉", title: { zh: "快乐的周末", vi: "Cuối tuần vui vẻ" },
    blurb: "Một ngày cuối tuần đủ cả: công viên, trà sữa, rạp phim, chợ đêm và hát karaoke.",
    steps: [
      { sceneId: "park", targets: ["kite", "bench", "picnicmat"], zh: "周末,我们在公园放风筝,累了就坐在长椅上,还铺开野餐垫。", vi: "Cuối tuần, chúng tôi thả diều ở công viên, mệt thì ngồi ghế dài và trải tấm thảm dã ngoại." },
      { sceneId: "bubbletea", targets: ["milktea", "pearls", "straw"], zh: "我点了一杯奶茶,加珍珠,还要一根吸管。", vi: "Tôi gọi một ly trà sữa, thêm trân châu và xin một cái ống hút." },
      { sceneId: "cinema", targets: ["movieticket", "popcorn", "screen"], zh: "拿着电影票进场,一边吃爆米花,一边看银幕。", vi: "Cầm vé xem phim vào rạp, vừa ăn bắp rang vừa nhìn màn hình lớn." },
      { sceneId: "nightmarket", targets: ["skewer", "tanghulu", "stringlights"], zh: "晚上逛夜市,彩灯下有烤串,还有糖葫芦。", vi: "Buổi tối đi chợ đêm, dưới ánh đèn màu có xiên nướng và mứt quả xiên." },
      { sceneId: "ktv", targets: ["ktvmic", "jukebox", "discoball"], zh: "最后去唱歌,在点歌机上点歌,拿起麦克风,灯球转了起来。", vi: "Cuối cùng đi hát, chọn bài trên máy chọn bài, cầm micro, quả cầu đèn xoay lên." },
    ],
  },
  {
    id: "tet", emoji: "🧧", title: { zh: "准备过年", vi: "Chuẩn bị đón Tết" },
    blurb: "Đi chợ, mua hoa, may áo mới, nấu cơm tất niên rồi trang hoàng nhà đón Tết.",
    steps: [
      { sceneId: "market", targets: ["fish", "meat", "fruit"], zh: "我去市场买鱼、肉和水果,准备过年。", vi: "Tôi ra chợ mua cá, thịt và trái cây để chuẩn bị đón Tết." },
      { sceneId: "flowershop", targets: ["lily", "bouquet", "flowerpot"], zh: "再去花店,买一个百合花束和一个花盆。", vi: "Rồi đến tiệm hoa, mua một bó hoa bách hợp và một chậu hoa." },
      { sceneId: "tailor", targets: ["fabric", "button", "zipper"], zh: "到裁缝店,选了红色的布料,挑了纽扣和拉链。", vi: "Đến tiệm may, chọn vải màu đỏ, chọn cúc áo và khóa kéo." },
      { sceneId: "kitchen", targets: ["pot", "knife", "cuttingboard"], zh: "回家准备年夜饭,拿出锅、刀和菜板。", vi: "Về nhà chuẩn bị bữa cơm tất niên, lấy nồi, dao và thớt ra." },
      { sceneId: "newyear", targets: ["redlantern", "couplets", "hongbao"], zh: "大年三十,挂红灯笼,贴春联,还要发红包。", vi: "Ngày ba mươi Tết, treo đèn lồng đỏ, dán câu đối và phát lì xì." },
    ],
  },
  {
    id: "trip", emoji: "✈️", title: { zh: "出门旅行", vi: "Chuyến đi xa" },
    blurb: "Từ nhà ga đến sân bay, khách sạn, bãi biển và bảo tàng trong một chuyến du lịch.",
    steps: [
      { sceneId: "station", targets: ["ticket", "signboard", "turnstile"], zh: "我拿着票,先看站牌,再走向检票口。", vi: "Tôi cầm vé, xem biển báo trước rồi đi tới cổng soát vé." },
      { sceneId: "airport", targets: ["passport", "suitcase", "boardingpass"], zh: "到了机场,我拿出护照,托运行李箱,领登机牌。", vi: "Đến sân bay, tôi lấy hộ chiếu ra, ký gửi vali và nhận thẻ lên máy bay." },
      { sceneId: "hotel", targets: ["roomcard", "elevator", "towel"], zh: "到了酒店,拿着房卡,坐电梯上楼,房间里有干净的毛巾。", vi: "Đến khách sạn, cầm thẻ phòng, đi thang máy lên lầu, trong phòng có khăn tắm sạch." },
      { sceneId: "beach", targets: ["parasol", "swimsuit", "shell"], zh: "第二天去海边,撑开太阳伞,换上泳衣,捡贝壳。", vi: "Hôm sau ra biển, mở dù che nắng, thay đồ bơi và nhặt vỏ sò." },
      { sceneId: "museum", targets: ["audioguide", "showcase", "fossil"], zh: "最后去博物馆,戴上讲解器,看展柜里的化石。", vi: "Cuối cùng đến bảo tàng, đeo máy thuyết minh, xem hóa thạch trong tủ trưng bày." },
    ],
  },
  {
    id: "health", emoji: "💪", title: { zh: "健康生活", vi: "Sống khỏe mỗi ngày" },
    blurb: "Tập gym, bơi lội, mua thuốc, khám Đông y và chăm sóc răng miệng.",
    steps: [
      { sceneId: "gym", targets: ["treadmill", "dumbbell", "yogamat"], zh: "我先在健身房跑步机上热身,再用哑铃,最后在瑜伽垫上拉伸。", vi: "Tôi khởi động trên máy chạy bộ ở phòng gym, rồi tập tạ tay, cuối cùng giãn cơ trên thảm yoga." },
      { sceneId: "pool", targets: ["swimcap", "swimgoggles", "bathtowel"], zh: "去游泳馆,戴上泳帽和泳镜,游完用浴巾擦干。", vi: "Đến hồ bơi, đội mũ bơi và đeo kính bơi, bơi xong dùng khăn tắm lau khô." },
      { sceneId: "pharmacy", targets: ["bandaid", "pills", "firstaid"], zh: "在药店买了创可贴、药片,还有一个急救箱。", vi: "Mua băng cá nhân, thuốc viên và một hộp sơ cứu ở hiệu thuốc." },
      { sceneId: "tcm", targets: ["pulsepillow", "herbs", "acuneedle"], zh: "去中医馆,手放在脉枕上,医生开了中药,还用银针治疗。", vi: "Đến phòng khám Đông y, đặt tay lên gối bắt mạch, thầy thuốc kê thuốc Đông y và châm cứu bằng kim bạc." },
      { sceneId: "dental", targets: ["toothbrush", "toothpaste", "floss"], zh: "最后去牙科诊所,医生建议用牙刷、牙膏和牙线。", vi: "Cuối cùng đến phòng khám nha khoa, bác sĩ khuyên dùng bàn chải, kem đánh răng và chỉ nha khoa." },
    ],
  },
];
