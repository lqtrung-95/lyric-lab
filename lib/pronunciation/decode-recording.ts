// Giải mã bản ghi của trình duyệt (WebM/Opus, MP4/AAC...) thành mẫu âm thanh mono để phân tích cao độ ngay trên máy. Chỉ chạy ở client.
const ANALYSIS_RATE = 16_000;
/** Bản ghi một âm tiết/một từ ngắn: cắt bớt phần dài hơn mức này (giây) cho nhẹ máy. */
const MAX_SECONDS = 4;

export async function blobToMono(blob: Blob): Promise<{ samples: Float32Array; sampleRate: number }> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const seconds = Math.min(decoded.duration, MAX_SECONDS);
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(seconds * ANALYSIS_RATE)), ANALYSIS_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return { samples: rendered.getChannelData(0), sampleRate: ANALYSIS_RATE };
  } finally {
    void ctx.close();
  }
}
