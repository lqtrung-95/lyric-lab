import { describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth/current-user";
import { allowGrammarCall, type GrammarQuotaDeps } from "./grammar-quota";

const user = { id: "u1", email: null, isAnonymous: true } as unknown as CurrentUser;
const deps = (over: Partial<GrammarQuotaDeps> = {}): GrammarQuotaDeps => ({ consumeGlobal: vi.fn(() => true), consumeIp: vi.fn(() => true), consumeUser: vi.fn(() => true), ...over });

describe("allowGrammarCall", () => {
  it("có tài khoản thì tính theo tài khoản, không đụng hạn mức IP", async () => {
    const d = deps();
    expect(await allowGrammarCall(user, "1.2.3.4", d)).toBe(true);
    expect(d.consumeUser).toHaveBeenCalledWith(user);
    expect(d.consumeIp).not.toHaveBeenCalled();
  });
  it("khách chưa có phiên thì tính theo IP", async () => {
    const d = deps();
    expect(await allowGrammarCall(null, "1.2.3.4", d)).toBe(true);
    expect(d.consumeIp).toHaveBeenCalledWith("1.2.3.4");
    expect(d.consumeUser).not.toHaveBeenCalled();
  });
  it("hết trần chung thì từ chối và không trừ hạn mức của ai", async () => {
    const d = deps({ consumeGlobal: vi.fn(() => false) });
    expect(await allowGrammarCall(user, "x", d)).toBe(false);
    expect(d.consumeUser).not.toHaveBeenCalled();
    expect(d.consumeIp).not.toHaveBeenCalled();
  });
  it("hết hạn mức tài khoản hoặc IP thì từ chối", async () => {
    expect(await allowGrammarCall(user, "x", deps({ consumeUser: async () => false }))).toBe(false);
    expect(await allowGrammarCall(null, "x", deps({ consumeIp: () => false }))).toBe(false);
  });
});
