// Tải âm Hán Việt từ Wiktionary (API MediaWiki, CC BY-SA 4.0) cho mọi chữ phồn thể có trong CC-CEDICT.
// Kết quả: data-cache/hanviet-wiktionary.json { "年": ["niên"], ... }. Resume được. Lịch sự: 1 request/giây.
// Chạy: npx tsx scripts/dictionary/fetch-hanviet-from-wiktionary.mts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseCedict } from "@/lib/dictionary/parse-cedict";
import { parseViReadings } from "@/lib/dictionary/parse-wiktionary-vi-readings";

const OUT = "data-cache/hanviet-wiktionary.json";
const BATCH = 50;
const API = "https://en.wiktionary.org/w/api.php";

const cedict = parseCedict(readFileSync("data-cache/cedict_ts.u8", "utf8"));
const chars = [...new Set(cedict.flatMap((e) => [...e.traditional]).filter((c) => /\p{Script=Han}/u.test(c)))];
const done: Record<string, string[]> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const todo = chars.filter((c) => !(c in done));
console.log(`${chars.length} chữ, còn ${todo.length} chữ cần tải`);

for (let i = 0; i < todo.length; i += BATCH) {
  const titles = todo.slice(i, i + BATCH);
  const url = new URL(API);
  url.search = new URLSearchParams({
    action: "query", prop: "revisions", rvprop: "content", rvslots: "main", format: "json", formatversion: "2", titles: titles.join("|"),
  }).toString();
  let json;
  for (let attempt = 0; attempt < 3 && !json; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "lyric-lab-dictionary-import (personal project)" }, signal: AbortSignal.timeout(60_000) });
      if (res.ok) json = await res.json();
      else await new Promise((r) => setTimeout(r, 5000));
    } catch { await new Promise((r) => setTimeout(r, 5000)); }
  }
  if (!json) throw new Error(`Thất bại ở lô ${i}`);
  const found = new Map<string, string>(json.query.pages.map((p: { title: string; revisions?: { slots: { main: { content: string } } }[] }) => [p.title, p.revisions?.[0]?.slots.main.content ?? ""]));
  for (const t of titles) done[t] = parseViReadings(found.get(t) ?? "");
  writeFileSync(OUT, JSON.stringify(done));
  if ((i / BATCH) % 10 === 0) console.log(`${Math.min(i + BATCH, todo.length)}/${todo.length}`);
  await new Promise((r) => setTimeout(r, 1000));
}
const withReading = Object.values(done).filter((r) => r.length > 0).length;
console.log(`Xong: ${withReading}/${Object.keys(done).length} chữ có âm Hán Việt`);
