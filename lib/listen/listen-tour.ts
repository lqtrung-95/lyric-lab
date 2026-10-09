/** Các bước hướng dẫn màn Nghe. `targets` là bộ chọn CSS của phần tử cần chỉ vào (phần tử đang ẩn bị bỏ qua; nhiều phần tử được gộp thành một khung). */
export interface ListenTourStep {
  id: string;
  title: string;
  body: string;
  targets: string[];
}

export const LISTEN_TOUR_STEPS: ListenTourStep[] = [
  {
    id: "lyrics",
    title: "Lời bài hát",
    body: "Bấm vào một câu để nhảy tới đó và nghe lại. Bấm vào một từ để xem nghĩa, âm Hán Việt và lưu từ.",
    targets: ['[data-tour="lyric-list"] > li:first-child'],
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
    body: "Nút tốc độ (1x) cho nghe chậm hơn. Nút lặp nghe đi nghe lại câu đang hát. Nút ghim tắt tự cuộn theo nhạc để bạn đọc chỗ khác mà không bị kéo về.",
    targets: ['[data-tour="rate"]', '[data-tour="loop"]', '[data-tour="pin"]'],
  },
  {
    id: "learn",
    title: "Giải thích và luyện nói",
    body: "Ngôi sao giải thích câu đang hát bằng AI (nghĩa tự nhiên, ngữ pháp). Micro cho bạn luyện phát âm câu đó rồi nghe lại.",
    targets: ['[data-tour="explain"]', '[data-tour="practice"]'],
  },
  {
    id: "offset",
    title: "Lời bị lệch?",
    body: "Nếu lời chạy sớm hoặc muộn hơn nhạc, bấm đây để chỉnh độ lệch.",
    targets: ['[data-tour="offset"]'],
  },
];

const KEY = "lyric-lab-listen-tour";

/**
 * Có nên TỰ mở hướng dẫn không: chưa xem hoặc bỏ qua trên trình duyệt này, và không phải trình duyệt tự động hoá (người dùng thật không bao giờ có
 * `navigator.webdriver`; bài test e2e bật `window.__forceListenTour` khi cần kiểm tra chính hướng dẫn, còn lại không bị khung hướng dẫn che khi bấm).
 * Không đọc được bộ nhớ (chế độ riêng tư) thì coi như đã xem để khỏi hiện lặp lại. Nút "Hướng dẫn" ở thanh trên luôn mở được.
 */
export function isListenTourDone(): boolean {
  try {
    if (navigator.webdriver && !(window as unknown as { __forceListenTour?: boolean }).__forceListenTour) return true;
    return localStorage.getItem(KEY) !== null;
  } catch {
    return true;
  }
}

export function markListenTourDone(): void {
  try {
    localStorage.setItem(KEY, "done");
  } catch {
    /* không lưu được thì thôi */
  }
}

export interface Box { top: number; left: number; width: number; height: number }

/** Khung nhỏ nhất chứa mọi khung đã cho (bỏ qua khung rỗng); null nếu không có khung nào. */
export function unionBox(boxes: Box[]): Box | null {
  const real = boxes.filter((b) => b.width > 0 && b.height > 0);
  if (real.length === 0) return null;
  const top = Math.min(...real.map((b) => b.top));
  const left = Math.min(...real.map((b) => b.left));
  const bottom = Math.max(...real.map((b) => b.top + b.height));
  const right = Math.max(...real.map((b) => b.left + b.width));
  return { top, left, width: right - left, height: bottom - top };
}

/**
 * Vị trí thẻ chú thích quanh khung đích: ưu tiên bên dưới, không đủ chỗ thì bên trên, vẫn không đủ thì đặt sát đáy màn hình. Luôn nằm trọn trong
 * màn hình theo chiều ngang. `gap` là khoảng cách tới khung đích.
 */
export function placeTourCard(target: Box, card: { width: number; height: number }, viewport: { width: number; height: number }, gap = 12, margin = 12): { top: number; left: number } {
  const left = Math.min(Math.max(target.left + target.width / 2 - card.width / 2, margin), Math.max(margin, viewport.width - card.width - margin));
  const below = target.top + target.height + gap;
  if (below + card.height <= viewport.height - margin) return { top: below, left };
  const above = target.top - gap - card.height;
  if (above >= margin) return { top: above, left };
  return { top: Math.max(margin, viewport.height - card.height - margin), left };
}
