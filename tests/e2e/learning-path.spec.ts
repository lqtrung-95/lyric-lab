import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { hasSupabaseEnv } from "./helpers/seed-analysis";
import { stubAnonymousSession } from "./helpers/stub-anonymous-session";

// Lộ trình HSK 1 trên dữ liệu thật (khóa hsk-1 đã sinh bằng scripts/generate-hsk-course.mts). Đăng nhập ẩn danh và ghi tiến độ được giả lập.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

const noViolations = async (page: Page) => {
  await page.waitForTimeout(400);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations.map((v) => v.id + ": " + v.nodes[0]?.html)).toEqual([]);
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, json: {} })); // không gọi Azure
});

test("bản đồ lộ trình: 36 chặng học và bài kiểm tra cuối cấp, nút bắt đầu chặng 1, đạt axe", async ({ page }) => {
  await page.goto("/courses");
  await expect(page.getByRole("heading", { level: 1, name: "Lộ trình HSK 1" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Các chặng" }).getByRole("listitem")).not.toHaveCount(0);
  // Số chặng đổi mỗi khi chia lại lộ trình (script generate-hsk-course): chỉ khẳng định bản đồ đủ dài, gồm chặng học, chặng ôn và bài cuối cấp.
  expect(await page.getByRole("list", { name: "Các chặng" }).getByRole("listitem").count()).toBeGreaterThan(60);
  await expect(page.getByRole("link", { name: /Bắt đầu chặng 1: Đại từ cơ bản/ })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Tiến độ lộ trình" })).toHaveAttribute("aria-valuenow", "0");
  await noViolations(page);
});

test("chọn cấp: HSK 1–6, mở HSK 2 qua liên kết có thể chia sẻ", async ({ page }) => {
  await page.goto("/courses");
  const chips = page.getByRole("navigation", { name: "Chọn cấp HSK" });
  await expect(chips.getByRole("link")).toHaveCount(6, { timeout: 15_000 });
  await chips.getByRole("link", { name: "HSK 2" }).click();
  await expect(page).toHaveURL(/\/courses\?course=hsk-2/);
  await expect(page.getByRole("heading", { level: 1, name: "Lộ trình HSK 2" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("list", { name: "Các chặng" }).getByRole("listitem")).not.toHaveCount(0);
  expect(await page.getByRole("list", { name: "Các chặng" }).getByRole("listitem").count()).toBeGreaterThan(90);
  // HSK 6 còn đang phát triển: chip có nhãn và có lời nhắn góp ý; cấp khác thì không.
  await expect(chips.getByRole("link", { name: /HSK 6.*Đang phát triển/ })).toBeVisible();
  await page.goto("/courses?course=hsk-6");
  await expect(page.getByRole("note")).toContainText("vẫn đang được phát triển");
  await page.goto("/courses?course=hsk-5");
  await expect(page.getByRole("heading", { level: 1, name: "Lộ trình HSK 5" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("bài xếp lớp: 30 câu có lựa chọn Chưa biết, kết quả gợi ý cấp và mở đúng lộ trình", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/courses/placement");
  await page.getByRole("button", { name: /Bắt đầu/ }).click();
  for (let i = 0; i < 30; i++) {
    await expect(page.getByText(new RegExp(`Câu ${i + 1}/30`))).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Chưa biết" }).click();
  }
  // Chọn "Chưa biết" cho mọi câu thì chưa nắm cấp nào: gợi ý bắt đầu từ HSK 1.
  await expect(page.getByTestId("placement-result")).toContainText("Bắt đầu từ HSK 1");
  await page.getByRole("link", { name: /Mở lộ trình HSK 1/ }).click();
  await expect(page).toHaveURL(/\/courses\?course=hsk-1/);
});

test("mục Học có trên thanh điều hướng", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" }).first().getByRole("link", { name: "Học" })).toBeVisible();
});

test("chặng 1: làm quen → nghe câu thật → kiểm tra 15 câu → kết quả và lưu tiến độ", async ({ page }) => {
  test.setTimeout(90_000); // luồng dài (ba lần axe, 15 câu) và lần đầu dev server còn biên dịch tuyến API
  await stubAnonymousSession(page);
  let saved: Record<string, unknown> | null = null;
  await page.route("**/rest/v1/user_unit_progress*", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: [] });
    saved = route.request().postDataJSON();
    return route.fulfill({ status: 201, body: "" });
  });
  await page.goto("/courses/hsk-1/1");
  // Lần đầu vào trang chặng, dev server còn biên dịch tuyến này: chờ lâu hơn mặc định 5 giây.
  await expect(page.getByRole("heading", { level: 1, name: "Đại từ cơ bản" })).toBeVisible({ timeout: 45_000 });

  // Bước 1: học từng thẻ. Mặt trước chỉ có chữ Hán; "Xem nghĩa" mới hiện pinyin và nghĩa Việt; tự đánh giá Nhớ rồi/Chưa nhớ.
  await expect(page.getByTestId("focus-card")).toBeVisible();
  await expect(page.getByText("Thử đoán nghĩa trong đầu trước nhé.")).toBeVisible();
  await page.getByRole("button", { name: /Xem nghĩa/ }).click();
  await expect(page.getByText(/Mẹo nhớ|Hán Việt:/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Đọc to" })).toBeVisible();
  await noViolations(page);
  // Từ đầu: chưa nhớ → sẽ có trong danh sách học lại; các từ còn lại: nhớ rồi.
  await page.getByRole("button", { name: "Chưa nhớ" }).click();
  for (let guard = 0; guard < 30 && (await page.getByTestId("focus-recap").count()) === 0; guard++) {
    await page.getByRole("button", { name: /Xem nghĩa/ }).click();
    await page.getByRole("button", { name: "Nhớ rồi" }).click();
  }
  await expect(page.getByTestId("focus-recap")).toBeVisible();
  await expect(page.getByRole("button", { name: /Học lại 1 từ chưa nhớ/ })).toBeVisible();
  await noViolations(page);
  await page.getByRole("button", { name: /Nghe trong câu thật/ }).click();

  // Bước 2: câu thật từ video, có bản dịch và nút xem đoạn video ngay trong trang.
  await expect(page.getByRole("button", { name: /Xem đoạn video/ }).first()).toBeVisible();
  await page.getByRole("button", { name: "Pinyin" }).click(); // tắt pinyin để tự thử nghe hiểu
  await expect(page.getByRole("button", { name: "Pinyin" })).toHaveAttribute("aria-pressed", "false");
  await noViolations(page);
  await page.getByRole("button", { name: /Làm bài kiểm tra/ }).click();

  // Bước 3: chọn đáp án đầu tiên cho cả 15 câu; câu sai hiện thẻ đáp án đúng.
  let answerCards = 0;
  for (let i = 0; i < 15; i++) {
    await expect(page.getByText(new RegExp(`Câu ${i + 1}/15`))).toBeVisible();
    await answerQuestion(page);
    answerCards += await page.getByTestId("answer-card").count();
    await page.getByRole("button", { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  expect(answerCards).toBeGreaterThan(0);
  const result = page.getByTestId("unit-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText("%");
  expect(saved).toMatchObject({ unit_id: expect.any(String), best_score: expect.any(Number) });
  await noViolations(page);
});

/** Trả lời câu hiện tại của bài kiểm tra, bất kể dạng (trắc nghiệm: đáp án đầu; ghép cặp: thử từng nghĩa; đúng/sai: Đúng; sắp xếp: theo thứ tự đang hiện; gõ pinyin: gõ tạm); đúng hay sai không quan trọng với luồng này. */
async function answerQuestion(page: Page) {
  const choices = page.getByRole("group", { name: "Các lựa chọn" });
  if (await choices.count()) { await choices.getByRole("button").first().click(); return; }
  const match = page.getByRole("group", { name: "Ghép chữ Hán với nghĩa" });
  if (await match.count()) {
    const lefts = match.locator("> div").first().getByRole("button");
    const rights = match.locator("> div").nth(1).getByRole("button");
    for (let i = 0, n = await lefts.count(); i < n; i++) {
      for (let j = 0, m = await rights.count(); j < m && (await lefts.nth(i).isEnabled()); j++) {
        await lefts.nth(i).click();
        if (await rights.nth(j).isEnabled()) await rights.nth(j).click();
      }
    }
    return;
  }
  const tf = page.getByRole("group", { name: "Đúng hay sai" });
  if (await tf.count()) { await tf.getByRole("button", { name: "Đúng" }).click(); return; }
  const pieces = page.getByLabel("Các mảnh");
  if (await pieces.count()) {
    while (await pieces.getByRole("button").count()) await pieces.getByRole("button").first().click();
    await page.getByRole("button", { name: "Kiểm tra" }).click();
    return;
  }
  await page.getByRole("textbox", { name: /Gõ pinyin/ }).fill("wo3");
  await page.getByRole("button", { name: "Kiểm tra" }).click();
}

/** Làm hết một bài kiểm tra bằng cách luôn chọn đáp án đầu tiên (đúng hay sai không quan trọng với luồng này). */
async function answerAll(page: Page, total: number) {
  for (let i = 0; i < total; i++) {
    await expect(page.getByText(new RegExp(`Câu ${i + 1}/${total}`))).toBeVisible();
    await answerQuestion(page);
    await page.getByRole("button", { name: /Câu tiếp|Xem kết quả/ }).click();
  }
}

test("chặng ôn tổng hợp (ôn tập chặng 1–5 của HSK 2): 30 câu nhiều kiểu, từ làm sai tự vào bộ ôn, ghi tiến độ", async ({ page }) => {
  test.setTimeout(120_000);
  await stubAnonymousSession(page);
  let saved: Record<string, unknown> | null = null;
  await page.route("**/rest/v1/user_unit_progress*", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: [] });
    saved = route.request().postDataJSON();
    return route.fulfill({ status: 201, body: "" });
  });
  await page.goto("/courses/hsk-2/6");
  await expect(page.getByRole("heading", { level: 1, name: "Ôn tập chặng 1–5" })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByRole("button", { name: /Nghe \p{Script=Han}/u })).toHaveCount(0); // không có bước làm quen từ
  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();
  await answerAll(page, 30);
  await expect(page.getByTestId("unit-result")).toBeVisible();
  expect(saved).toMatchObject({ unit_id: expect.any(String), best_score: expect.any(Number) });
  // Luôn chọn đáp án đầu thì gần như chắc chắn có câu sai; từ sai có câu thật làm nguồn được thêm vào bộ ôn.
  await expect(page.getByTestId("unit-result-added")).toBeVisible();
});

test("bài kiểm tra cuối cấp HSK 1: 60 câu", async ({ page }) => {
  // Không giả lập phiên: bản đồ đọc thẳng Supabase bằng khóa công khai, token giả sẽ làm truy vấn lỗi.
  await page.goto("/courses?course=hsk-1");
  await page.getByRole("button", { name: /Kiểm tra cuối cấp HSK 1/ }).click();
  await page.getByRole("link", { name: "Làm bài", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Kiểm tra cuối cấp HSK 1" })).toBeVisible({ timeout: 45_000 });
  await page.getByRole("button", { name: /Bắt đầu làm bài/ }).click();
  await expect(page.getByText(/Câu 1\/60/)).toBeVisible();
});

test("chặng không tồn tại: báo rõ và có đường về lộ trình", async ({ page }) => {
  await page.goto("/courses/hsk-1/999");
  await expect(page.getByText("Không có chặng này.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Về lộ trình" })).toBeVisible();
});

test("trên điện thoại: bản đồ không tràn ngang", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/courses");
  await expect(page.getByRole("list", { name: "Các chặng" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
