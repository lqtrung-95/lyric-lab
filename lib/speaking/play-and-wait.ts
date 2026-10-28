import { isChineseAudioBusy, playChinese, stopChinese } from "@/lib/speech/play-chinese";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Đọc một câu và chờ đọc xong (giọng AI hoặc giọng thiết bị) rồi mới trả về, để bật micro đúng lúc câu hỏi kết thúc. Quá `capMs` thì thôi chờ. */
export async function playAndWait(text: string, capMs = 12_000): Promise<void> {
  await playChinese(text);
  const until = Date.now() + capMs;
  await sleep(150);
  while (isChineseAudioBusy() && Date.now() < until) await sleep(120);
}

export { stopChinese };
