import { describe, expect, it, vi } from "vitest";

const withEnv = async (value: string | undefined, fn: () => Promise<void> | void) => {
  vi.resetModules();
  const prev = process.env.UNLIMITED_USAGE_EMAILS;
  if (value === undefined) delete process.env.UNLIMITED_USAGE_EMAILS;
  else process.env.UNLIMITED_USAGE_EMAILS = value;
  try {
    await fn();
  } finally {
    if (prev === undefined) delete process.env.UNLIMITED_USAGE_EMAILS;
    else process.env.UNLIMITED_USAGE_EMAILS = prev;
  }
};

describe("isUnlimitedAccount", () => {
  it("email khớp danh sách (không phân biệt hoa thường) → true", async () => {
    await withEnv("Owner@Example.com, other@x.com", async () => {
      const { isUnlimitedAccount } = await import("./unlimited-accounts");
      expect(isUnlimitedAccount("owner@example.com")).toBe(true);
      expect(isUnlimitedAccount("OTHER@X.COM")).toBe(true);
    });
  });
  it("email không khớp, tài khoản ẩn danh (null), hoặc chưa cấu hình biến → false", async () => {
    await withEnv("owner@example.com", async () => {
      const { isUnlimitedAccount } = await import("./unlimited-accounts");
      expect(isUnlimitedAccount("khac@example.com")).toBe(false);
      expect(isUnlimitedAccount(null)).toBe(false);
    });
    await withEnv(undefined, async () => {
      const { isUnlimitedAccount } = await import("./unlimited-accounts");
      expect(isUnlimitedAccount("owner@example.com")).toBe(false);
    });
  });
});
