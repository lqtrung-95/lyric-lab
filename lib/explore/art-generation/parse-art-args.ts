// Đọc tham số dòng lệnh của `scripts/generate-explore-art.mts`. Tách riêng để test được.

export interface ArtArgs {
  comfy: string;
  checkpoint?: string;
  lora?: string;
  loraStrength: number;
  extra: string;
  seed: number;
  steps?: number;
  cfg?: number;
  only?: string[];
  variants: number;
  /** Độ nhạy (%) khi xóa nốt vùng trắng kẹt giữa các chi tiết (chân ghế...). 0 = tắt (mặc định) vì nó cũng đục thủng các vùng trắng hợp lệ như mắt, cốc sứ. */
  holeFuzz: number;
  /** Dung sai (%) khi loang màu nền từ bốn góc. Mô hình hay vẽ nền xám nhạt hoặc có sọc thay vì trắng tinh nên cần rộng; viền của vật ngăn không cho loang vào trong. */
  bgFuzz: number;
  /** Tách nền lại cho các ảnh thô đã có trong `--out/raw/` (không gọi ComfyUI). */
  recut: boolean;
  out: string;
  force: boolean;
  dryRun: boolean;
  /** Dạng `bed-v3`: chọn ứng viên đã tạo trong `--out/cut/` làm tranh chính thức, không cần gọi ComfyUI. */
  promote?: string;
  listModels: boolean;
  allowRemote: boolean;
}

const VALUE_FLAGS = new Set(["comfy", "checkpoint", "lora", "lora-strength", "extra", "seed", "steps", "cfg", "only", "variants", "hole-fuzz", "bg-fuzz", "promote", "out"]);
const BOOL_FLAGS = new Set(["recut", "force", "dry-run", "list-models", "allow-remote"]);

function num(name: string, raw: string | undefined, fallback: number | undefined): number | undefined {
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`--${name} phải là số, nhận "${raw}"`);
  return n;
}

export function parseArtArgs(argv: string[]): ArtArgs {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Error(`Tham số lạ: ${a}`);
    const name = a.slice(2);
    if (BOOL_FLAGS.has(name)) flags.add(name);
    else if (VALUE_FLAGS.has(name)) {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) throw new Error(`--${name} cần một giá trị`);
      values.set(name, v);
    } else throw new Error(`Tham số không biết: --${name}`);
  }
  const variants = num("variants", values.get("variants"), 1)!;
  if (!Number.isInteger(variants) || variants < 1 || variants > 8) throw new Error("--variants phải là số nguyên từ 1 đến 8");
  if (values.has("promote") && !/^[a-z0-9]+-v[1-8]$/.test(values.get("promote")!)) throw new Error("--promote có dạng id-vN, ví dụ bed-v3");
  const holeFuzz = num("hole-fuzz", values.get("hole-fuzz"), 0)!;
  if (holeFuzz < 0 || holeFuzz > 20) throw new Error("--hole-fuzz phải từ 0 đến 20");
  const bgFuzz = num("bg-fuzz", values.get("bg-fuzz"), 28)!;
  if (bgFuzz < 0 || bgFuzz > 50) throw new Error("--bg-fuzz phải từ 0 đến 50");
  return {
    comfy: values.get("comfy") ?? "http://127.0.0.1:8188",
    checkpoint: values.get("checkpoint"),
    lora: values.get("lora"),
    loraStrength: num("lora-strength", values.get("lora-strength"), 0.9)!,
    extra: values.get("extra") ?? "",
    seed: num("seed", values.get("seed"), 20261025)!,
    steps: num("steps", values.get("steps"), undefined),
    cfg: num("cfg", values.get("cfg"), undefined),
    only: values.get("only")?.split(",").map((s) => s.trim()).filter(Boolean),
    variants,
    holeFuzz,
    bgFuzz,
    recut: flags.has("recut"),
    out: values.get("out") ?? ".explore-art",
    promote: values.get("promote"),
    force: flags.has("force"),
    dryRun: flags.has("dry-run"),
    listModels: flags.has("list-models"),
    allowRemote: flags.has("allow-remote"),
  };
}
