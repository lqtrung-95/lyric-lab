import type { SceneDef } from "../explore-types";

/** Quán hát karaoke: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const KTV_SCENE: SceneDef = {
  id: "ktv",
  title: "Quán hát karaoke",
  subtitle: "Vào quán hát karaoke cùng bạn bè, học từ về ca hát rồi làm nhiệm vụ cho Chú Sư tử ca sĩ.",
  theme: "ktv",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Trạm chuyển phát", to: "courier", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Nhà đón Tết", to: "newyear", x: 92, y: 60, w: 6 }],
  npc: {
    id: "lion", name: "Chú Sư tử ca sĩ", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến quán hát karaoke! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "这首歌我会唱。", vi: "Bài này tôi biết hát." },
    { zh: "声音太大了,小一点。", vi: "Tiếng to quá, nhỏ xuống chút." },
    { zh: "下一首轮到你了。", vi: "Bài tiếp theo đến lượt bạn." },
    { zh: "唱得真好听!", vi: "Hát hay quá!" },
  ],
  objects: [
    { id: "ktvmic", term: "麦克风", gloss: "micro", above: true, portable: true, example: { zh: "请把麦克风递给我。", vi: "Xin đưa micro cho tôi." }, x: 21, y: 48, w: 3.5, stand: { x: 21, y: 70 } },
    { id: "songbook", term: "歌单", gloss: "danh sách bài hát", above: true, portable: true, example: { zh: "你看一下歌单,想唱哪首?", vi: "Bạn xem danh sách bài hát, muốn hát bài nào?" }, x: 28, y: 48, w: 5.5, stand: { x: 28, y: 70 } },
    { id: "dice", term: "骰子", gloss: "xúc xắc", above: true, portable: true, example: { zh: "我们用骰子玩游戏吧。", vi: "Chúng ta chơi trò xúc xắc nhé." }, x: 35, y: 48, w: 5, stand: { x: 35, y: 70 } },
    { id: "fruitplate", term: "果盘", gloss: "đĩa trái cây", above: true, portable: true, example: { zh: "服务员送来一个大果盘。", vi: "Nhân viên mang đến một đĩa trái cây lớn." }, x: 41, y: 48, w: 7, stand: { x: 41, y: 70 } },
    { id: "maracas", term: "沙锤", gloss: "maracas (cặp quả lắc)", above: true, portable: true, example: { zh: "他一边唱一边摇沙锤。", vi: "Anh ấy vừa hát vừa lắc maracas." }, x: 60, y: 50, w: 5, stand: { x: 60, y: 74 } },
    { id: "glowstick", term: "荧光棒", gloss: "gậy phát sáng", above: true, portable: true, example: { zh: "大家挥着荧光棒一起唱。", vi: "Mọi người vẫy gậy phát sáng cùng hát." }, x: 67, y: 50, w: 4.5, stand: { x: 67, y: 74 } },
    { id: "tambourine", term: "铃鼓", gloss: "trống lắc tay", above: true, portable: true, example: { zh: "她拿起铃鼓打节拍。", vi: "Cô ấy cầm trống lắc gõ nhịp." }, x: 74, y: 50, w: 5.5, stand: { x: 74, y: 74 } },
    { id: "micstand", term: "话筒架", gloss: "giá micro", above: true, portable: true, example: { zh: "把话筒架调高一点。", vi: "Chỉnh giá micro cao lên một chút." }, x: 81, y: 50, w: 4, stand: { x: 81, y: 74 } },
    { id: "jukebox", term: "点歌机", gloss: "máy chọn bài hát", example: { zh: "点歌机上有很多新歌。", vi: "Trên máy chọn bài có nhiều bài mới." }, x: 44, y: 80, w: 9 },
    { id: "ktvspeaker", term: "音响", gloss: "dàn loa", example: { zh: "音响的声音太大了。", vi: "Tiếng dàn loa to quá." }, x: 56, y: 94, w: 8 },
    { id: "discoball", term: "灯球", gloss: "quả cầu đèn xoay", example: { zh: "灯球转起来,房间变得好漂亮。", vi: "Quả cầu đèn xoay lên, căn phòng đẹp hẳn." }, x: 84, y: 76, w: 7 },
    { id: "boothsofa", term: "卡座", gloss: "ghế sofa kiểu quầy", example: { zh: "我们坐在卡座上等朋友。", vi: "Chúng tôi ngồi trên ghế sofa chờ bạn." }, x: 30, y: 92, w: 16 },
  ],
};
