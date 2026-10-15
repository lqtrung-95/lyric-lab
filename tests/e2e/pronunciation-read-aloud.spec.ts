import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Đọc to chấm từng chữ: micro và API chấm đều được giả lập (DSP và chuẩn hóa đã có unit test).
const RESULT = {
  overall: 70, completeness: 80, fluency: 100,
  syllables: [
    { han: "我", pinyin: "wǒ", base: "wo", score: 90, error: "none" },
    { han: "喜", pinyin: "xǐ", base: "xi", score: 65, error: "none" },
    { han: "听", pinyin: "tīng", base: "ting", score: 30, error: "mispronunciation" },
    { han: "歌", pinyin: "", base: "", score: 0, error: "omission" },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class FakeRecorder {
      mimeType = "audio/webm"; ondataavailable: ((e: { data: Blob }) => void) | null = null; onstop: (() => void) | null = null;
      static isTypeSupported() { return true; }
      start() {} stop() { this.ondataavailable?.({ data: new Blob([new Uint8Array(10)]) }); this.onstop?.(); }
    }
    (window as unknown as { MediaRecorder: unknown }).MediaRecorder = FakeRecorder;
    navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [] }) as unknown as MediaStream;
    // Giải mã giả: 1 giây im lặng
    (window as unknown as { AudioContext: unknown }).AudioContext = class { decodeAudioData() { return Promise.resolve({ duration: 1, length: 16000, numberOfChannels: 1, sampleRate: 16000, getChannelData: () => new Float32Array(16000) }); } close() { return Promise.resolve(); } };
    (window as unknown as { OfflineAudioContext: unknown }).OfflineAudioContext = class {
      destination = {}; createBufferSource() { return { connect() {}, start() {}, buffer: null }; }
      startRendering() { return Promise.resolve({ getChannelData: () => new Float32Array(16000) }); }
    };
  });
});

test("ghi âm → gửi câu mẫu → hiện điểm từng chữ, mức chữ, thiếu chữ và gợi ý sửa", async ({ page }) => {
  let sent: { text?: string; audio?: string } = {};
  await page.route("**/api/pronunciation-assess", async (route) => { sent = route.request().postDataJSON(); await route.fulfill({ json: RESULT }); });
  await page.goto("/phat-am/doc-to-cham-diem");
  await page.getByLabel("Hoặc tự nhập câu (tối đa 40 chữ Hán)").fill("我喜欢听歌");
  await page.getByRole("button", { name: "Ghi âm và chấm điểm" }).click();
  await page.getByRole("button", { name: "Bấm để dừng và chấm" }).click();
  const result = page.getByTestId("assess-result");
  await expect(result).toBeVisible();
  expect(sent.text).toBe("我喜欢听歌");
  await expect(result.getByLabel("Điểm từng chữ").getByRole("listitem")).toHaveCount(4);
  await expect(result).toContainText("90 · tốt");
  await expect(result).toContainText("65 · tạm được");
  await expect(result).toContainText("30 · cần luyện");
  await expect(result).toContainText("thiếu");
  await expect(result).toContainText("Gợi ý sửa");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations.map((v) => v.id + ": " + v.nodes[0]?.html)).toEqual([]);
});

test("hết lượt chấm thì báo; câu không có chữ Hán thì khóa nút", async ({ page }) => {
  await page.route("**/api/pronunciation-assess", (route) => route.fulfill({ status: 429, json: { error: "rate_limited" } }));
  await page.goto("/phat-am/doc-to-cham-diem");
  await page.getByRole("button", { name: "Ghi âm và chấm điểm" }).click();
  await page.getByRole("button", { name: "Bấm để dừng và chấm" }).click();
  await expect(page.getByText(/hết lượt chấm/)).toBeVisible();
  await page.getByLabel(/Hoặc tự nhập câu/).fill("hello");
  await expect(page.getByRole("button", { name: "Ghi âm và chấm điểm" })).toBeDisabled();
});
