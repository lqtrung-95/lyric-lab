import { describe, expect, it } from "vitest";
import { parseRoomCode } from "./truth-or-lie-lobby";

describe("đọc mã phòng Hai thật một giả", () => {
  it("nhận liên kết mời, đường dẫn có vai và mã trần; bỏ thứ không đúng dạng", () => {
    expect(parseRoomCode("https://songhanzi.com/review/truth-or-lie/room/abc234")).toBe("ABC234");
    expect(parseRoomCode("/review/truth-or-lie/play/HVJDEM/a")).toBe("HVJDEM");
    expect(parseRoomCode("  hvjdem ")).toBe("HVJDEM");
    expect(parseRoomCode("O0I1AB")).toBeNull(); // ký tự dễ nhầm không có trong bảng mã
    expect(parseRoomCode("xin chào")).toBeNull();
  });
});
