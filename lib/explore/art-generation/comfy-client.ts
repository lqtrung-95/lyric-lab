import type { ComfyWorkflow } from "./comfy-workflow";

// Client tối thiểu cho API HTTP của ComfyUI: đưa workflow vào hàng đợi, chờ xong, tải ảnh về. `fetch` được truyền vào để test không cần ComfyUI thật.

export type FetchLike = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown>; arrayBuffer(): Promise<ArrayBuffer>; text(): Promise<string> }>;

/** Chỉ cho phép gọi tới máy này (loopback) trừ khi người dùng chủ động cho phép: prompt và ảnh không nên đi qua mạng ngoài ý muốn. */
export function assertLoopback(url: string, allowRemote: boolean): void {
  const host = new URL(url).hostname;
  const local = host === "127.0.0.1" || host === "localhost" || host === "[::1]" || host === "::1";
  if (!local && !allowRemote) throw new Error(`Địa chỉ ComfyUI "${host}" không phải máy này. Thêm --allow-remote nếu bạn thật sự muốn dùng máy từ xa.`);
}

interface HistoryImage { filename: string; subfolder: string; type: string }

export class ComfyClient {
  constructor(private readonly base: string, private readonly fetchFn: FetchLike, private readonly sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))) {}

  private url(path: string): string { return `${this.base.replace(/\/$/, "")}${path}`; }

  /** Tên các checkpoint đang có trong ComfyUI (thư mục models/checkpoints). */
  async listCheckpoints(): Promise<string[]> { return this.listChoices("CheckpointLoaderSimple", "ckpt_name"); }
  /** Tên các LoRA đang có (thư mục models/loras). */
  async listLoras(): Promise<string[]> { return this.listChoices("LoraLoader", "lora_name"); }

  private async listChoices(node: string, field: string): Promise<string[]> {
    const res = await this.fetchFn(this.url(`/object_info/${node}`));
    if (!res.ok) throw new Error(`ComfyUI trả ${res.status} khi hỏi danh sách ${field}`);
    const data = (await res.json()) as Record<string, { input?: { required?: Record<string, [string[]]> } }>;
    return data[node]?.input?.required?.[field]?.[0] ?? [];
  }

  /** Đưa một workflow vào hàng đợi, trả `prompt_id`. Lỗi workflow (thiếu mô hình, sai tên...) được ném kèm lý do của ComfyUI. */
  async queue(workflow: ComfyWorkflow, clientId: string): Promise<string> {
    const res = await this.fetchFn(this.url("/prompt"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: workflow, client_id: clientId }) });
    if (!res.ok) throw new Error(`ComfyUI từ chối workflow (${res.status}): ${(await res.text()).slice(0, 600)}`);
    const data = (await res.json()) as { prompt_id?: string };
    if (!data.prompt_id) throw new Error("ComfyUI không trả prompt_id");
    return data.prompt_id;
  }

  /** Chờ workflow chạy xong (hỏi lịch sử mỗi `intervalMs`); trả danh sách ảnh đầu ra. Quá `timeoutMs` thì báo lỗi. */
  async waitForImages(promptId: string, timeoutMs = 10 * 60_000, intervalMs = 1000): Promise<HistoryImage[]> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const res = await this.fetchFn(this.url(`/history/${encodeURIComponent(promptId)}`));
      if (!res.ok) throw new Error(`ComfyUI trả ${res.status} khi đọc lịch sử`);
      const entry = ((await res.json()) as Record<string, { outputs?: Record<string, { images?: HistoryImage[] }>; status?: { status_str?: string; messages?: unknown } }>)[promptId];
      if (entry?.status?.status_str === "error") throw new Error(`ComfyUI báo lỗi khi chạy: ${JSON.stringify(entry.status.messages).slice(0, 600)}`);
      const images = Object.values(entry?.outputs ?? {}).flatMap((o) => o.images ?? []);
      if (images.length > 0) return images;
      await this.sleep(intervalMs);
    }
    throw new Error(`Quá ${Math.round(timeoutMs / 1000)} giây mà ComfyUI chưa trả ảnh`);
  }

  async download(img: HistoryImage): Promise<Buffer> {
    const q = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder, type: img.type });
    const res = await this.fetchFn(this.url(`/view?${q}`));
    if (!res.ok) throw new Error(`Không tải được ảnh ${img.filename} (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  }
}
