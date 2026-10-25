import { describe, expect, it } from "vitest";
import { ROOM_SCENE } from "../scenes/room-scene";
import { ASPECT_SIZE, buildNegative, buildPrompt, NEGATIVE, ROOM_ART_ITEMS, STYLE } from "./art-prompts";
import { assertLoopback, ComfyClient, type FetchLike } from "./comfy-client";
import { buildWorkflow } from "./comfy-workflow";
import { parseArtArgs } from "./parse-art-args";

describe("art-prompts", () => {
  it("mọi vật trong cảnh đều có prompt (cộng nhân vật dẫn đường), không trùng id", () => {
    const ids = ROOM_ART_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const o of ROOM_SCENE.objects) expect(ids, o.id).toContain(o.id);
    expect(ids).toContain("guide");
  });

  it("prompt gồm mô tả vật, phong cách chung và phần thêm; kích thước theo khung hình", () => {
    const item = ROOM_ART_ITEMS.find((i) => i.id === "door")!;
    const p = buildPrompt(item, " pixel art ");
    expect(p.startsWith(item.subject)).toBe(true);
    expect(p).toContain(STYLE);
    expect(p.endsWith("pixel art")).toBe(true);
    expect(buildPrompt(item)).not.toContain(",,");
    expect(ASPECT_SIZE[item.aspect]).toEqual({ width: 832, height: 1216 });
    expect(NEGATIVE).toContain("watermark");
    // phủ định chỉ ở prompt âm: prompt dương mà có "no shadow" sẽ vô tình vẽ ra bóng
    expect(STYLE).not.toMatch(/\bno\b|without/i);
    expect(NEGATIVE).toContain("shadow");
    expect(buildNegative(ROOM_ART_ITEMS.find((i) => i.id === "table")!)).toContain("chairs");
    expect(buildNegative(ROOM_ART_ITEMS.find((i) => i.id === "bed")!)).toBe(NEGATIVE);
  });
});

describe("buildWorkflow", () => {
  const base = { checkpoint: "sdxl.safetensors", prompt: "p", negative: "n", width: 1024, height: 1024, seed: 7, filenamePrefix: "x/bed-v1" };

  it("không có LoRA: sampler lấy mô hình và clip thẳng từ checkpoint", () => {
    const wf = buildWorkflow(base);
    expect(wf["2"]).toBeUndefined();
    expect(wf["6"].inputs.model).toEqual(["1", 0]);
    expect(wf["3"].inputs.clip).toEqual(["1", 1]);
    expect(wf["6"].inputs).toMatchObject({ seed: 7, steps: 28, cfg: 6.5 });
    expect(wf["8"].inputs.filename_prefix).toBe("x/bed-v1");
  });

  it("có LoRA: mô hình và clip đi qua LoRA", () => {
    const wf = buildWorkflow({ ...base, lora: { name: "pixel.safetensors", strength: 0.8 } });
    expect(wf["2"].inputs).toMatchObject({ lora_name: "pixel.safetensors", strength_model: 0.8, strength_clip: 0.8 });
    expect(wf["6"].inputs.model).toEqual(["2", 0]);
    expect(wf["4"].inputs.clip).toEqual(["2", 1]);
  });
});

describe("parseArtArgs", () => {
  it("giá trị mặc định và các cờ", () => {
    const a = parseArtArgs(["--checkpoint", "a.safetensors", "--only", "bed, cat", "--variants", "3", "--force", "--dry-run"]);
    expect(a).toMatchObject({ comfy: "http://127.0.0.1:8188", checkpoint: "a.safetensors", only: ["bed", "cat"], variants: 3, force: true, dryRun: true, loraStrength: 0.9, holeFuzz: 0, bgFuzz: 28, recut: false, out: ".explore-art" });
  });

  it("từ chối tham số lạ, thiếu giá trị, số sai", () => {
    expect(() => parseArtArgs(["--khong-co"])).toThrow(/không biết/);
    expect(() => parseArtArgs(["--seed"])).toThrow(/cần một giá trị/);
    expect(() => parseArtArgs(["--seed", "abc"])).toThrow(/phải là số/);
    expect(() => parseArtArgs(["--variants", "0"])).toThrow(/từ 1 đến 8/);
    expect(() => parseArtArgs(["bed"])).toThrow(/Tham số lạ/);
    expect(() => parseArtArgs(["--hole-fuzz", "50"])).toThrow(/0 đến 20/);
    expect(() => parseArtArgs(["--bg-fuzz", "80"])).toThrow(/0 đến 50/);
    expect(() => parseArtArgs(["--promote", "bed"])).toThrow(/id-vN/);
    expect(parseArtArgs(["--recut", "--bg-fuzz", "20"])).toMatchObject({ recut: true, bgFuzz: 20 });
    expect(parseArtArgs(["--promote", "bed-v3"]).promote).toBe("bed-v3");
  });
});

describe("assertLoopback", () => {
  it("cho phép máy này, chặn máy khác trừ khi cho phép rõ ràng", () => {
    expect(() => assertLoopback("http://127.0.0.1:8188", false)).not.toThrow();
    expect(() => assertLoopback("http://localhost:8188", false)).not.toThrow();
    expect(() => assertLoopback("http://192.168.1.50:8188", false)).toThrow(/--allow-remote/);
    expect(() => assertLoopback("http://192.168.1.50:8188", true)).not.toThrow();
  });
});

describe("ComfyClient", () => {
  const res = (body: unknown, ok = true, status = 200) => ({ ok, status, json: async () => body, text: async () => (typeof body === "string" ? body : JSON.stringify(body)), arrayBuffer: async () => new TextEncoder().encode("PNGDATA").buffer as ArrayBuffer });

  it("đưa vào hàng đợi, chờ tới khi có ảnh, rồi tải về", async () => {
    let polls = 0;
    const calls: string[] = [];
    const fetchFn: FetchLike = async (url, init) => {
      calls.push(`${init?.method ?? "GET"} ${url}`);
      if (url.endsWith("/prompt")) return res({ prompt_id: "abc" });
      if (url.includes("/history/abc")) return res(++polls < 3 ? {} : { abc: { outputs: { "8": { images: [{ filename: "a.png", subfolder: "songhanzi", type: "output" }] } }, status: { status_str: "success" } } });
      if (url.includes("/view?")) return res("x");
      return res({}, false, 404);
    };
    const c = new ComfyClient("http://127.0.0.1:8188/", fetchFn, async () => undefined);
    const id = await c.queue({}, "cid");
    expect(id).toBe("abc");
    const images = await c.waitForImages(id, 5000, 0);
    expect(images).toHaveLength(1);
    expect(polls).toBe(3);
    expect((await c.download(images[0])).toString()).toBe("PNGDATA");
    expect(calls.at(-1)).toContain("filename=a.png");
    expect(calls[0]).toBe("POST http://127.0.0.1:8188/prompt");
  });

  it("workflow bị từ chối hoặc chạy lỗi thì báo lý do; liệt kê mô hình", async () => {
    const reject: FetchLike = async () => res({ error: "ckpt_name không có" }, false, 400);
    await expect(new ComfyClient("http://x", reject).queue({}, "c")).rejects.toThrow(/400.*ckpt_name/);
    const fail: FetchLike = async () => res({ p: { status: { status_str: "error", messages: ["hết bộ nhớ"] } } });
    await expect(new ComfyClient("http://x", fail, async () => undefined).waitForImages("p", 1000, 0)).rejects.toThrow(/hết bộ nhớ/);
    const info: FetchLike = async () => res({ CheckpointLoaderSimple: { input: { required: { ckpt_name: [["a.safetensors", "b.safetensors"]] } } } });
    expect(await new ComfyClient("http://x", info).listCheckpoints()).toEqual(["a.safetensors", "b.safetensors"]);
  });
});
