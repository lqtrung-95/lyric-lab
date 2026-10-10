import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const calls: string[] = [];
let latest: { id: number } | null = { id: 42 };
const builder = (table: string) => {
  const chain: Record<string, unknown> = {
    select: () => { calls.push(`${table}.select`); return chain; },
    eq: (col: string, val: unknown) => { calls.push(`eq ${col}=${val}`); return chain; },
    order: () => chain,
    limit: () => chain,
    maybeSingle: async () => ({ data: latest }),
    delete: () => { calls.push(`${table}.delete`); return chain; },
    then: (resolve: (v: unknown) => void) => resolve({ error: null }),
  };
  return chain;
};
vi.mock("@/lib/supabase/service-client", () => ({ createSupabaseServiceClient: () => ({ from: builder, rpc: vi.fn() }) }));

const { refundUsage } = await import("./consume-usage");
const user = { id: "u1", email: "a@b.c", isAnonymous: false } as never;

beforeEach(() => { calls.length = 0; latest = { id: 42 }; });

describe("refundUsage", () => {
  it("xóa đúng dòng usage_events mới nhất của người dùng và loại đó", async () => {
    await refundUsage(user, "voice");
    expect(calls).toContain("eq user_id=u1");
    expect(calls).toContain("eq kind=voice");
    expect(calls).toContain("usage_events.delete");
    expect(calls).toContain("eq id=42");
  });
  it("không có dòng nào thì không xóa gì và không lỗi", async () => {
    latest = null;
    await refundUsage(user, "ask");
    expect(calls).not.toContain("usage_events.delete");
  });
});
