import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";

// Phòng thi đấu 1v1 đầu-cuối với HAI trình duyệt thật (hai phiên ẩn danh) trên Supabase thật: tạo phòng, vào bằng link, sẵn sàng,
// chơi trọn 10 câu (đồng bộ qua Realtime + thăm dò + tự tiến câu), rồi so kết quả hai bên. YouTube IFrame API được thay bằng bản giả.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

const STUB = `window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  var t = 0;
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { t = s; }, playVideo: function () {}, pauseVideo: function () {}, setPlaybackRate: function () {},
    getCurrentTime: function () { return t; }, getPlayerState: function () { return 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

async function newPlayer(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.route("https://www.youtube.com/iframe_api", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  return page;
}

const noViolations = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

const codes: string[] = [];
const tag = () => String(Date.now() % 100_000) + Math.floor(Math.random() * 10);

test.afterAll(async () => {
  if (codes.length === 0) return;
  const sb = serviceClientForTests();
  const { data: rooms } = await sb.from("rooms").select("id").in("code", codes);
  for (const room of rooms ?? []) {
    const { data: players } = await sb.from("room_players").select("user_id").eq("room_id", room.id);
    await sb.from("rooms").delete().eq("id", room.id);
    for (const p of players ?? []) await sb.auth.admin.deleteUser(p.user_id);
  }
});

test("hai người chơi trọn một ván: mời bằng link, sẵn sàng, 10 câu, kết quả khớp nhau ở hai bên", async ({ browser }) => {
  test.setTimeout(240_000);
  const host = await newPlayer(await browser.newContext());
  const guest = await newPlayer(await browser.newContext());

  // Chủ phòng tạo phòng (bài ngẫu nhiên).
  await host.goto("/room");
  await noViolations(host); // sảnh Thi đấu
  await host.getByRole("button", { name: "Tạo phòng" }).first().click();
  // Chưa có biệt danh: đặt ngay trong hộp thoại (một biệt danh dùng chung cho phòng và bảng xếp hạng), rồi tạo phòng.
  const hostName = `Chu${tag()}`;
  await host.getByRole("dialog").getByLabel(/Biệt danh hiển thị/).fill(hostName);
  await host.getByRole("dialog").getByRole("button", { name: "Lưu biệt danh" }).click();
  await host.getByRole("dialog").getByRole("button", { name: "Tạo phòng" }).click();
  await host.waitForURL(/\/room\/\d{6}$/, { timeout: 30_000 });
  const code = host.url().match(/(\d{6})$/)![1];
  codes.push(code);
  await expect(host.getByRole("heading", { name: new RegExp(`Phòng chờ #${code}`) })).toBeVisible();
  await noViolations(host); // phòng chờ

  // Khách mở link mời (chưa có phiên): nhập tên rồi vào phòng.
  await guest.goto(`/room/${code}`);
  const guestName = `Khach${tag()}`;
  await guest.getByLabel(/Biệt danh hiển thị/).fill(guestName);
  await guest.getByRole("button", { name: "Lưu biệt danh" }).click();
  await guest.getByRole("button", { name: "Vào phòng" }).click();
  await expect(guest.getByRole("heading", { name: new RegExp(`Phòng chờ #${code}`) })).toBeVisible({ timeout: 20_000 });

  // Hai bên thấy nhau (Realtime hoặc thăm dò), khách sẵn sàng thì chủ phòng bắt đầu được.
  await expect(host.getByText(guestName)).toBeVisible({ timeout: 20_000 });
  await expect(host.getByRole("button", { name: /Bắt đầu thi đấu/ })).toBeDisabled();
  await guest.getByRole("button", { name: "Sẵn sàng" }).click();
  await expect(host.getByRole("button", { name: "Bắt đầu thi đấu" })).toBeEnabled({ timeout: 20_000 });
  await host.getByRole("button", { name: "Bắt đầu thi đấu" }).click();

  // Mười câu: mỗi bên chọn đáp án khác nhau (chủ phòng A, khách B) ngay khi câu mở.
  for (let n = 1; n <= 10; n++) {
    for (const [page, letter] of [[host, "A"], [guest, "B"]] as const) {
      await expect(page.getByText(`Câu ${n} / 10`)).toBeVisible({ timeout: 40_000 });
      const choice = page.getByRole("button", { name: new RegExp(`^Đáp án ${letter}:`) });
      await expect(choice).toBeEnabled({ timeout: 40_000 });
      if (n === 1 && letter === "A") await noViolations(page); // màn chơi, câu đang mở
      await choice.click();
      await expect(page.getByText("Đã khóa đáp án và gửi máy chủ")).toBeVisible({ timeout: 10_000 });
    }
  }

  // Kết quả: hai bên đều thấy kết thúc, đủ 10 dòng tổng kết, và người thắng khớp nhau từ hai góc nhìn.
  const hostBanner = host.getByRole("heading", { level: 1 });
  const guestBanner = guest.getByRole("heading", { level: 1 });
  await expect(hostBanner).toHaveText(/Bạn thắng!|Đối thủ thắng ván này|Hòa nhau!/, { timeout: 40_000 });
  await expect(guestBanner).toHaveText(/Bạn thắng!|Đối thủ thắng ván này|Hòa nhau!/, { timeout: 40_000 });
  await expect(host.getByRole("list").filter({ has: host.getByText("Bạn:") }).getByRole("listitem")).toHaveCount(10);
  await noViolations(host); // màn kết quả
  const [h, g] = [await hostBanner.innerText(), await guestBanner.innerText()];
  const mirror: Record<string, string> = { "Bạn thắng!": "Đối thủ thắng ván này", "Đối thủ thắng ván này": "Bạn thắng!", "Hòa nhau!": "Hòa nhau!" };
  expect(mirror[h]).toBe(g);

  await host.context().close();
  await guest.context().close();
});

test("bỏ cuộc giữa ván: người còn lại thắng và thấy ván kết thúc vì có người rời", async ({ browser }) => {
  test.setTimeout(120_000);
  const host = await newPlayer(await browser.newContext());
  const guest = await newPlayer(await browser.newContext());

  await host.goto("/room");
  await host.getByRole("button", { name: "Tạo phòng" }).first().click();
  // Chưa có biệt danh: đặt ngay trong hộp thoại (một biệt danh dùng chung cho phòng và bảng xếp hạng), rồi tạo phòng.
  const hostName = `Chu${tag()}`;
  await host.getByRole("dialog").getByLabel(/Biệt danh hiển thị/).fill(hostName);
  await host.getByRole("dialog").getByRole("button", { name: "Lưu biệt danh" }).click();
  await host.getByRole("dialog").getByRole("button", { name: "Tạo phòng" }).click();
  await host.waitForURL(/\/room\/\d{6}$/, { timeout: 30_000 });
  const code = host.url().match(/(\d{6})$/)![1];
  codes.push(code);

  await guest.goto(`/room/${code}`);
  const guestName = `Khach${tag()}`;
  await guest.getByLabel(/Biệt danh hiển thị/).fill(guestName);
  await guest.getByRole("button", { name: "Lưu biệt danh" }).click();
  await guest.getByRole("button", { name: "Vào phòng" }).click();
  await expect(host.getByText(guestName)).toBeVisible({ timeout: 20_000 });
  await guest.getByRole("button", { name: "Sẵn sàng" }).click();
  await expect(host.getByRole("button", { name: "Bắt đầu thi đấu" })).toBeEnabled({ timeout: 20_000 });
  await host.getByRole("button", { name: "Bắt đầu thi đấu" }).click();

  // Giữa câu 1, khách bỏ cuộc (có hộp xác nhận).
  await expect(guest.getByText("Câu 1 / 10")).toBeVisible({ timeout: 30_000 });
  await guest.getByRole("button", { name: "Bỏ cuộc" }).click();
  await guest.getByRole("dialog").getByRole("button", { name: "Bỏ cuộc" }).click();
  await guest.waitForURL(/\/room$/, { timeout: 20_000 });

  await expect(host.getByRole("heading", { level: 1 })).toHaveText("Bạn thắng!", { timeout: 30_000 });
  await expect(host.getByText("Ván kết thúc vì có người rời ván.")).toBeVisible();

  await host.context().close();
  await guest.context().close();
});
