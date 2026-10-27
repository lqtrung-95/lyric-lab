import type { SceneDef } from "../explore-types";

/** Phòng thí nghiệm AI: từ riêng của cảnh này (không trùng cảnh khác), câu ví dụ tự viết, đơn giản, dùng được ngoài đời. */
export const AILAB_SCENE: SceneDef = {
  id: "ailab",
  title: "Phòng thí nghiệm AI",
  subtitle: "Vào phòng thí nghiệm AI, học từ về trí tuệ nhân tạo rồi làm nhiệm vụ cho Cô Cáo nhà nghiên cứu.",
  theme: "ailab",
  start: { x: 50, y: 95 },
  exits: [{ sprite: "exitLeft", label: "Về Công ty phần mềm", to: "devroom", x: 7, y: 60, w: 6 }, { sprite: "exit", label: "Sang Cảng xuất nhập khẩu", to: "port", x: 92, y: 60, w: 6 }],
  npc: {
    id: "fox", name: "Cô Cáo nhà nghiên cứu AI", x: 88, y: 93, w: 9,
    greeting: "Chào mừng đến phòng thí nghiệm AI! Hãy lại gần đồ vật rồi nhấn E (hoặc chạm vào) để học tên tiếng Trung. Học được 3 từ thì đến gặp mình để nhận nhiệm vụ nhé.",
    notReady: "Bạn cần học ít nhất 3 từ trước đã. Xem thêm vài món nhé!",
  },
  decor: [
    { sprite: "counter", x: 29, y: 64, w: 28 },
    { sprite: "counter", x: 70, y: 66, w: 28 },
  ],
  phrases: [
    { zh: "人工智能可以帮我们做很多事。", vi: "Trí tuệ nhân tạo có thể giúp chúng ta làm nhiều việc." },
    { zh: "模型还需要更多数据。", vi: "Mô hình còn cần thêm dữ liệu." },
    { zh: "请把提示词写得清楚一点。", vi: "Xin viết câu lệnh rõ ràng hơn một chút." },
    { zh: "它的回答不一定对。", vi: "Câu trả lời của nó chưa chắc đã đúng." },
  ],
  objects: [
    { id: "algorithm", term: "算法", gloss: "thuật toán", above: true, portable: true, example: { zh: "这个算法能很快找到答案。", vi: "Thuật toán này tìm ra đáp án rất nhanh." }, x: 21, y: 48, w: 5.5, stand: { x: 21, y: 70 } },
    { id: "neuralmodel", term: "模型", gloss: "mô hình", above: true, portable: true, example: { zh: "模型学得越多,就越聪明。", vi: "Mô hình học càng nhiều càng thông minh." }, x: 28, y: 48, w: 6, stand: { x: 28, y: 70 } },
    { id: "databars", term: "数据", gloss: "dữ liệu", above: true, portable: true, example: { zh: "没有数据,模型就学不会。", vi: "Không có dữ liệu thì mô hình không học được." }, x: 35, y: 48, w: 5.5, stand: { x: 35, y: 70 } },
    { id: "chip", term: "芯片", gloss: "chip", above: true, portable: true, example: { zh: "这块芯片只有指甲那么大。", vi: "Con chip này chỉ to bằng móng tay." }, x: 41, y: 48, w: 5, stand: { x: 41, y: 70 } },
    { id: "graphicscard", term: "显卡", gloss: "card đồ họa", above: true, portable: true, example: { zh: "训练模型需要很强的显卡。", vi: "Huấn luyện mô hình cần card đồ họa rất mạnh." }, x: 60, y: 50, w: 7, stand: { x: 60, y: 74 } },
    { id: "webcam", term: "摄像头", gloss: "camera nhỏ", above: true, portable: true, example: { zh: "摄像头能看见你的脸。", vi: "Camera nhỏ có thể nhìn thấy mặt bạn." }, x: 67, y: 50, w: 4.5, stand: { x: 67, y: 74 } },
    { id: "prompt", term: "提示词", gloss: "câu lệnh gợi ý (prompt)", above: true, portable: true, example: { zh: "好的提示词能得到更好的回答。", vi: "Câu lệnh tốt sẽ nhận được câu trả lời tốt hơn." }, x: 74, y: 50, w: 6, stand: { x: 74, y: 74 } },
    { id: "voiceassistant", term: "语音助手", gloss: "trợ lý giọng nói", above: true, portable: true, example: { zh: "我对语音助手说:“明天天气怎么样?”", vi: "Tôi nói với trợ lý giọng nói: “Ngày mai thời tiết thế nào?”" }, x: 81, y: 50, w: 4.5, stand: { x: 81, y: 74 } },
    { id: "dronebot", term: "无人机", gloss: "máy bay không người lái", example: { zh: "无人机在实验室上面飞来飞去。", vi: "Máy bay không người lái bay qua bay lại phía trên phòng thí nghiệm." }, x: 44, y: 80, w: 14 },
    { id: "roboticarm", term: "机械臂", gloss: "cánh tay robot", example: { zh: "机械臂把杯子放到了桌子上。", vi: "Cánh tay robot đặt chiếc cốc lên bàn." }, x: 56, y: 94, w: 12 },
    { id: "touchscreen", term: "触摸屏", gloss: "màn hình cảm ứng", portable: true, example: { zh: "点一下触摸屏就可以提问。", vi: "Chạm vào màn hình cảm ứng là có thể đặt câu hỏi." }, x: 84, y: 76, w: 8 },
    { id: "sensor", term: "传感器", gloss: "cảm biến", portable: true, example: { zh: "传感器能知道房间里有没有人。", vi: "Cảm biến biết trong phòng có người hay không." }, x: 30, y: 92, w: 6 },
  ],
};
