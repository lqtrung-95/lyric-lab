import { describe, expect, it } from "vitest";
import { VISIT_GREETINGS, buildVisitUrl, parseVisit, type PetVisit } from "./pet-visit";

const V: PetVisit = { species: "fox", name: "Tiểu Hồ", stage: 2, accessories: ["scarf"], level: 7, streak: 12 };
const parse = (q: string) => parseVisit(new URLSearchParams(q));

describe("link thăm pet", () => {
  it("tạo rồi đọc lại đúng", () => {
    const url = buildVisitUrl("https://songhanzi.com/ghe-tham-pet", V);
    expect(parseVisit(new URL(url).searchParams)).toEqual(V);
  });
  it("từ chối loài lạ, giai đoạn sai, thiếu tên", () => {
    expect(parse("s=lion&n=A&g=1")).toBeNull();
    expect(parse("s=cat&n=A&g=4")).toBeNull();
    expect(parse("s=cat&n=A&g=x")).toBeNull();
    expect(parse("s=cat&g=1")).toBeNull();
    expect(parse("s=cat&n=%20%20&g=1")).toBeNull();
  });
  it("bỏ phụ kiện không có trong danh sách, kẹp số liệu", () => {
    const v = parse("s=cat&n=Mun&g=1&a=scarf,hacker,scarf&l=99999&k=-3")!;
    expect(v.accessories).toEqual(["scarf"]);
    expect(v.level).toBe(1);
    expect(v.streak).toBe(0);
  });
  it("cắt tên dài và có lời chào", () => {
    expect(parse(`s=cat&n=${"a".repeat(40)}&g=1`)!.name.length).toBe(16);
    expect(VISIT_GREETINGS("Mun").length).toBeGreaterThan(2);
  });
});
