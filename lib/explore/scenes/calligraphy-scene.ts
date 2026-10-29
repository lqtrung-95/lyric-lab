import type { SceneDef } from "../explore-types";

/** Lớp thư pháp: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const CALLIGRAPHY_SCENE: SceneDef = {
  id: "calligraphy",
  title: "Lớp thư pháp",
  subtitle: "Vào lớp thư pháp, học từ về bút mực giấy nghiên rồi làm nhiệm vụ cho Thầy Hươu dạy thư pháp.",
  theme: "calligraphy",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Phòng khám Đông y", to: "tcm", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Trạm chuyển phát", to: "courier", x: 92, y: 60, w: 6 }],
  npc: {
    id: "giraffe", name: "Thầy Hươu dạy thư pháp", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến lớp thư pháp! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "一笔一画,慢慢写。", vi: "Từng nét từng nét, viết chậm thôi." },
    { zh: "这个字写得真好看。", vi: "Chữ này viết đẹp thật." },
    { zh: "手腕不要太用力。", vi: "Cổ tay đừng gắng sức quá." },
    { zh: "下课以后要洗毛笔。", vi: "Tan học xong phải rửa bút lông." },
  ],
  objects: [
    { id: "brush", term: "毛笔", gloss: "bút lông", above: true, portable: true, example: { zh: "写大字要用大号毛笔。", vi: "Viết chữ lớn phải dùng bút lông cỡ lớn." }, x: 21, y: 48, w: 3.5, stand: { x: 21, y: 70 } },
    { id: "inkstick", term: "墨条", gloss: "thỏi mực", above: true, portable: true, example: { zh: "他用墨条在砚台里磨墨。", vi: "Anh ấy dùng thỏi mực mài mực trong nghiên." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "ricepaper", term: "宣纸", gloss: "giấy Tuyên", above: true, portable: true, example: { zh: "宣纸很薄,要小心拿。", vi: "Giấy Tuyên rất mỏng, phải cầm cẩn thận." }, x: 35, y: 48, w: 6, stand: { x: 35, y: 70 } },
    { id: "inkstone", term: "砚台", gloss: "nghiên mực", above: true, portable: true, example: { zh: "砚台里有一点水。", vi: "Trong nghiên mực có chút nước." }, x: 41, y: 48, w: 6, stand: { x: 41, y: 70 } },
    { id: "paperweight", term: "镇纸", gloss: "cái chặn giấy", above: true, portable: true, example: { zh: "用镇纸压住宣纸。", vi: "Dùng chặn giấy đè lên giấy Tuyên." }, x: 60, y: 50, w: 6.5, stand: { x: 60, y: 74 } },
    { id: "brushpot", term: "笔筒", gloss: "ống đựng bút", above: true, portable: true, example: { zh: "笔筒里插着很多毛笔。", vi: "Trong ống đựng bút cắm rất nhiều bút lông." }, x: 67, y: 50, w: 4.5, stand: { x: 67, y: 74 } },
    { id: "brushrest", term: "笔架", gloss: "giá gác bút", above: true, portable: true, example: { zh: "写完字,把毛笔放在笔架上。", vi: "Viết chữ xong, đặt bút lông lên giá gác bút." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "copybook", term: "字帖", gloss: "sách mẫu chữ", above: true, portable: true, example: { zh: "我每天照着字帖练字。", vi: "Mỗi ngày tôi tập chữ theo sách mẫu." }, x: 81, y: 50, w: 6, stand: { x: 81, y: 74 } },
    { id: "calltable", term: "书法桌", gloss: "bàn viết thư pháp", example: { zh: "书法桌又长又宽。", vi: "Bàn viết thư pháp vừa dài vừa rộng." }, x: 44, y: 80, w: 13 },
    { id: "feltmat", term: "毛毡", gloss: "tấm nỉ lót bàn", portable: true, example: { zh: "写字以前先铺好毛毡。", vi: "Trước khi viết phải trải nỉ lót bàn." }, x: 56, y: 94, w: 12 },
    { id: "scrollbanner", term: "条幅", gloss: "dải chữ treo tường", wall: true, example: { zh: "墙上挂着一幅条幅。", vi: "Trên tường treo một dải chữ thư pháp." }, x: 50, y: 42, w: 6, stand: { x: 50, y: 70 } },
    { id: "floorcushion", term: "蒲团", gloss: "đệm ngồi", example: { zh: "他坐在蒲团上,静静地写字。", vi: "Anh ngồi trên đệm, lặng lẽ viết chữ." }, x: 30, y: 92, w: 9 },
  ],
};
