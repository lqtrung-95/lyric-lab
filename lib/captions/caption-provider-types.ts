export interface CaptionTrackInfo {
  /** Mã ngôn ngữ YouTube, ví dụ zh-Hans, zh-TW, en. */
  lang: string;
  /** manual = người đăng tải, asr = tự động. */
  kind: "manual" | "asr";
  name?: string;
  /** Dữ liệu riêng của provider để tải lại track (ví dụ baseUrl). */
  ref?: string;
}

export interface CaptionLine {
  text: string;
  /** giây */
  start: number;
  end: number;
}

export interface CaptionProvider {
  listTracks(videoId: string): Promise<CaptionTrackInfo[]>;
  fetchLines(videoId: string, track: CaptionTrackInfo): Promise<CaptionLine[]>;
}
