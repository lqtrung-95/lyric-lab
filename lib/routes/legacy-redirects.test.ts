import { describe, expect, it } from "vitest";
import { legacyRedirects } from "./legacy-redirects";

describe("đường dẫn cũ chuyển sang tiếng Anh", () => {
  const find = (source: string) => legacyRedirects().find((r) => r.source === source);

  it("trung tâm công cụ /cong-cu chuyển vĩnh viễn sang /tools", () => {
    expect(find("/cong-cu")).toMatchObject({ destination: "/tools", permanent: true });
  });

  it("không còn quy tắc nào trỏ tới đường dẫn tiếng Việt cũ", () => {
    for (const r of legacyRedirects()) expect(r.destination, r.source).not.toContain("/cong-cu");
  });
});
