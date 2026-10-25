export interface PlaySequenceDeps {
  play: (text: string) => Promise<void>;
  /** Giọng đang phát? `playChinese` trả về ngay khi bắt đầu phát nên phải hỏi lại để biết khi nào xong. */
  isBusy: () => boolean;
  sleep: (ms: number) => Promise<void>;
  shouldStop: () => boolean;
  onStep?: (index: number) => void;
}

const POLL_MS = 150;
const MAX_WAIT_MS = 6000;
const GAP_MS = 350;

/** Đọc lần lượt các từ, chờ từng từ đọc xong (tối đa 6 giây mỗi từ), dừng ngay khi `shouldStop()` trả true. */
export async function playSequence(texts: string[], deps: PlaySequenceDeps): Promise<void> {
  for (let i = 0; i < texts.length; i++) {
    if (deps.shouldStop()) return;
    deps.onStep?.(i);
    await deps.play(texts[i]);
    let waited = 0;
    // Cho giọng kịp bắt đầu rồi mới coi "không bận" là đã xong.
    await deps.sleep(POLL_MS);
    while (deps.isBusy() && waited < MAX_WAIT_MS && !deps.shouldStop()) { await deps.sleep(POLL_MS); waited += POLL_MS; }
    await deps.sleep(GAP_MS);
  }
}
