// Tạo cả bộ tranh vật cho cảnh Khám phá bằng ComfyUI chạy trên máy này (không gửi gì ra ngoài), tách nền trắng bằng ImageMagick rồi ghi vào
// `public/explore/ai/` và cập nhật `components/explore/art/ai-sprites.generated.json`.
//   Xem mô hình đang có:  npx tsx scripts/generate-explore-art.mts --list-models
//   In thử prompt:        npx tsx scripts/generate-explore-art.mts --checkpoint sd_xl_base_1.0.safetensors --dry-run
//   Tạo cả bộ:            npx tsx scripts/generate-explore-art.mts --checkpoint <ckpt> [--lora <lora> --lora-strength 0.9 --extra "pixel art"] [--only bed,cat] [--variants 3] [--force]
// Ảnh thô và ảnh đã tách nền lưu ở `--out` (mặc định `.explore-art/`, không commit). Mặc định không đè tranh đã có (cần --force); ứng viên đầu tiên của mỗi vật được dùng.
import { execFile } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { ASPECT_SIZE, buildPrompt, NEGATIVE, ROOM_ART_ITEMS } from "@/lib/explore/art-generation/art-prompts";
import { assertLoopback, ComfyClient, type FetchLike } from "@/lib/explore/art-generation/comfy-client";
import { buildWorkflow } from "@/lib/explore/art-generation/comfy-workflow";
import { parseArtArgs } from "@/lib/explore/art-generation/parse-art-args";

const run = promisify(execFile);
const PUBLIC_DIR = "public/explore/ai";
const MANIFEST = "components/explore/art/ai-sprites.generated.json";
const MAX_SIDE = 480; // đủ nét cho màn retina vì vật hiển thị chỉ ~100–250 px
const FUZZ = "9%";

/**
 * Tách nền trắng: tô trong suốt từ bốn góc (không đụng phần trắng bên trong vật) rồi cắt sát viền và thu nhỏ. `holeFuzz` > 0 xóa thêm mọi vùng gần trắng
 * còn lại, kể cả vùng kẹt giữa chân ghế, nhưng cũng đục thủng điểm sáng, lòng trắng mắt, cốc sứ nên mặc định tắt.
 */
async function cutout(input: string, output: string, width: number, height: number, holeFuzz: number): Promise<{ w: number; h: number }> {
  const holes = holeFuzz > 0 ? ["-fuzz", `${holeFuzz}%`, "-transparent", "white"] : [];
  const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
  const floods = corners.flatMap(([x, y]) => ["-floodfill", `+${x}+${y}`, "white"]);
  await run("magick", [input, "-alpha", "set", "-fuzz", FUZZ, "-fill", "none", ...floods, ...holes, "-trim", "+repage", "-resize", `${MAX_SIDE}x${MAX_SIDE}>`, "-bordercolor", "none", "-border", "4", output]);
  const { stdout } = await run("magick", ["identify", "-format", "%w %h", output]);
  const [w, h] = stdout.trim().split(" ").map(Number);
  return { w, h };
}

async function main(): Promise<void> {
  const args = parseArtArgs(process.argv.slice(2));
  assertLoopback(args.comfy, args.allowRemote);
  const client = new ComfyClient(args.comfy, fetch as unknown as FetchLike);

  if (args.listModels) {
    console.log("Checkpoint:", (await client.listCheckpoints()).join("\n  ") || "(không có: bỏ file .safetensors vào ComfyUI/models/checkpoints)");
    console.log("LoRA:", (await client.listLoras()).join("\n  ") || "(không có)");
    return;
  }
  if (!args.checkpoint) throw new Error("Thiếu --checkpoint. Chạy với --list-models để xem tên mô hình.");
  if (!args.checkpoint.endsWith(".safetensors")) console.warn("Cảnh báo: nên dùng file .safetensors (.ckpt có thể chứa mã độc).");

  const known = new Set(ROOM_ART_ITEMS.map((i) => i.id));
  for (const id of args.only ?? []) if (!known.has(id)) throw new Error(`Không có vật "${id}". Có: ${[...known].join(", ")}`);
  const items = ROOM_ART_ITEMS.filter((i) => !args.only || args.only.includes(i.id));

  for (const sub of ["raw", "cut"]) mkdirSync(join(args.out, sub), { recursive: true });
  mkdirSync(PUBLIC_DIR, { recursive: true });
  const manifest: Record<string, { src: string; ratio: number }> = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const clientId = `songhanzi-art-${Date.now()}`;
  const failed: string[] = [];

  for (const item of items) {
    const target = join(PUBLIC_DIR, `${item.id}.png`);
    if (existsSync(target) && !args.force && !args.dryRun) { console.log(`- ${item.id}: đã có tranh, bỏ qua (dùng --force để tạo lại)`); continue; }
    const { width, height } = ASPECT_SIZE[item.aspect];
    const prompt = buildPrompt(item, args.extra);
    for (let v = 1; v <= args.variants; v++) {
      const tag = `${item.id}-v${v}`;
      if (args.dryRun) { console.log(`[thử] ${tag} ${width}x${height} seed=${args.seed + v - 1}\n  ${prompt}`); continue; }
      try {
        const wf = buildWorkflow({
          checkpoint: args.checkpoint, lora: args.lora ? { name: args.lora, strength: args.loraStrength } : undefined,
          prompt, negative: NEGATIVE, width, height, seed: args.seed + v - 1, steps: args.steps, cfg: args.cfg, filenamePrefix: `songhanzi/${tag}`,
        });
        const [img] = await client.waitForImages(await client.queue(wf, clientId));
        const raw = join(args.out, "raw", `${tag}.png`);
        writeFileSync(raw, await client.download(img));
        const cut = join(args.out, "cut", `${tag}.png`);
        const size = await cutout(raw, cut, width, height, args.holeFuzz);
        console.log(`✓ ${tag} → ${cut} (${size.w}x${size.h})`);
        if (v === 1) {
          copyFileSync(cut, target);
          manifest[item.id] = { src: `/explore/ai/${item.id}.png`, ratio: Math.round((size.w / size.h) * 10000) / 10000 };
          writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
        }
      } catch (e) {
        failed.push(tag);
        console.error(`✗ ${tag}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }
  console.log(failed.length ? `Xong, lỗi ${failed.length}: ${failed.join(", ")}` : "Xong. Mở /kham-pha/phong, chọn Tranh A và chỉnh `SCALES` trong components/explore/art/scene-art.ts nếu vật to/nhỏ chưa vừa.");
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(`Lỗi: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
