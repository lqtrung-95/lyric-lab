import { describe, expect, it } from "vitest";
import { pickChineseVoice } from "./speak-chinese";

const v = (lang: string, name: string, localService = true) => ({ lang, name, localService });

describe("pickChineseVoice", () => {
  it("ưu tiên zh-CN, bỏ Quảng Đông và Đài Loan nếu có giọng Đại lục", () => {
    const voice = pickChineseVoice([v("zh-HK", "Sinji"), v("en-US", "Alex"), v("zh-TW", "Meijia"), v("zh-CN", "Tingting")]);
    expect(voice?.name).toBe("Tingting");
  });

  it("zh-CN có sẵn trên máy thắng giọng zh-CN cần mạng; hỗ trợ dạng zh_CN", () => {
    expect(pickChineseVoice([v("zh-CN", "Online", false), v("zh_CN", "Local", true)])?.name).toBe("Local");
  });

  it("không có giọng Phổ thông: lấy zh khác nhưng không lấy Quảng Đông; không có gì thì null", () => {
    expect(pickChineseVoice([v("zh-TW", "Meijia"), v("zh-HK", "Sinji")])?.name).toBe("Meijia");
    expect(pickChineseVoice([v("zh-HK", "Sinji"), v("en-US", "Alex")])).toBeNull();
    expect(pickChineseVoice([])).toBeNull();
  });
});
