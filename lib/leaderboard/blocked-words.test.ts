import { describe, expect, it } from "vitest";
import { containsBlockedWord } from "./blocked-words";

describe("containsBlockedWord", () => {
  it("bắt từ tục có dấu, viết tắt và thay ký tự", () => {
    for (const bad of ["Địt mẹ mày", "dit.me", "D!tme".replace("!", "i"), "f u c k".replace(/ /g, ""), "Sh1t", "vcl123", "Thằng chó", "ĐCM"]) expect(containsBlockedWord(bad), bad).toBe(true);
  });
  it("không bắt nhầm tên bình thường", () => {
    for (const ok of ["Long", "London", "Minh Anh", "Lan Chi", "Dickens", "Cu Tí", "Trung_95", "Hà Nội", "Classic", "Duy", "Mai Lon".replace("Lon", "Linh")]) {
      expect(containsBlockedWord(ok), ok).toBe(false);
    }
  });
});
