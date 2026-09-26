import { describe, expect, it } from "vitest";
import { listChineseVoices, pickChineseVoice } from "./speak-chinese";

const v = (lang: string, name: string, localService = true) => ({ lang, name, localService });

describe("pickChineseVoice", () => {
  it("ưu tiên giọng tự nhiên/cao cấp hơn giọng cũ dù giọng cũ có sẵn offline", () => {
    const voices = [v("zh-CN", "Tingting"), v("zh-CN", "Google 普通话（中国大陆）", false), v("zh-CN", "Microsoft Xiaoxiao Online (Natural)", false)];
    expect(["Google 普通话（中国大陆）", "Microsoft Xiaoxiao Online (Natural)"]).toContain(pickChineseVoice(voices)?.name);
    expect(pickChineseVoice(voices)?.name).not.toBe("Tingting");
  });

  it("giọng người dùng đã chọn được dùng nếu còn trên máy, không thì quay về giọng tốt nhất", () => {
    const voices = [v("zh-CN", "Tingting"), v("zh-CN", "Lili (Premium)")];
    expect(pickChineseVoice(voices, "Tingting")?.name).toBe("Tingting");
    expect(pickChineseVoice(voices, "Đã xóa")?.name).toBe("Lili (Premium)");
  });

  it("chỉ lấy giọng Phổ thông: bỏ Quảng Đông và ngôn ngữ khác; hỗ trợ dạng zh_CN", () => {
    const list = listChineseVoices([v("zh-HK", "Sinji"), v("en-US", "Alex"), v("yue-CN", "Yue"), v("zh_CN", "Local"), v("zh-TW", "Meijia")]);
    expect(list.map((x) => x.name)).toEqual(["Local", "Meijia"]);
  });

  it("không có giọng Phổ thông thì null", () => {
    expect(pickChineseVoice([v("zh-HK", "Sinji"), v("en-US", "Alex")])).toBeNull();
    expect(pickChineseVoice([])).toBeNull();
  });
});
