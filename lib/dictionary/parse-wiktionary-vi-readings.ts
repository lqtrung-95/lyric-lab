/**
 * Đọc âm Hán Việt từ wikitext của mục chữ Hán trên Wiktionary (CC BY-SA 4.0), mẫu `{{vi-readings|hanviet=...}}`.
 * `hanviet=` dạng `thiếu-nguồn1;nguồn2, thiểu-nguồn1` (âm, gạch nối, danh sách từ điển dẫn nguồn).
 * Nếu mục chỉ có `reading=[[lượng]], [[lương]]` (không tách nhãn Hán Việt) thì dùng làm dự phòng, xếp sau.
 */
const TEMPLATE = /\{\{vi-readings([^]*?)\n?\}\}(?!\})/;
const SYLLABLE = /^[a-zà-ỹđ ]+$/i;

function splitParams(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const part of body.split(/\n?\|/)) {
    const eq = part.indexOf("=");
    if (eq > 0) params[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return params;
}

export function parseViReadings(wikitext: string): string[] {
  const m = wikitext.match(TEMPLATE);
  if (!m) return [];
  const params = splitParams(m[1]);

  const fromHanviet = (params.hanviet ?? "")
    .split(",")
    .map((s) => s.trim().split("-")[0].trim().toLowerCase())
    .filter((s) => SYLLABLE.test(s));
  const fromReading = (params.reading ?? "")
    .replace(/\[\[|\]\]/g, "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => SYLLABLE.test(s));

  return [...new Set([...fromHanviet, ...fromReading])];
}
