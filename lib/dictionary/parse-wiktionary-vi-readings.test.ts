import { describe, expect, it } from "vitest";
import { parseViReadings } from "./parse-wiktionary-vi-readings";

describe("parseViReadings", () => {
  it("lấy âm Hán Việt, bỏ danh sách nguồn", () => {
    const wt = "==Vietnamese==\n{{vi-readings|rs=小01\n|hanviet=thiếu-tdcndg;tdcntd;gdhn, thiểu-tdcndg;tdcntd\n|nom=ít\n}}\n#* quote";
    expect(parseViReadings(wt)).toEqual(["thiếu", "thiểu"]);
  });

  it("một âm, mẫu trên nhiều dòng", () => {
    expect(parseViReadings("{{vi-readings\n|hanviet=mộng-tdcntd;gdhn\n}}")).toEqual(["mộng"]);
  });

  it("chỉ có reading= thì dùng làm dự phòng", () => {
    expect(parseViReadings("{{vi-readings|reading=[[lượng]], [[lương]]|rs=亠07}}")).toEqual(["lượng", "lương"]);
  });

  it("hanviet xếp trước reading, không trùng", () => {
    expect(parseViReadings("{{vi-readings|reading=[[a]], [[niên]]|hanviet=niên-x}}")).toEqual(["niên", "a"]);
  });

  it("không có mẫu → mảng rỗng", () => {
    expect(parseViReadings("==Chinese==\nnothing")).toEqual([]);
  });
});
