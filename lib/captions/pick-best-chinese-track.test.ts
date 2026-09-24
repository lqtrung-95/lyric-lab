import { describe, expect, it } from "vitest";
import type { CaptionTrackInfo } from "./caption-provider-types";
import { pickBestChineseTrack } from "./pick-best-chinese-track";

const t = (lang: string, kind: "manual" | "asr" = "manual"): CaptionTrackInfo => ({ lang, kind });

describe("pickBestChineseTrack", () => {
  it("không có track tiếng Trung → null", () => {
    expect(pickBestChineseTrack([t("en"), t("vi")])).toBeNull();
    expect(pickBestChineseTrack([])).toBeNull();
  });

  it("manual thắng asr dù asr là giản thể", () => {
    expect(pickBestChineseTrack([t("zh-Hans", "asr"), t("zh-TW")])?.lang).toBe("zh-TW");
  });

  it("giản thể thắng phồn thể trong cùng loại", () => {
    expect(pickBestChineseTrack([t("zh-TW"), t("zh-CN")])?.lang).toBe("zh-CN");
  });

  it("yue xếp cuối", () => {
    expect(pickBestChineseTrack([t("yue"), t("zh-HK")])?.lang).toBe("zh-HK");
    expect(pickBestChineseTrack([t("yue")])?.lang).toBe("yue");
  });

  it("chỉ có asr tiếng Trung vẫn được chọn", () => {
    expect(pickBestChineseTrack([t("en"), t("zh", "asr")])?.kind).toBe("asr");
  });
});
