import type { SceneDef } from "../explore-types";

/** Cảnh đầu tiên: phòng của bạn. 14 vật quen thuộc, phần lớn từ HSK 1–2. Câu ví dụ tự viết, đơn giản, dùng ngay được. */
export const ROOM_SCENE: SceneDef = {
  id: "phong",
  title: "Phòng của bạn",
  subtitle: "Chạm vào từng vật để học từ mới, rồi nhận nhiệm vụ của Gấu Trúc.",
  guide: { name: "Gấu Trúc", greeting: "Chào bạn! Đây là phòng của bạn. Chạm vào mọi thứ để biết tên tiếng Trung của chúng nhé." },
  objects: [
    { id: "window", term: "窗户", gloss: "cửa sổ", example: { zh: "请打开窗户。", vi: "Xin hãy mở cửa sổ." }, x: 30, y: 27, w: 13 },
    { id: "tv", term: "电视", gloss: "ti vi", example: { zh: "我们看电视吧。", vi: "Chúng ta xem ti vi nhé." }, x: 56, y: 34, w: 11 },
    { id: "door", term: "门", gloss: "cửa ra vào", example: { zh: "请关门。", vi: "Xin hãy đóng cửa." }, x: 82, y: 36, w: 9 },
    { id: "lamp", term: "灯", gloss: "đèn", example: { zh: "请开灯。", vi: "Xin hãy bật đèn." }, x: 8, y: 46, w: 5 },
    { id: "bed", term: "床", gloss: "cái giường", example: { zh: "我的床很大。", vi: "Giường của tôi rất to." }, x: 20, y: 70, w: 22 },
    { id: "table", term: "桌子", gloss: "cái bàn", example: { zh: "桌子上有一本书。", vi: "Trên bàn có một quyển sách." }, x: 58, y: 76, w: 24 },
    { id: "book", above: true, term: "书", gloss: "sách", example: { zh: "我喜欢看书。", vi: "Tôi thích đọc sách." }, x: 50, y: 66, w: 6 },
    { id: "laptop", above: true, term: "电脑", gloss: "máy tính", example: { zh: "他在用电脑。", vi: "Anh ấy đang dùng máy tính." }, x: 58, y: 66, w: 7 },
    { id: "cup", above: true, term: "杯子", gloss: "cái cốc", example: { zh: "这个杯子很漂亮。", vi: "Cái cốc này rất đẹp." }, x: 65, y: 67, w: 4 },
    { id: "water", above: true, term: "水", gloss: "nước", example: { zh: "我想喝水。", vi: "Tôi muốn uống nước." }, x: 70, y: 67, w: 3 },
    { id: "chair", term: "椅子", gloss: "cái ghế", example: { zh: "请坐这把椅子。", vi: "Mời ngồi chiếc ghế này." }, x: 37, y: 86, w: 9 },
    { id: "cat", term: "猫", gloss: "con mèo", example: { zh: "那只猫很可爱。", vi: "Con mèo đó rất đáng yêu." }, x: 84, y: 84, w: 8 },
    { id: "flower", term: "花", gloss: "hoa", example: { zh: "这朵花很红。", vi: "Bông hoa này rất đỏ." }, x: 92, y: 68, w: 6 },
    { id: "apple", term: "苹果", gloss: "quả táo", example: { zh: "我要一个苹果。", vi: "Tôi muốn một quả táo." }, x: 73, y: 90, w: 4 },
  ],
};

export const SCENES: Record<string, SceneDef> = { [ROOM_SCENE.id]: ROOM_SCENE };
