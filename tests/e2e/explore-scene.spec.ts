import { expect, test, type Page } from "@playwright/test";
import { ROOM_SCENE } from "../../lib/explore/scenes/room-scene";

// Khám phá (bản thử): điều khiển nhân vật (phím, chạm sàn, chạm vật), học từ khi lại gần vật (thẻ từ với pinyin và Hán Việt từ từ điển),
// nhận nhiệm vụ từ NPC sau khi học đủ 3 từ, và tiến độ nhớ sau khi tải lại.
const stage = (page: Page) => page.getByRole("group", { name: /Khung cảnh/ });
const avatarLeft = async (page: Page) => parseFloat(await page.getByTestId("player-avatar").evaluate((el) => (el as HTMLElement).style.left));

test("chạm vật: nhân vật tự đi tới rồi mở thẻ từ; nhiệm vụ mở sau 3 từ và không lộ đáp án", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 1300 });
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/explore/phong");
  await expect(page.getByRole("heading", { name: "Phòng của bạn" })).toBeVisible();

  const start = page.getByRole("button", { name: "Nhận nhiệm vụ" });
  await expect(start).toBeDisabled();

  await page.getByRole("button", { name: /^床, / }).click();
  const card = page.getByRole("region", { name: "Từ 床" });
  await expect(card).toContainText("chuáng");
  await expect(card).toContainText("Hán Việt");
  await expect(page.getByRole("region", { name: "Sổ tay" })).toContainText("1/14");

  await page.getByRole("button", { name: /^猫, / }).click();
  await expect(page.getByRole("region", { name: "Từ 猫" })).toBeVisible();
  await page.getByRole("button", { name: /^灯, / }).click();
  await expect(page.getByRole("region", { name: "Từ 灯" })).toBeVisible();
  await expect(start).toBeEnabled();

  await page.reload();
  await expect(page.getByRole("region", { name: "Sổ tay" })).toContainText("3/14");

  await page.getByRole("button", { name: "Nhận nhiệm vụ" }).click();
  const quest = page.getByRole("region", { name: "Nhiệm vụ của Gấu Trúc" });
  await expect(quest).toContainText("Câu 1/3");
  await expect(page.getByRole("button", { name: /^床, / })).toHaveCount(0);
  await quest.getByRole("button", { name: "Dừng" }).click();
  await expect(quest).toBeHidden();
});

test("điều khiển bằng bàn phím: giữ phím mũi tên thì đi, lại gần vật thì nhấn E học từ", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 1300 });
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/explore/phong");
  await expect(page.getByRole("heading", { name: "Phòng của bạn" })).toBeVisible();

  const box = (await stage(page).boundingBox())!;
  const before = await avatarLeft(page);
  await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.8); // lấy tiêu điểm cho khung cảnh (và đi tới điểm đó)
  await page.waitForTimeout(1200);
  const focused = await avatarLeft(page);
  expect(focused).toBeLessThan(before);
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(400);
  await page.keyboard.up("ArrowLeft");
  expect(await avatarLeft(page)).toBeLessThan(focused - 5);

  // Đi tới chỗ đứng của cái đèn bằng cách chạm sàn, rồi nhấn E.
  await page.mouse.click(box.x + box.width * 0.08, box.y + box.height * 0.5);
  await expect.poll(() => avatarLeft(page)).toBeLessThan(9); // chờ nhân vật đi tới tận nơi (chip E có thể đã hiện sẵn vì vật khác ở gần)
  await expect(page.getByText("E", { exact: true })).toBeVisible();
  await page.keyboard.press("e");
  await expect(page.getByRole("region", { name: "Từ 灯" })).toContainText("dēng");
});

test("Cú Thầy: chưa học đủ từ thì nhắc, nhận được nhiệm vụ khi đủ", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 1300 });
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/explore/phong");
  await page.getByRole("button", { name: /Nói chuyện với Cú Thầy/ }).click();
  const owl = page.getByRole("region", { name: "Cú Thầy" });
  await expect(owl).toContainText("3 từ");
  for (const t of ["床", "猫", "灯"]) {
    await page.getByRole("button", { name: new RegExp(`^${t}, `) }).click();
    await expect(page.getByRole("region", { name: `Từ ${t}` })).toBeVisible();
  }
  await page.getByRole("button", { name: /Nói chuyện với Cú Thầy/ }).click();
  await expect(owl).toContainText("3/14");
  await owl.getByRole("button", { name: "Nhận nhiệm vụ" }).click();
  await expect(page.getByRole("region", { name: "Nhiệm vụ của Gấu Trúc" })).toContainText("Câu 1/3");
});

test("nhiệm vụ: câu mang đồ cần nhặt đúng vật rồi giao cho Cú Thầy; câu lệnh hiện nghĩa sau khi trả lời", async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1100, height: 1300 });
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/explore/phong");
  const obj = (id: string) => { const o = ROOM_SCENE.objects.find((x) => x.id === id)!; return page.locator(`button[style*="left:${o.x}%;top:${o.y}%"]`); };
  const portable = ROOM_SCENE.objects.filter((o) => ["cup", "cat", "book", "apple", "water"].includes(o.id));
  for (const o of portable) {
    await page.getByRole("button", { name: new RegExp(`^${o.term}, `) }).click();
    await expect(page.getByRole("region", { name: `Từ ${o.term}` })).toBeVisible();
  }
  await page.getByRole("button", { name: "Nhận nhiệm vụ" }).click();
  const quest = page.getByRole("region", { name: "Nhiệm vụ của Gấu Trúc" });
  let sawBring = false;
  for (let i = 0; i < portable.length; i++) {
    await expect(quest).toContainText(`Câu ${i + 1}/${portable.length}`);
    const text = await quest.innerText();
    const bring = portable.find((o) => text.includes("Mang cho Cú Thầy") && text.includes(o.gloss));
    if (bring) {
      sawBring = true;
      await obj(bring.id).click();
      await expect(quest).toContainText("đang cầm"); // nhặt rồi nhưng chưa tính đúng
      await expect(quest).not.toContainText("Đúng rồi");
      await page.getByRole("button", { name: /Nói chuyện với Cú Thầy/ }).click();
      await expect(quest).toContainText("Đúng rồi");
    } else {
      const door = obj("door"); // cửa không bao giờ là đáp án (chưa học): trả lời sai hai lần để sang câu sau
      await door.click();
      await expect(quest).toContainText("Chưa đúng");
      await door.click();
      await expect(quest).toContainText("Đáp án là");
      if (text.includes("ra lệnh")) await expect(quest).toContainText("Cú Thầy nói");
    }
  }
  expect(sawBring).toBe(true);
  await expect(page.getByRole("region", { name: "Kết quả nhiệm vụ" })).toBeVisible();
});

test("đi sang Quán ăn bằng biển chỉ đường, học một từ, quay lại: tiến độ hai cảnh tách riêng", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 1300 });
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/explore/phong");
  await page.getByRole("button", { name: "Sang Quán ăn" }).click();
  await expect(page.getByRole("heading", { name: "Quán ăn" })).toBeVisible();
  await page.getByRole("button", { name: /^茶, / }).click();
  await expect(page.getByRole("region", { name: "Từ 茶" })).toContainText("chá");
  await expect(page.getByRole("region", { name: "Sổ tay" })).toContainText("1/14");
  await page.getByRole("button", { name: "Về Phòng của bạn" }).click();
  await expect(page.getByRole("heading", { name: "Phòng của bạn" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Sổ tay" })).toContainText("0/14"); // từ học ở quán không tính vào phòng
});

test("nhạc nền: bật mặc định, tắt được và nhớ lựa chọn sau khi tải lại", async ({ page }) => {
  await page.goto("/explore/phong");
  const music = page.getByRole("button", { name: /Nhạc nền/ });
  await expect(music).toHaveAttribute("aria-pressed", "true");
  await music.click();
  await expect(music).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(page.getByRole("button", { name: /Nhạc nền/ })).toHaveAttribute("aria-pressed", "false");
});

test("cảnh không tồn tại trả 404", async ({ page }) => {
  const res = await page.goto("/explore/khong-co");
  expect(res?.status()).toBe(404);
});
