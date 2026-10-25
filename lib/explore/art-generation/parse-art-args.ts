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
  out: string;
  force: boolean;
  dryRun: boolean;
  listModels: boolean;
  allowRemote: boolean;
}

const VALUE_FLAGS = new Set(["comfy", "checkpoint", "lora", "lora-strength", "extra", "seed", "steps", "cfg", "only", "variants", "hole-fuzz", "out"]);
const BOOL_FLAGS = new Set(["force", "dry-run", "list-models", "allow-remote"]);

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
  const holeFuzz = num("hole-fuzz", values.get("hole-fuzz"), 0)!;
  if (holeFuzz < 0 || holeFuzz > 20) throw new Error("--hole-fuzz phải từ 0 đến 20");
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
    out: values.get("out") ?? ".explore-art",
    force: flags.has("force"),
    dryRun: flags.has("dry-run"),
    listModels: flags.has("list-models"),
    allowRemote: flags.has("allow-remote"),
  };
}
