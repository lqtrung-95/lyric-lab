// Tùy chọn màn Nghe, nhớ cho lần sau (LS-03).
export const LISTEN_PREFS_KEY = "lyric-lab-listen-prefs";
// Tốc độ nghe: thanh trượt trong khoảng này (YouTube nhúng cho tối đa 2x), các mức hay dùng làm nút chọn nhanh.
export const MIN_PLAYBACK_RATE = 0.5;
export const MAX_PLAYBACK_RATE = 2;
export const PLAYBACK_RATE_STEP = 0.05;
export const PLAYBACK_RATE_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Làm tròn về bước 0,05 và giữ trong khoảng cho phép (tránh số lẻ kiểu 0.7500000001 của phép cộng số thực). */
export const clampRate = (r: number) => Math.min(MAX_PLAYBACK_RATE, Math.max(MIN_PLAYBACK_RATE, Number((Math.round(r / PLAYBACK_RATE_STEP) * PLAYBACK_RATE_STEP).toFixed(2))));
/** "1x", "0,75x", "1,25x". */
export const formatRate = (r: number) => `${String(r).replace(".", ",")}x`;

export const PLAYER_SIZES = ["large", "medium", "small"] as const;
export type PlayerSize = (typeof PLAYER_SIZES)[number];

export interface ListenPrefs {
  showPinyin: boolean;
  showTranslation: boolean;
  rate: number;
  /** Tự cuộn theo câu đang hát. Tắt (ghim) để tự đọc câu khác mà không bị kéo về câu đang phát. */
  autoScroll: boolean;
  /** Cỡ khung video từ màn hình md trở lên. */
  playerSize: PlayerSize;
}

// Mặc định cỡ "vừa": video lớn đầy khung đẩy lời bài hát xuống thấp, người mới khó theo kịp; ai muốn lớn hơn thì đổi ở Cài đặt.
export const defaultListenPrefs: ListenPrefs = { showPinyin: true, showTranslation: true, rate: 1, autoScroll: true, playerSize: "medium" };

export function parseListenPrefs(raw: string | null): ListenPrefs {
  if (!raw) return defaultListenPrefs;
  try {
    const d = JSON.parse(raw) as Partial<ListenPrefs>;
    return {
      showPinyin: typeof d.showPinyin === "boolean" ? d.showPinyin : defaultListenPrefs.showPinyin,
      showTranslation: typeof d.showTranslation === "boolean" ? d.showTranslation : defaultListenPrefs.showTranslation,
      rate: typeof d.rate === "number" && Number.isFinite(d.rate) && d.rate >= MIN_PLAYBACK_RATE && d.rate <= MAX_PLAYBACK_RATE ? clampRate(d.rate) : defaultListenPrefs.rate,
      autoScroll: typeof d.autoScroll === "boolean" ? d.autoScroll : defaultListenPrefs.autoScroll,
      playerSize: (PLAYER_SIZES as readonly unknown[]).includes(d.playerSize) ? (d.playerSize as PlayerSize) : defaultListenPrefs.playerSize,
    };
  } catch {
    return defaultListenPrefs;
  }
}
