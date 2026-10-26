import type { SceneDef } from "../explore-types";

/** Phòng tập thể hình: máy chạy bộ, tạ, thảm yoga. Câu ví dụ tự viết, đơn giản, dùng được khi tập luyện. */
export const GYM_SCENE: SceneDef = {
  id: "gym",
  title: "Phòng gym",
  subtitle: "Vào phòng tập, học từ về dụng cụ và tập luyện rồi làm nhiệm vụ cho Chú Chó huấn luyện viên.",
  theme: "gym",
  start: { x: 50, y: 95 },
  exits: [
    { sprite: "exitLeft", label: "Về Rạp chiếu phim", to: "cinema", x: 7, y: 60, w: 6 },
    { sprite: "exit", label: "Sang Hiệu cắt tóc", to: "salon", x: 92, y: 60, w: 6 },
  ],
  npc: {
    id: "dog", name: "Chú Chó PT", x: 88, y: 93, w: 11,
    greeting: "Chào mừng đến phòng gym! Hãy khởi động, lại gần dụng cụ rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Khởi động thêm nhé!",
  },
  phrases: [
    { zh: "我每周锻炼三次。", vi: "Mỗi tuần tôi tập ba lần." },
    { zh: "先热身五分钟。", vi: "Khởi động năm phút trước." },
    { zh: "再来一组,加油!", vi: "Thêm một hiệp nữa, cố lên!" },
    { zh: "我想减肥。", vi: "Tôi muốn giảm cân." },
  ],
  objects: [
    { id: "treadmill", term: "跑步机", gloss: "máy chạy bộ", example: { zh: "我在跑步机上跑步。", vi: "Tôi chạy trên máy chạy bộ." }, x: 24, y: 60, w: 16 },
    { id: "locker", term: "储物柜", gloss: "tủ để đồ", example: { zh: "衣服放在储物柜里。", vi: "Quần áo để trong tủ để đồ." }, x: 84, y: 50, w: 7 },
    { id: "punchingbag", term: "沙袋", gloss: "bao cát", example: { zh: "他在打沙袋。", vi: "Anh ấy đang đấm bao cát." }, x: 56, y: 56, w: 7 },
    { id: "barbell", term: "杠铃", gloss: "tạ đòn", example: { zh: "他举起了杠铃。", vi: "Anh ấy nâng tạ đòn lên." }, x: 78, y: 70, w: 16 },
    { id: "yogamat", term: "瑜伽垫", gloss: "thảm yoga", example: { zh: "请把瑜伽垫铺好。", vi: "Xin hãy trải thảm yoga ra." }, x: 62, y: 88, w: 16 },
    { id: "dumbbell", term: "哑铃", gloss: "tạ tay", portable: true, example: { zh: "我每天练习哑铃。", vi: "Mỗi ngày tôi tập tạ tay." }, x: 44, y: 74, w: 8 },
    { id: "jumprope", term: "跳绳", gloss: "dây nhảy", portable: true, example: { zh: "跳绳可以减肥。", vi: "Nhảy dây có thể giảm cân." }, x: 36, y: 86, w: 6 },
    { id: "headphones", term: "耳机", gloss: "tai nghe", portable: true, example: { zh: "跑步时我戴着耳机。", vi: "Khi chạy bộ tôi đeo tai nghe." }, x: 46, y: 94, w: 6 },
    { id: "waterbottle", term: "水瓶", gloss: "bình nước", portable: true, example: { zh: "运动时要带水瓶。", vi: "Khi tập phải mang theo bình nước." }, x: 28, y: 90, w: 3 },
    { id: "protein", term: "蛋白粉", gloss: "bột protein", portable: true, example: { zh: "练完以后喝一杯蛋白粉。", vi: "Tập xong uống một ly bột protein." }, x: 14, y: 92, w: 5 },
    { id: "bodyscale", term: "体重秤", gloss: "cân sức khỏe", portable: true, example: { zh: "请站在体重秤上。", vi: "Xin hãy đứng lên cân sức khỏe." }, x: 78, y: 84, w: 6 },
    { id: "gymclothes", term: "运动服", gloss: "đồ tập", portable: true, example: { zh: "我换上了运动服。", vi: "Tôi đã thay đồ tập." }, x: 12, y: 74, w: 7 },
  ],
};
