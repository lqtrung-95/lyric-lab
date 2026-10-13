import { describe, expect, it } from "vitest";
import { seededRng } from "@/lib/practice/random";
import { buildOrder, buildShift, CUSTOMERS_PER_SHIFT, isTrayCorrect } from "./restaurant-order";

describe("buildOrder", () => {
  it("một món: chữ Hán, pinyin và nghĩa khớp nhau", () => {
    const o = buildOrder([{ dishId: "baozi", qty: 2 }]);
    expect(o.zh).toBe("你好！我要两个包子。");
    expect(o.pinyin).toBe("Nǐ hǎo! Wǒ yào liǎng ge bāozi.");
    expect(o.vi).toBe("Xin chào! Cho tôi hai cái bánh bao.");
  });
  it("hai món nối bằng 和 / hé / và; 一 đọc yí trước 个 và yì trước lượng từ khác", () => {
    const o = buildOrder([{ dishId: "doujiang", qty: 1 }, { dishId: "jidan", qty: 1 }]);
    expect(o.zh).toBe("你好！我要一杯豆浆和一个鸡蛋。");
    expect(o.pinyin).toBe("Nǐ hǎo! Wǒ yào yì bēi dòujiāng hé yí ge jīdàn.");
    expect(o.vi).toBe("Xin chào! Cho tôi một ly sữa đậu nành và một quả trứng gà.");
  });
  it("số 3 là 三/sān", () => expect(buildOrder([{ dishId: "zhou", qty: 3 }]).zh).toBe("你好！我要三碗粥。"));
});

describe("buildShift", () => {
  it("đủ số khách; ba khách đầu một món, các khách sau hai món khác nhau", () => {
    const shift = buildShift(seededRng(1));
    expect(shift).toHaveLength(CUSTOMERS_PER_SHIFT);
    shift.forEach((o, i) => {
      expect(o.items).toHaveLength(i < 3 ? 1 : 2);
      expect(new Set(o.items.map((x) => x.dishId)).size).toBe(o.items.length);
    });
  });
  it("nhiều ca ngẫu nhiên không bao giờ có món trùng trong một đơn và số lượng 1–3", () => {
    for (let s = 0; s < 50; s++) for (const o of buildShift(seededRng(s))) {
      expect(new Set(o.items.map((x) => x.dishId)).size).toBe(o.items.length);
      expect(o.items.every((x) => x.qty >= 1 && x.qty <= 3)).toBe(true);
    }
  });
});

describe("isTrayCorrect", () => {
  const order = buildOrder([{ dishId: "doujiang", qty: 1 }, { dishId: "baozi", qty: 2 }]);
  it("đúng khi đủ món và số lượng, bất kể thứ tự", () => expect(isTrayCorrect(order, { baozi: 2, doujiang: 1 })).toBe(true));
  it("sai khi thiếu, thừa món hoặc sai số lượng; số 0 coi như không có", () => {
    expect(isTrayCorrect(order, { doujiang: 1 })).toBe(false);
    expect(isTrayCorrect(order, { baozi: 2, doujiang: 1, zhou: 1 })).toBe(false);
    expect(isTrayCorrect(order, { baozi: 1, doujiang: 1 })).toBe(false);
    expect(isTrayCorrect(order, { baozi: 2, doujiang: 1, zhou: 0 })).toBe(true);
  });
});
