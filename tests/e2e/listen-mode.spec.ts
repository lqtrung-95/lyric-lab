import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";
import { TERMS, WORDS, seedCards } from "./helpers/seed-cards";

// Nghe và chọn trên Supabase thật, dùng 6 từ của bài hư cấu 夜车. Giọng đọc được giả lập để ghi lại từ nào được phát.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

async function stubAudio(page: Page) {
  const requested: string[] = [];
  await page.route("**/api/tts**", (r) => { requested.push(decodeURIComponent(new URL(r.request().url()).searchParams.get("text") ?? "")); return r.fulfill({ status: 500, json: {} }); });
  return requested;
}

test.describe("Nghe và chọn", () => {
  let userId = "";
  const sb = serviceClientForTests();
  test.beforeEach(async ({ page }) => { await stubAudio(page); userId = await seedCards(page); });
  test.afterEach(async () => { if (userId) await sb.auth.admin.deleteUser(userId); userId = ""; });

  test("chọn chữ Hán: tự phát giọng đọc mỗi câu, phím R nghe lại, phím số để chọn, kết thúc có kết quả", async ({ page }) => {
    const requested = await stubAudio(page);
    await page.goto("/review/listen");
    await expect(page.getByRole("heading", { name: "Nghe và chọn", level: 1 })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: /Bắt đầu nghe \(6 câu\)/ }).click();

    const spokenSoFar = () => requested.at(-1)!;
    for (let i = 0; i < TERMS.length; i++) {
      await expect.poll(() => requested.length).toBeGreaterThanOrEqual(i + 1); // tự phát khi sang câu mới
      const term = spokenSoFar();
      expect(TERMS).toContain(term);
      const choices = page.getByRole("group", { name: "Các đáp án" }).getByRole("button");
      const texts = await choices.locator("[lang=zh]").allInnerTexts();
      expect(new Set(texts).size).toBe(texts.length);
      if (i === 0) {
        const before = requested.length;
        await page.keyboard.press("r"); // nghe lại
        await expect.poll(() => requested.length).toBeGreaterThan(before);
        await choices.filter({ hasNot: page.locator(`[lang=zh]:text-is("${term}")`) }).first().click(); // chọn sai
        await expect(page.getByRole("status")).toContainText("Chưa đúng.");
      } else if (i === 1) {
        await page.keyboard.press(String(texts.indexOf(term) + 1)); // phím số
        await expect(page.getByRole("status")).toContainText("Chính xác!");
      } else {
        await choices.filter({ has: page.locator(`[lang=zh]:text-is("${term}")`) }).click();
        await expect(page.getByRole("status")).toContainText("Chính xác!");
      }
      await page.getByRole("button", { name: /Câu tiếp theo|Xem kết quả/ }).click();
    }
    await expect(page.getByRole("heading", { name: "Xong lượt nghe và chọn" })).toBeVisible();
    await expect(page.getByText("Cần ôn lại")).toBeVisible();
  });

  test("chọn nghĩa: đáp án là nghĩa ngắn gọn, đúng từ vừa nghe", async ({ page }) => {
    const requested = await stubAudio(page);
    await page.goto("/review/listen");
    await page.getByLabel("Chọn nghĩa").check({ force: true });
    await page.getByRole("button", { name: /Bắt đầu nghe/ }).click();
    await expect.poll(() => requested.length).toBeGreaterThanOrEqual(1);
    const term = requested.at(-1)!;
    const choices = page.getByRole("group", { name: "Các đáp án" }).getByRole("button");
    await expect(choices).toHaveCount(4);
    await choices.filter({ hasText: WORDS[term].short }).first().click();
    await expect(page.getByRole("status")).toContainText("Chính xác!");
  });
});

test("chưa đủ thẻ: hướng dẫn lưu thêm từ", async ({ page }) => {
  await page.goto("/review/listen");
  await expect(page.getByRole("heading", { name: "Nghe và chọn", level: 1 })).toBeVisible();
  await expect(page.getByText(/Cần ít nhất 4 từ vựng đã lưu/)).toBeVisible();
});
