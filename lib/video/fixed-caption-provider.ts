import type { CaptionLine, CaptionProvider, CaptionTrackInfo } from "@/lib/captions/caption-provider-types";

/**
 * Provider dựng từ các dòng phụ đề đã có sẵn (người dùng dán, bookmarklet gửi sang, hoặc dịch vụ transcript trả về) để đi qua đúng lõi nạp video
 * như phụ đề lấy từ YouTube. Có một track tiếng Trung, coi như do người làm (`manual`) vì không có cách phân biệt từ phía ta; nếu có
 * `viLines` (phụ đề tiếng Việt có sẵn của video) thì thêm track tiếng Việt để lõi nạp ghép làm bản dịch, khỏi nhờ AI dịch.
 */
export class FixedCaptionProvider implements CaptionProvider {
  constructor(private readonly lines: CaptionLine[], private readonly lang = "zh-Hans", private readonly viLines: CaptionLine[] | null = null) {}

  async listTracks(): Promise<CaptionTrackInfo[]> {
    return [{ lang: this.lang, kind: "manual" }, ...(this.viLines ? [{ lang: "vi", kind: "manual" as const }] : [])];
  }

  async fetchLines(_videoId: string, track: CaptionTrackInfo): Promise<CaptionLine[]> {
    return track.lang.toLowerCase().startsWith("vi") && this.viLines ? this.viLines : this.lines;
  }
}
