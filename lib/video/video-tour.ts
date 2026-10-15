import { isTourDone, markTourDone, type ListenTourStep } from "@/lib/listen/listen-tour";

/**
 * Hướng dẫn cho người dùng lần đầu ở trang xem video (cùng thành phần `ListenTour` với màn Nghe bài hát). `targets` là bộ chọn CSS (phần tử đang ẩn bị bỏ qua, nên bước nào không
 * có đích ở cỡ màn hình/tab hiện tại thì tự bị lược). Các thuộc tính `data-tour` nằm ở: danh sách phụ đề (LyricList), nút chế độ xem, thanh phát (PlaybackBar), thanh tab và nút Thích.
 */
export const VIDEO_TOUR_STEPS: ListenTourStep[] = [
  {
    id: "subtitles",
    title: "Phụ đề từng câu",
    body: "Mỗi câu có pinyin và bản dịch tiếng Việt. Bấm vào một câu để nhảy tới đó và nghe lại. Bấm vào một từ để xem nghĩa, âm Hán Việt và lưu vào bộ thẻ ôn.",
    targets: ['[data-tour="lyric-list"] > li:first-child'],
  },
  {
    id: "tabs",
    title: "Ba cách học một video",
    body: "Phụ đề: xem và tra từ. Nghe – chép: nghe từng câu rồi gõ lại. Luyện nói: nghe câu mẫu rồi nói theo, AI nhận xét phát âm của bạn.",
    targets: ['[data-tour="study-tabs"]'],
  },
  {
    id: "view",
    title: "Pinyin và bản dịch",
    body: "Bật hoặc tắt pinyin và nghĩa tiếng Việt của từng câu. Tắt đi khi bạn muốn tự đoán nghĩa.",
    targets: ['[data-tour="view-toggles"]'],
  },
  {
    id: "controls",
    title: "Tốc độ, lặp câu, ghim",
    body: "Nút tốc độ (1x) cho nghe chậm hơn. Nút lặp nghe đi nghe lại câu đang phát. Nút ghim tắt tự cuộn theo video để bạn đọc chỗ khác mà không bị kéo về.",
    targets: ['[data-tour="rate"]', '[data-tour="loop"]', '[data-tour="pin"]'],
  },
  {
    id: "like",
    title: "Lưu video yêu thích",
    body: "Bấm Thích để lưu video này. Ở trang Video, bấm nút Yêu thích để xem lại các video đã thích.",
    targets: ['[data-tour="like"]'],
  },
];

const KEY = "lyric-lab-video-tour";
export const isVideoTourDone = (): boolean => isTourDone(KEY, "__forceVideoTour");
export const markVideoTourDone = (): void => markTourDone(KEY);
