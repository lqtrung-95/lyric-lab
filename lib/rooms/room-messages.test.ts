import { describe, expect, it } from "vitest";
import { roomErrorMessage } from "./room-messages";

describe("roomErrorMessage", () => {
  it("trả thông báo tiếng Việt cho mã đã biết", () => {
    expect(roomErrorMessage("room_full")).toContain("2 người");
    expect(roomErrorMessage("room_not_found")).toContain("Không tìm thấy");
  });
  it("mã lạ hoặc không phải chuỗi thì dùng thông báo lỗi chung", () => {
    expect(roomErrorMessage("xyz")).toBe(roomErrorMessage("server_error"));
    expect(roomErrorMessage(undefined)).toBe(roomErrorMessage("server_error"));
  });
});
