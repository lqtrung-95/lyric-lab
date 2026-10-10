import type { CaptionLine, CaptionProvider, CaptionTrackInfo } from "@/lib/captions/caption-provider-types";

/**
 * Provider dựng từ các dòng phụ đề tiếng Trung đã có sẵn (người dùng dán, bookmarklet gửi sang, hoặc dịch vụ transcript trả về) để đi qua đúng lõi nạp video
 * như phụ đề lấy từ YouTube. Có một track tiếng Trung, coi như do người làm (`manual`) vì không có cách phân biệt từ phía ta. Không có track tiếng Việt: bản dịch luôn do AI.
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
