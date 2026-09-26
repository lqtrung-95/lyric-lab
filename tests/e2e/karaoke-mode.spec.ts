import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";
import { TERMS, WORDS, seedCards } from "./helpers/seed-cards";

// Karaoke điền lời trên Supabase thật. YouTube được thay bằng bản giả có thể điều khiển thời gian (window.__t) và ghi lại lệnh (window.__yt).
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

const STUB = `window.__t = 0; window.__yt = [];
window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) { el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { window.__yt.push('seek:' + s); window.__t = s; },
    playVideo: function () { window.__yt.push('play'); }, pauseVideo: function () { window.__yt.push('pause'); },
    setPlaybackRate: function () {}, getCurrentTime: function () { return window.__t; }, getPlayerState: function () { return 1; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const setTime = (page: Page, t: number) => page.evaluate((v) => { (window as unknown as { __t: number }).__t = v; }, t);
const calls = (page: Page) => page.evaluate(() => (window as unknown as { __yt: string[] }).__yt);

/** Câu hát mẫu cho từng dòng: mọi thẻ cùng chỉ số dòng nằm chung một câu (bài hư cấu). */
async function mockContext(page: Page, userId: string) {
  const sb = serviceClientForTests();
  const { data: rows } = await sb.from("user_cards").select("item_key,video_id,line_index").eq("user_id", userId);
  const videoId = rows![0].video_id as string;
  const lines: Record<number, { text: string; pinyin: string; translation: string; start: number; end: number }> = {};
  for (const term of TERMS) {
    const idx = rows!.find((r) => r.item_key === `vocab:${term}`)!.line_index as number;
    lines[idx] = { text: lines[idx] ? `${lines[idx].text}和${term}` : `我们一起${term}`, pinyin: "wǒmen", translation: "Câu mẫu", start: idx * 5, end: idx * 5 + 5 };
  }
  await page.route("**/api/review/context**", (r) => r.fulfill({ json: { videoId, title: "夜车", artist: "Mẫu", lines } }));
  return Object.values(lines).map((l) => l.start).sort((a, b) => a - b);
}

test.describe("Karaoke điền lời", () => {
  let userId = "";
  const sb = serviceClientForTests();
  test.beforeEach(async ({ page }) => {
    await page.route("https://www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
    await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, json: {} }));
    userId = await seedCards(page);
  });
  test.afterEach(async () => { if (userId) await sb.auth.admin.deleteUser(userId); userId = ""; });

  const answerTerm = async (page: Page) => {
    const hint = await page.getByText(/Gợi ý nghĩa của từ cần điền/).innerText();
    return TERMS.find((t) => hint.includes(WORDS[t].meaning))!;
  };

  test("mặc định tạm dừng ở chỗ trống rồi cho hát tiếp; qua hết các câu thì có kết quả", async ({ page }) => {
    const starts = await mockContext(page, userId);
    await page.goto("/review/karaoke");
    await expect(page.getByRole("heading", { name: "Karaoke điền lời", level: 1 })).toBeVisible();
    await expect(page.getByText(`${starts.length} câu để điền`)).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "Chơi bài 夜车" }).click();
    await page.getByRole("button", { name: `Bắt đầu (${starts.length} câu)` }).click();

    for (let i = 0; i < starts.length; i++) {
      await expect.poll(async () => (await calls(page)).includes(`seek:${starts[i] - 3}`)).toBe(true); // tua tới trước câu 3 giây
      await setTime(page, starts[i] - 0.1); // tới mốc hiện ô trống
      await expect(page.getByRole("group", { name: "Chọn từ điền vào chỗ trống" })).toBeVisible();
      expect(await calls(page)).toContain("pause"); // tạm dừng chờ trả lời
      const before = (await calls(page)).filter((c) => c === "play").length;
      const term = await answerTerm(page);
      const choices = page.getByRole("group", { name: "Chọn từ điền vào chỗ trống" }).getByRole("button");
      if (i === 1) {
        await choices.filter({ hasNot: page.locator(`[lang=zh]:text-is("${term}")`) }).first().click();
        await expect(page.getByRole("status")).toContainText("Chưa đúng.");
      } else if (i === 2) {
        const texts = await choices.locator("[lang=zh]").allInnerTexts();
        await page.keyboard.press(String(texts.indexOf(term) + 1));
        await expect(page.getByRole("status")).toContainText("Chính xác!");
      } else {
        await choices.filter({ has: page.locator(`[lang=zh]:text-is("${term}")`) }).click();
        await expect(page.getByRole("status")).toContainText("Chính xác!");
      }
      expect((await calls(page)).filter((c) => c === "play").length).toBeGreaterThan(before); // bài hát chạy tiếp sau khi trả lời
      await page.getByRole("button", { name: /Câu tiếp theo|Xem kết quả/ }).click();
    }
    await expect(page.getByRole("heading", { name: "Xong bài “夜车”" })).toBeVisible();
    await expect(page.getByText("Cần ôn lại")).toBeVisible();
  });

  test("chạy liên tục: không tạm dừng, câu hát qua mà chưa trả lời là hụt", async ({ page }) => {
    const starts = await mockContext(page, userId);
    await page.goto("/review/karaoke");
    await page.getByLabel(/Chạy liên tục/).check();
    await page.getByRole("button", { name: "Chơi bài 夜车" }).click();
    await page.getByRole("button", { name: /^Bắt đầu \(/ }).click();
    await setTime(page, starts[0] - 0.1);
    await expect(page.getByRole("group", { name: "Chọn từ điền vào chỗ trống" })).toBeVisible();
    expect(await calls(page)).not.toContain("pause");
    await setTime(page, starts[0] + 5.5); // hết câu, chưa trả lời
    await expect(page.getByRole("status")).toContainText("Hụt rồi, câu hát đã qua.");
  });
});

test("chưa có bài đủ điều kiện: báo rõ điều kiện", async ({ page }) => {
  await page.goto("/review/karaoke");
  await expect(page.getByRole("heading", { name: "Karaoke điền lời", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Chọn bài hát để lưu từ" })).toBeVisible();
});
