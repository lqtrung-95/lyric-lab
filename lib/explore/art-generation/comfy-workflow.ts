// Dựng workflow ComfyUI (định dạng API) cho sinh ảnh từ chữ với mô hình SDXL, tùy chọn kèm một LoRA (ví dụ LoRA pixel art).
// Đồ thị: checkpoint → (LoRA) → mã hóa prompt dương/âm → KSampler → giải mã VAE → lưu ảnh.

export interface WorkflowOptions {
  checkpoint: string;
  lora?: { name: string; strength: number };
  prompt: string;
  negative: string;
  width: number;
  height: number;
  seed: number;
  steps?: number;
  cfg?: number;
  sampler?: string;
  scheduler?: string;
  filenamePrefix: string;
}

type Link = [string, number];
export type ComfyWorkflow = Record<string, { class_type: string; inputs: Record<string, unknown> }>;

export function buildWorkflow(o: WorkflowOptions): ComfyWorkflow {
  const model: Link = o.lora ? ["2", 0] : ["1", 0];
  const clip: Link = o.lora ? ["2", 1] : ["1", 1];
  const wf: ComfyWorkflow = {
    "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: o.checkpoint } },
    "3": { class_type: "CLIPTextEncode", inputs: { text: o.prompt, clip } },
    "4": { class_type: "CLIPTextEncode", inputs: { text: o.negative, clip } },
    "5": { class_type: "EmptyLatentImage", inputs: { width: o.width, height: o.height, batch_size: 1 } },
    "6": {
      class_type: "KSampler",
      inputs: {
        model, positive: ["3", 0], negative: ["4", 0], latent_image: ["5", 0],
        seed: o.seed, steps: o.steps ?? 28, cfg: o.cfg ?? 6.5, sampler_name: o.sampler ?? "dpmpp_2m", scheduler: o.scheduler ?? "karras", denoise: 1,
      },
    },
    "7": { class_type: "VAEDecode", inputs: { samples: ["6", 0], vae: ["1", 2] } },
    "8": { class_type: "SaveImage", inputs: { images: ["7", 0], filename_prefix: o.filenamePrefix } },
  };
  if (o.lora) wf["2"] = { class_type: "LoraLoader", inputs: { model: ["1", 0], clip: ["1", 1], lora_name: o.lora.name, strength_model: o.lora.strength, strength_clip: o.lora.strength } };
  return wf;
}
