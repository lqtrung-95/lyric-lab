// Tính tỉ lệ thẻ sai từ phiếu đã chấm. Cột `verdict`: ok | sai_nghia | sai_pinyin | khong_dang_hoc (để trống = chưa chấm).
// Chạy: npx tsx scripts/eval/score-eval-sheet.mts [đường dẫn csv]
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "eval-output/eval-sheet.csv";
const text = readFileSync(path, "utf8").replace(/^﻿/, "");

// Đọc CSV có dấu ngoặc kép và dấu phẩy/xuống dòng trong ô.
function parseCsv(src: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && src[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const [header, ...rows] = parseCsv(text).filter((r) => r.length > 1);
const col = (name: string) => header.indexOf(name);
const graded = rows.filter((r) => r[col("verdict")]?.trim());
const tally: Record<string, number> = {};
graded.forEach((r) => { const v = r[col("verdict")].trim(); tally[v] = (tally[v] ?? 0) + 1; });
const wrong = graded.filter((r) => r[col("verdict")].trim() !== "ok").length;
console.log(`Đã chấm ${graded.length}/${rows.length} thẻ`, tally);
console.log(graded.length ? `Tỉ lệ thẻ sai: ${((100 * wrong) / graded.length).toFixed(1)}% (mục tiêu ≤ 3%)` : "Chưa có thẻ nào được chấm.");
