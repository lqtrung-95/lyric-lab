import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Màn Nghe với dữ liệu mẫu hư cấu "夜车" (6 câu, mỗi câu 5 giây: câu n bắt đầu ở 5*(n-1)).
// YouTube IFrame API được thay bằng bản giả có thể điều khiển thời gian qua window.__t.
const STUB = `window.__t = 0; window.__playing = true; window.__yt = [];
window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { window.__yt.push('seek:' + s); window.__t = s; },
    playVideo: function () { window.__yt.push('play'); window.__playing = true; },
    pauseVideo: function () { window.__yt.push('pause'); window.__playing = false; },
    setPlaybackRate: function (r) { window.__yt.push('rate:' + r); },
    getCurrentTime: function () { return window.__t; },
    getPlayerState: function () { return window.__playing ? 1 : 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const setTime = (page: Page, t: number) => page.evaluate((v) => { (window as unknown as { __t: number }).__t = v; }, t);
const calls = (page: Page) => page.evaluate(() => (window as unknown as { __yt: string[] }).__yt);
const line = (page: Page, n: number) => page.locator(`[data-line-index="${n - 1}"]`);

/**
 * Cuộn xuống đáy và đợi vị trí ổn định: `document.body.scrollHeight` đo ngay sau đổi cỡ cửa sổ có thể
 * chưa tính layout mới (font, sticky player) nên một lần `scrollTo` có khi dừng giữa chừng. Cuộn lại tới
 * khi vị trí không đổi nữa mới coi là đã tới đáy thật.
 */
async function scrollToBottom(page: Page) {
  await page.waitForFunction(
    () => {
      const before = window.scrollY;
      window.scrollTo(0, document.documentElement.scrollHeight);
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
      return atBottom && window.scrollY === before;
    },
    null,
    { polling: 100, timeout: 10_000 },
  );
}

/**
 * Cuộn sao cho dòng lời nằm hẳn dưới video + thanh điều khiển dính ở đầu màn hình — cần cho các bài test bấm vào
 * dòng, vì Playwright tự "cuộn vào tầm nhìn" trước khi bấm nhưng không biết phần dính che mất phần trên màn hình,
 * nên có thể dừng cuộn ở vị trí dòng vẫn bị che. Đo lại và cuộn thêm liên tục (không cuộn 1 lần) vì khung video
 * (aspect-video) có thể chưa lên đúng kích thước cuối ngay sau khi tải.
 */
async function scrollLineBelowSticky(page: Page, n: number) {
  await page.waitForFunction(
    (lineIndex) => {
      const stickyBottom = document.querySelector("[data-sticky-player]")?.getBoundingClientRect().bottom ?? 0;
      const el = document.querySelector(`[data-line-index="${lineIndex}"]`);
      if (!el) return false;
      const top = el.getBoundingClientRect().top;
      const target = stickyBottom + 24;
      // Dải dung sai quanh `target`: đích chính xác là ngay dưới mép dính, không phải "miễn là ở dưới mép dính" —
      // dòng ở xa phía dưới (chưa cuộn tới, scrollY vẫn 0) cũng thoả "top >= stickyBottom" dù đang nằm ngoài màn
      // hình hẳn, nên phải cuộn cả hai chiều để đưa đúng về sát mép dính, không chỉ kiểm tra một phía.
      if (Math.abs(top - target) <= 8) return true;
      window.scrollBy({ top: top - target, behavior: "instant" });
      return false;
    },
    n - 1,
    { polling: 50, timeout: 10_000 },
  );
}

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.goto("/dev/listen-fixture");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Stub YouTube nạp trễ và tự đặt lại thời gian về 0: chờ nó sẵn sàng trước khi test đổi thời gian.
  await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
  // Trang có thể tự trôi cuộn vài trăm px ngay sau khi tải trong môi trường Playwright (không tái hiện được khi
  // thao tác tay trên trình duyệt thật — nghi do timing dựng trang dưới automation, chưa rõ nguồn cụ thể). Cuộn
  // hẳn về đầu để mọi test trong file này xuất phát từ cùng một trạng thái cuộn, không phụ thuộc hiện tượng đó.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
});

test("lời chạy theo thời gian phát và panel 'Đang hát' đổi theo câu", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  await expect(page.getByText("Câu 02 đang phát", { exact: true })).toBeVisible();
  await expect(page.getByRole("complementary").getByText("离开")).toBeVisible();
  await setTime(page, 12);
  await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("complementary").getByText("星光")).toBeVisible();
  await expect(page.getByRole("complementary").getByText("离开")).toHaveCount(0);
});

test("từ vựng tô nền, ngữ pháp gạch chân: hai kiểu khác nhau", async ({ page }) => {
  await setTime(page, 6);
  const row = line(page, 2);
  // Nhãn cho trình đọc màn hình giờ ở aria-label (không phải text hiển thị, để không lẫn vào tên nút).
  await expect(row.locator('[aria-label^="Từ vựng:"]').first()).toBeAttached();
  await expect(row.locator(".ring-2").first()).toBeVisible(); // từ vựng: nền + viền
  await expect(row.locator(".border-b-2").first()).toBeVisible(); // ngữ pháp: gạch chân
});

test("bấm câu để nhảy tới đầu câu", async ({ page }) => {
  await scrollLineBelowSticky(page, 4);
  // Bấm ở góc trên-trái (vùng đệm của dòng): pinyin ruby làm dòng cao hơn nên tâm dòng (điểm click mặc định)
  // có thể trúng ngay nút tra từ (chặn nảy sự kiện) thay vì phần nền dòng. `force`: đã tự cuộn đúng vị trí ở trên,
  // bỏ qua bước Playwright tự cuộn lại trước khi bấm (thuật toán của nó không biết phần dính che mất góc trên).
  await line(page, 4).click({ position: { x: 8, y: 8 }, force: true });
  expect(await calls(page)).toContain("seek:15");
  await expect(line(page, 4)).toHaveAttribute("aria-current", "true");
});

test("lặp câu: phát tới hết câu thì quay về đầu câu, bấm lại để tắt", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  const loop = page.getByRole("button", { name: "Lặp câu đang hát" });
  await loop.click();
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu 2" })).toBeVisible();
  await setTime(page, 9.98);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __t: number }).__t)).toBe(5);
  await loop.click();
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu" })).toHaveCount(0);
});

test("lặp câu: cấu hình đúng số lần, hết lượt thì tự tắt và không quay đầu câu nữa", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  // Chip chỉnh số lần chỉ hiện sau khi đã bật lặp câu; bấm là chuyển sang giá trị tiếp theo (Vô hạn → 1 → 2 …).
  const loop = page.getByRole("button", { name: "Lặp câu đang hát" });
  await loop.click();
  const countChip = page.getByRole("button", { name: /Số lần lặp/ });
  await countChip.click();
  await countChip.click();
  await expect(countChip).toHaveAccessibleName(/Số lần lặp: 2 lần/);
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu 2" })).toBeVisible();

  // Hết câu lần 1: còn 1 lượt lặp → quay lại đầu câu.
  await setTime(page, 9.98);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __t: number }).__t)).toBe(5);
  expect((await calls(page)).filter((c) => c === "seek:5")).toHaveLength(1);

  // Hết câu lần 2: hết lượt lặp → không quay đầu câu nữa, "Lặp câu" tự tắt.
  await setTime(page, 9.98);
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu" })).toHaveCount(0);
  expect((await calls(page)).filter((c) => c === "seek:5")).toHaveLength(1);
});

test("tốc độ 0,75x được áp dụng và nhớ sau khi tải lại", async ({ page }) => {
  // Nút tốc độ là 1 nút xoay vòng (nhãn = tốc độ hiện tại), không phải 3 nút rời: [0.5, 0.75, 1] → bấm 2 lần từ
  // mặc định 1x mới tới 0,75x.
  const rateBtn = page.getByRole("button", { name: /^Tốc độ/ });
  await rateBtn.click();
  await rateBtn.click();
  await expect(rateBtn).toHaveText("0,75x");
  await expect.poll(() => calls(page)).toContain("rate:0.75");
  await page.reload();
  await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
  await expect(page.getByRole("button", { name: /^Tốc độ/ })).toHaveText("0,75x");
  await expect.poll(() => calls(page)).toContain("rate:0.75");
});

test("tắt pinyin và bản dịch, lựa chọn được nhớ", async ({ page }) => {
  // Pinyin giờ ghép theo từng chữ (ruby/rt trên đúng vị trí chữ Hán) thay vì một dòng riêng, nên kiểm bằng
  // sự có mặt của <rt> thay vì tìm nguyên câu pinyin ghép chuỗi.
  await expect(line(page, 1).locator("rt").first()).toBeVisible();
  await page.getByRole("button", { name: "Pinyin" }).first().click();
  await page.getByRole("button", { name: "Bản dịch" }).first().click();
  await expect(line(page, 1).locator("rt")).toHaveCount(0);
  await expect(page.getByText("Anh chưa từng nghĩ mình sẽ rời đi")).toHaveCount(0);
  await page.reload();
  await expect(line(page, 1).locator("rt")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Pinyin" }).first()).toHaveAttribute("aria-pressed", "false");
});

test("phím tắt: Space phát/dừng, mũi tên đổi câu, L lặp câu", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.press("Space");
  expect(await calls(page)).toContain("pause");
  await page.keyboard.press("ArrowRight");
  expect(await calls(page)).toContain("seek:10");
  await page.keyboard.press("ArrowLeft");
  expect(await calls(page)).toContain("seek:0"); // từ câu 3 (đang ở 10 s) lùi về câu 2 = 5 s
  await page.keyboard.press("l");
  await expect(page.getByRole("button", { name: "Lặp câu đang hát" })).toHaveAttribute("aria-pressed", "true");
});

test("mobile: panel 'Đang hát' thu gọn mặc định, mở ra thấy thẻ của câu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setTime(page, 6);
  const toggle = page.getByRole("button", { name: /Đang hát · Câu 02/ });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("complementary").getByText("rời đi, rời khỏi")).toBeHidden();
  await toggle.click();
  await expect(page.getByRole("complementary").getByText("rời đi, rời khỏi")).toBeVisible();
});

test.describe("cỡ khung video", () => {
  const videoWidth = (page: import("@playwright/test").Page) =>
    page.evaluate(() => document.querySelector("[data-sticky-player] > div")?.getBoundingClientRect().width ?? 0);

  test("chọn cỡ ở Cài đặt đổi bề rộng video màn Nghe, được nhớ, video luôn hiển thị", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    expect(await videoWidth(page)).toBeGreaterThan(560); // mặc định Lớn
    await page.goto("/settings");
    const select = page.getByLabel("Cỡ video");
    await select.selectOption("small");
    await page.goto("/dev/listen-fixture");
    await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
    await expect.poll(() => videoWidth(page)).toBeLessThanOrEqual(356);
    expect(await videoWidth(page)).toBeGreaterThanOrEqual(200);
    await page.goto("/settings");
    await page.getByLabel("Cỡ video").selectOption("medium");
    await page.goto("/dev/listen-fixture");
    await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
    await expect.poll(() => videoWidth(page)).toBeLessThanOrEqual(560);
    expect(await videoWidth(page)).toBeGreaterThan(356);
  });
});

test.describe("chỉnh lời lệch nhạc", () => {
  test("nút ±0,5s dịch mốc lời, được nhớ sau khi tải lại và đặt lại được", async ({ page }) => {
    await setTime(page, 10.5); // câu 3 bắt đầu ở 10s
    await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await page.getByRole("button", { name: "Lời muộn hơn 0,5 giây" }).click();
    await page.getByRole("button", { name: "Lời muộn hơn 0,5 giây" }).click();
    await expect(page.getByText("Đang lệch +1 giây")).toBeVisible();
    await expect(line(page, 2)).toHaveAttribute("aria-current", "true"); // câu 3 giờ bắt đầu ở 11s
    await page.reload();
    await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
    await setTime(page, 10.5);
    await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await page.getByRole("button", { name: "Đặt lại (không lệch)" }).click();
    await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
  });

  test("admin đổi mức mặc định của bài sau khi người dùng đã chỉnh: bản chỉnh cũ bị bỏ, không cộng đôi", async ({ page }) => {
    const id = "dQw4w9WgXcQ"; // videoId của bài mẫu hư cấu (lib/preview/fixtures/ye-che-analysis.ts)
    // Người dùng chỉnh +2s lúc bài chưa có mức mặc định (base 0); sau đó admin đặt mặc định 5s: bản +2s không còn đúng.
    await page.evaluate((v) => {
      localStorage.setItem("lyric-lab-lyric-offsets", JSON.stringify({ [v]: { o: 2, base: 0 } }));
      localStorage.setItem("lyric-lab-default-offsets", JSON.stringify({ [v]: 5 }));
    }, id);
    await page.reload();
    await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
    await expect(page.getByText(/Đang lệch/)).toHaveCount(0);
    // Cùng bản chỉnh nhưng mức mặc định không đổi (base khớp) thì vẫn còn hiệu lực.
    await page.evaluate((v) => localStorage.setItem("lyric-lab-default-offsets", JSON.stringify({ [v]: 0 })), id);
    await page.reload();
    await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
    await expect(page.getByText("Đang lệch +2 giây")).toBeVisible();
  });

  test("đồng bộ nhanh: bấm dòng đang được hát đặt độ lệch, có bù phản xạ 0,25s", async ({ page }) => {
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await page.getByRole("button", { name: "Đồng bộ nhanh" }).click();
    await setTime(page, 12.25); // ca sĩ vừa bắt đầu hát câu 3 (mốc gốc 10s) nhưng lời đang lệch
    await line(page, 3).getByRole("button").first().click();
    await expect(page.getByText("Đang lệch +2 giây")).toBeVisible();
    expect((await calls(page)).filter((c) => c.startsWith("seek:"))).toEqual([]); // chế độ này không tua video
    await setTime(page, 12.5);
    await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
  });

  test("nhãn 'Đang lệch' căn giữa dọc với nút 'Chỉnh lời'", async ({ page }) => {
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await page.getByRole("button", { name: "Lời muộn hơn 0,5 giây" }).click();
    const centerY = async (locator: import("@playwright/test").Locator) => {
      const box = (await locator.boundingBox())!;
      return box.y + box.height / 2;
    };
    const button = page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" });
    const badge = page.getByText("Đang lệch +0.5 giây");
    await expect(badge).toBeVisible();
    // Poll: bố cục có thể còn đang ổn định ngay sau khi bấm.
    await expect.poll(async () => Math.abs((await centerY(button)) - (await centerY(badge)))).toBeLessThanOrEqual(1);
  });

  test("bảng chỉnh lời mở ra đạt axe", async ({ page }) => {
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await expect(page.getByRole("button", { name: "Đồng bộ nhanh" })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
});

test.describe("thanh điều khiển dính theo video khi cuộn", () => {
  test("luôn thấy và điều khiển được dù cuộn tới đâu, mọi cỡ màn hình", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    // Đổi cỡ viewport cũng có thể gây trôi cuộn như ở beforeEach — cuộn lại về đầu cho chắc.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const bar = page.getByRole("group", { name: "Điều khiển nhanh" });
    await expect(bar).toBeVisible();
    await scrollToBottom(page);
    await expect(bar).toBeVisible(); // video + thanh điều khiển dính ở đầu màn hình, không cuộn khuất

    await bar.getByRole("button", { name: /Tạm dừng|Phát/ }).click();
    expect((await calls(page)).some((c) => c === "pause" || c === "play")).toBe(true);
    // "Tới 5 giây"/"Lùi 5 giây" nằm ở hàng vị trí phát, ngoài group "Điều khiển nhanh" (nhóm chỉ bọc hàng nút dưới).
    await page.getByRole("button", { name: "Tới 5 giây" }).click();
    expect((await calls(page)).some((c) => c.startsWith("seek:"))).toBe(true);
    await bar.getByRole("button", { name: /^Tốc độ 1x/ }).click();
    expect((await calls(page)).includes("rate:0.5")).toBe(true);
    // Chỉnh lời lệch ngay trên thanh: mở bảng nhỏ, "Muộn hơn 0,5s" thì hiện +0,5s. Bảng này định vị tuyệt đối ra
    // ngoài group "Điều khiển nhanh" (neo theo cả thanh, không theo hàng nút) nên dò bằng `page`, không qua `bar`.
    await bar.getByRole("button", { name: /^Canh lời lệch/ }).click();
    await page.getByRole("button", { name: "Muộn hơn 0,5 giây" }).click();
    await expect(page.getByRole("group", { name: "Chỉnh lời lệch" }).locator("output")).toHaveText("+0,5s");
    await page.getByRole("button", { name: "Đặt lại" }).click();
    expect((await new AxeBuilder({ page }).include('[aria-label="Điều khiển nhanh"]').analyze()).violations).toEqual([]);

    // Điện thoại: cùng một thanh, vẫn dính ngay dưới video dù cuộn ở đâu.
    await page.setViewportSize({ width: 390, height: 800 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect(bar).toBeVisible();
    const player = await page.locator("[data-sticky-player]").boundingBox();
    const barBox = await bar.boundingBox();
    // group "Điều khiển nhanh" nằm trong khung có đệm dưới (py-2 ≈ 8px) trước khi tới mép thanh, nên không sát
    // hẳn mép dưới của `data-sticky-player` — chỉ cần gần đó (không lệch hẳn lên trên vùng video) là đủ.
    expect(barBox!.y).toBeGreaterThanOrEqual(player!.y + player!.height - barBox!.height - 12);
  });
});
