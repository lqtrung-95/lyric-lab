import { afterEach, describe, expect, it, vi } from "vitest";

const withEnv = async (value: string | undefined, fn: () => Promise<void> | void) => {
  vi.resetModules();
  if (value === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = value;
  await fn();
};

describe("isAdminAccount", () => {
  afterEach(() => { delete process.env.ADMIN_EMAILS; vi.resetModules(); });

  it("email khớp danh sách (không phân biệt hoa thường) → true", async () => {
    await withEnv("Owner@Example.com, other@x.com", async () => {
      const { isAdminAccount } = await import("./admin-accounts");
      expect(isAdminAccount("owner@example.com")).toBe(true);
    });
  });
  it("email không khớp, null, hoặc chưa cấu hình biến → false", async () => {
    await withEnv("owner@example.com", async () => {
      const { isAdminAccount } = await import("./admin-accounts");
      expect(isAdminAccount("khac@example.com")).toBe(false);
      expect(isAdminAccount(null)).toBe(false);
    });
    await withEnv(undefined, async () => {
      const { isAdminAccount } = await import("./admin-accounts");
      expect(isAdminAccount("owner@example.com")).toBe(false);
    });
  });
});
