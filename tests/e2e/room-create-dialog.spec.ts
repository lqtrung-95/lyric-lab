import { expect, test } from "@playwright/test";

// Không cần Supabase: các API được giả lập.
// Hộp thoại tạo phòng không được tràn ngang khi danh sách bài có tên rất dài (từng làm hộp thoại rộng ra và đẩy nút "Tự chọn bài" khỏi màn hình).
const LONG_TITLE = "【超長標題測試】".repeat(12) + " A very long song title without any break ".repeat(4);

for (const width of [390, 1280]) {
  test(`hộp thoại tạo phòng không tràn ngang với tên bài rất dài · ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/discover**", (r) => r.fulfill({ json: { songs: [
      { videoId: "aaaaaaaaaaa", title: LONG_TITLE, channelTitle: "Kênh " + "dài ".repeat(30), levelAvg: 3, listeners: 1, likes: 0 },
      { videoId: "bbbbbbbbbbb", title: "Bài ngắn", channelTitle: "Kênh", levelAvg: 3, listeners: 1, likes: 0 },
    ], hasMore: false, total: 2 } }));
    await page.route("**/api/leaderboard/profile", (r) => r.fulfill({ json: { profile: { nickname: "Linh", optedIn: false, avatarUrl: null } } }));
    await page.goto("/room");
    await page.getByRole("button", { name: "Tạo phòng" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByText("Tự chọn bài").click();
    await expect(dialog.getByRole("button", { name: /Bài ngắn/ })).toBeVisible();
    // Cả hai lựa chọn "Ngẫu nhiên" / "Tự chọn bài" đều nằm trong hộp thoại, và hộp thoại không có thanh cuộn ngang.
    const box = await dialog.boundingBox();
    for (const label of ["Ngẫu nhiên", "Tự chọn bài"]) {
      const b = await dialog.getByText(label, { exact: true }).boundingBox();
      expect(b!.x + b!.width).toBeLessThanOrEqual(box!.x + box!.width + 1);
    }
    expect(await dialog.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    expect(box!.width).toBeLessThanOrEqual(width);
  });
}
