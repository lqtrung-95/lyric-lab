import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Đợt 3: lộ trình, bài tập hằng ngày, thử thách 绕口令. Micro/giải mã/API chấm được giả lập.
const RESULT = { overall: 88, completeness: 100, fluency: 100, syllables: [{ han: "四", pinyin: "sì", base: "si", score: 88, error: "none" }] };
const a11y = async (page: import("@playwright/test").Page) => {
  await page.waitForTimeout(500);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations.map((v) => v.id + ": " + v.nodes[0]?.html)).toEqual([]);
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
    (window as unknown as { AudioContext: unknown }).AudioContext = class { decodeAudioData() { return Promise.resolve({ duration: 1 }); } close() { return Promise.resolve(); } };
    (window as unknown as { OfflineAudioContext: unknown }).OfflineAudioContext = class {
      destination = {}; createBufferSource() { return { connect() {}, start() {}, buffer: null }; }
      startRendering() { return Promise.resolve({ getChannelData: () => new Float32Array(16000) }); }
    };
  });
  await page.route("**/api/pronunciation-assess", (route) => route.fulfill({ json: RESULT }));
  await page.route("**/api/tts**", (route) => route.fulfill({ status: 503, json: { error: "tts_not_configured" } }));
});

test("lộ trình: đánh dấu bước xong, đếm tiến độ và giữ sau khi tải lại", async ({ page }) => {
  await page.goto("/phat-am/lo-trinh");
  await expect(page.getByText(/Đã xong/)).toContainText("0/6");
  await page.getByRole("button", { name: "Đánh dấu đã xong" }).first().click();
  await expect(page.getByText(/Đã xong/)).toContainText("1/6");
  await page.reload();
  await expect(page.getByText(/Đã xong/)).toContainText("1/6");
  await a11y(page);
});

test("bài tập hằng ngày: đi hết 3 bước thì ra chuỗi 1 ngày", async ({ page }) => {
  await page.goto("/phat-am/luyen-moi-ngay");
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: /^Thanh 1/ }).click();
    await page.getByRole("button", { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  await page.getByRole("button", { name: "Sang bước tiếp" }).click();
  await page.getByRole("button", { name: "Sang bước tiếp" }).click();
  await a11y(page);
  await page.getByRole("button", { name: "Hoàn thành hôm nay" }).click();
  await expect(page.getByTestId("drill-done")).toContainText("1 ngày liên tiếp");
  await page.reload();
  await expect(page.getByText(/Chuỗi hiện tại: 1 ngày/)).toBeVisible();
});

test("thử thách 绕口令: chấm điểm, lưu điểm cao nhất và tạo ảnh chia sẻ", async ({ page }) => {
  await page.goto("/phat-am/rao-khau-lenh");
  await page.getByRole("button", { name: "Ghi âm và chấm điểm" }).click();
  await page.getByRole("button", { name: "Bấm để dừng và chấm" }).click();
  await expect(page.getByRole("status").filter({ hasText: /Lần này/ })).toContainText("88");
  await expect(page.getByRole("button", { name: /tốt nhất 88/ })).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Chia sẻ điểm" }).click()]);
  expect(download.suggestedFilename()).toBe("songhanzi-rao-khau-lenh.png");
  await a11y(page);
});
