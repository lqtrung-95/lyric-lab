import type { CaptionLine } from "@/lib/captions/caption-provider-types";

export interface ChunkResult { lines: CaptionLine[]; chunkCount: number }

/**
 * Chạy lần lượt các đoạn nhận dạng của một video: đoạn 0 trước (cho biết tổng số đoạn), các đoạn còn lại song song `concurrency` đoạn một lúc.
 * Mỗi đoạn thử lại `retries` lần khi lỗi `isRetryable` (AI quá tải thường qua đi sau vài giây; hết hạn mức thì thử lại vô ích). Ném lỗi của đoạn hỏng sau khi hết lượt thử; thành công thì trả mọi dòng đã sắp theo giờ.
 */
export async function collectChunks(
  fetchChunk: (index: number) => Promise<ChunkResult>,
  onProgress: (done: number, total: number) => void,
  { concurrency = 2, retries = 1, retryDelayMs = 3000, isRetryable = () => true }: { concurrency?: number; retries?: number; retryDelayMs?: number; isRetryable?: (error: unknown) => boolean } = {},
): Promise<CaptionLine[]> {
  const withRetry = async (index: number): Promise<ChunkResult> => {
    for (let attempt = 0; ; attempt++) {
      try { return await fetchChunk(index); } catch (error) {
        if (attempt >= retries || !isRetryable(error)) throw error;
        await new Promise((r) => setTimeout(r, retryDelayMs));
      }
    }
  };
  const first = await withRetry(0);
  const total = first.chunkCount;
  const all: CaptionLine[] = [...first.lines];
  let done = 1;
  onProgress(done, total);
  let next = 1;
  let failure: unknown = null;
  const worker = async () => {
    while (failure === null) {
      const index = next++;
      if (index >= total) return;
      try {
        all.push(...(await withRetry(index)).lines);
        onProgress(++done, total);
      } catch (error) {
        failure = error;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(0, total - 1)) }, worker));
  if (failure !== null) throw failure;
  return all.sort((a, b) => a.start - b.start);
}
