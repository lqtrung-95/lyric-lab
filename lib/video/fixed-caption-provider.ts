import type { CaptionLine, CaptionProvider, CaptionTrackInfo } from "@/lib/captions/caption-provider-types";

/**
 * Provider dựng từ các dòng phụ đề đã có sẵn (người dùng dán, bookmarklet gửi sang, hoặc dịch vụ transcript trả về) để đi qua đúng lõi nạp video
 * như phụ đề lấy từ YouTube. Chỉ có một track tiếng Trung, coi như do người làm (`manual`) vì không có cách phân biệt từ phía ta.
 */
export class FixedCaptionProvider implements CaptionProvider {
  constructor(private readonly lines: CaptionLine[], private readonly lang = "zh-Hans") {}

  async listTracks(): Promise<CaptionTrackInfo[]> {
    return [{ lang: this.lang, kind: "manual" }];
  }

  async fetchLines(): Promise<CaptionLine[]> {
    return this.lines;
  }
}
