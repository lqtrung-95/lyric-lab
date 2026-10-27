import * as OpenCC from "opencc-js";

export type ScriptMode = "s2t" | "s2tw" | "s2hk" | "t2s";

export const SCRIPT_MODES: readonly { id: ScriptMode; label: string; hint: string }[] = [
  { id: "s2t", label: "Giản thể → Phồn thể", hint: "Phồn thể chuẩn, giữ nguyên cách dùng từ." },
  { id: "s2tw", label: "Giản thể → Phồn thể Đài Loan", hint: "Đổi cả từ vựng Đài Loan hay dùng (软件 → 軟體)." },
  { id: "s2hk", label: "Giản thể → Phồn thể Hồng Kông", hint: "Dạng chữ theo chuẩn Hồng Kông." },
  { id: "t2s", label: "Phồn thể → Giản thể", hint: "Mọi biến thể phồn thể (Đài Loan, Hồng Kông) đều về giản thể." },
];

export const MAX_SCRIPT_CHARS = 5000;

const converters: Record<ScriptMode, (text: string) => string> = {
  s2t: OpenCC.Converter({ from: "cn", to: "t" }),
  s2tw: OpenCC.Converter({ from: "cn", to: "twp" }),
  s2hk: OpenCC.Converter({ from: "cn", to: "hk" }),
  t2s: OpenCC.Converter({ from: "t", to: "cn" }),
};

/**
 * Chữ giản thể ứng với nhiều chữ phồn thể tùy nghĩa: đổi tự động có thể chọn sai, nên đánh dấu để người dùng đọc lại (như 发 → 發 hay 髮).
 * Chỉ liệt kê các chữ thông dụng; danh sách cố ý ngắn và chỉ gồm trường hợp đã chắc chắn.
 */
export const AMBIGUOUS_SIMPLIFIED: Record<string, string[]> = {
  发: ["發 (phát: gửi, phát triển)", "髮 (phát: tóc)"],
  干: ["幹 (làm việc)", "乾 (khô)", "干 (giữ nguyên: can dự)"],
  后: ["後 (sau)", "后 (giữ nguyên: hoàng hậu)"],
  面: ["面 (mặt)", "麵 (mì, bột)"],
  里: ["裡 (bên trong)", "里 (giữ nguyên: dặm, làng)"],
  只: ["隻 (con, chiếc: lượng từ)", "只 (giữ nguyên: chỉ)"],
  台: ["臺 (đài, Đài Loan)", "檯 (bàn, quầy)", "颱 (bão)", "台 (giữ nguyên: tên người)"],
  松: ["鬆 (lỏng)", "松 (giữ nguyên: cây thông)"],
  复: ["復 (lặp lại, phục hồi)", "複 (phức tạp, sao chép)"],
  系: ["系 (hệ)", "係 (là, quan hệ)", "繫 (buộc)"],
  制: ["制 (chế độ)", "製 (làm ra)"],
  向: ["向 (hướng)", "嚮 (hướng tới)"],
  征: ["征 (đi xa, chinh phạt)", "徵 (thu, dấu hiệu)"],
  范: ["範 (khuôn mẫu)", "范 (giữ nguyên: họ Phạm)"],
  获: ["獲 (đạt được)", "穫 (thu hoạch)"],
  斗: ["鬥 (đấu)", "斗 (giữ nguyên: cái đấu, sao Đẩu)"],
  才: ["才 (mới, tài)", "纔 (mới: cách viết cũ)"],
  历: ["歷 (trải qua)", "曆 (lịch)"],
};

export interface ScriptCheck { char: string; options: string[] }
export interface ScriptResult {
  output: string;
  /** Số chữ Hán bị đổi. */
  changed: number;
  /** Chữ (không lặp) cần đọc lại vì có nhiều cách chuyển. Rỗng khi chuyển phồn → giản. */
  check: ScriptCheck[];
}

/** Chuyển giản ⇄ phồn bằng OpenCC. Với chiều giản → phồn, trả thêm các chữ có nhiều cách chuyển để người dùng kiểm tra lại. */
export function convertScript(text: string, mode: ScriptMode): ScriptResult {
  const input = text.slice(0, MAX_SCRIPT_CHARS);
  const output = converters[mode](input);
  const a = [...input];
  const b = [...output];
  const changed = a.length === b.length ? a.filter((ch, i) => ch !== b[i]).length : 0;
  const seen = new Set<string>();
  const check: ScriptCheck[] = [];
  if (mode !== "t2s") {
    for (const ch of a) {
      const options = AMBIGUOUS_SIMPLIFIED[ch];
      if (options && options.length > 0 && !seen.has(ch)) { seen.add(ch); check.push({ char: ch, options }); }
    }
  }
  return { output, changed, check };
}
