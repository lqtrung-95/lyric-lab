// Tùy chọn màn Nghe, nhớ cho lần sau (LS-03).
export const LISTEN_PREFS_KEY = "lyric-lab-listen-prefs";
export const PLAYBACK_RATES = [0.5, 0.75, 1] as const;

export interface ListenPrefs {
  showPinyin: boolean;
  showTranslation: boolean;
  rate: number;
  /** Tự cuộn theo câu đang hát. Tắt (ghim) để tự đọc câu khác mà không bị kéo về câu đang phát. */
  autoScroll: boolean;
}

export const defaultListenPrefs: ListenPrefs = { showPinyin: true, showTranslation: true, rate: 1, autoScroll: true };

export function parseListenPrefs(raw: string | null): ListenPrefs {
  if (!raw) return defaultListenPrefs;
  try {
    const d = JSON.parse(raw) as Partial<ListenPrefs>;
    return {
      showPinyin: typeof d.showPinyin === "boolean" ? d.showPinyin : defaultListenPrefs.showPinyin,
      showTranslation: typeof d.showTranslation === "boolean" ? d.showTranslation : defaultListenPrefs.showTranslation,
      rate: (PLAYBACK_RATES as readonly number[]).includes(d.rate as number) ? (d.rate as number) : defaultListenPrefs.rate,
      autoScroll: typeof d.autoScroll === "boolean" ? d.autoScroll : defaultListenPrefs.autoScroll,
    };
  } catch {
    return defaultListenPrefs;
  }
}
