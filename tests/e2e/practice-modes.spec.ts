import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { hasSupabaseEnv, serviceClientForTests } from "./helpers/seed-analysis";
import { TERMS, WORDS, seedCards } from "./helpers/seed-cards";

// Ba chế độ luyện tập (Gõ pinyin, Điền lời, Ghép cặp) trên Supabase thật, dùng 6 từ của bài hư cấu 夜车.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

/** Từ đang hiện trên màn (đọc từ nhãn nút loa, vì khuông nhạc là hình trang trí ẩn khỏi trình đọc màn hình). */
const currentTerm = async (page: Page) => {
  const label = await page.getByRole("button", { name: /^Nghe phát âm / }).first().getAttribute("aria-label");
  return label!.replace("Nghe phát âm ", "");
};

test.describe("chế độ luyện tập", () => {
  let userId = "";
  const sb = serviceClientForTests();

  test.beforeEach(async ({ page }) => {
    await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, json: {} })); // không gọi Azure
    userId = await seedCards(page);
  });
  test.afterEach(async () => { if (userId) await sb.auth.admin.deleteUser(userId); userId = ""; });

  test("Gõ pinyin: chấp nhận có dấu và số thanh, báo đúng âm thiếu thanh và sai, chấm lịch cho thẻ đến hạn", async ({ page }) => {
    // 离开 đã học và đến hạn: chơi đúng thẻ này phải dời lịch ôn.
    await sb.from("user_cards").update({
      state: 2, reps: 1, stability: 3, difficulty: 5, scheduled_days: 3, learning_steps: 0,
      due: new Date(Date.now() - 86_400_000).toISOString(), last_review: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    }).eq("user_id", userId).eq("item_key", "vocab:离开");

    await page.goto("/review/pinyin");
    await expect(page.getByRole("heading", { name: "Gõ pinyin", level: 1 })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    const seen: string[] = [];
    for (let i = 0; i < TERMS.length; i++) {
      const term = await currentTerm(page);
      seen.push(term);
      const { pinyin } = WORDS[term];
      const input = page.getByLabel(/Gõ pinyin \(ví dụ/);
      if (i === 0) {
        await input.fill(pinyin.replace(/ /g, "").normalize("NFD").replace(/[̀-ͯ]/g, "")); // không thanh
        await input.press("Enter");
        await expect(page.getByRole("status").filter({ hasText: "Đúng âm, còn thiếu thanh điệu." })).toBeVisible();
      } else if (i === 1) {
        await input.fill("zzzz");
        await input.press("Enter");
        await expect(page.getByRole("status").filter({ hasText: "Chưa đúng." })).toBeVisible();
        await expect(page.getByRole("status")).toContainText(pinyin);
      } else if (i === 2) {
        // Số thanh: đổi từng âm tiết có dấu sang số tương ứng.
        const numeric = pinyin.split(" ").map((s) => {
          const tone = { "̄": 1, "́": 2, "̌": 3, "̀": 4 } as Record<string, number>;
          const nfd = s.normalize("NFD");
          const mark = nfd.match(/[̀́̄̌]/)?.[0];
          return nfd.replace(/[̀́̄̌]/g, "").normalize("NFC") + (mark ? tone[mark] : "");
        }).join(" ");
        await input.fill(numeric);
        await input.press("Enter");
        await expect(page.getByRole("status").filter({ hasText: "Chính xác!" })).toBeVisible();
      } else {
        await input.fill(pinyin);
        await input.press("Enter");
        await expect(page.getByRole("status").filter({ hasText: "Chính xác!" })).toBeVisible();
      }
      await page.getByRole("button", { name: /Từ tiếp theo|Xem kết quả/ }).click();
    }
    expect(new Set(seen).size).toBe(TERMS.length); // mỗi từ một lần
    await expect(page.getByRole("heading", { name: "Xong lượt gõ pinyin" })).toBeVisible();
    await expect(page.getByText("Cần ôn lại")).toBeVisible(); // hai câu chưa trọn vẹn
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // Thẻ đến hạn: chỉ được chấm đúng nếu người dùng gõ đúng thẻ đó; kiểm tra khi thẻ 离开 nằm ở vị trí trả lời chính xác hoặc một phần.
    const { data: card } = await sb.from("user_cards").select("due,reps,state").eq("user_id", userId).eq("item_key", "vocab:离开").single();
    expect(Date.parse(card!.due)).toBeGreaterThan(Date.now()); // hạn đã dời ra tương lai dù đúng một phần hay sai
    expect(card!.reps).toBe(2);
    // Thẻ mới thì không bị chấm: các thẻ khác vẫn ở trạng thái New.
    const { data: others } = await sb.from("user_cards").select("state,reps").eq("user_id", userId).neq("item_key", "vocab:离开");
    expect(others!.every((c) => c.state === 0 && c.reps === 0)).toBe(true);
    await expect(page.getByText(/Lịch ôn của 1 thẻ đã được cập nhật/)).toBeVisible();
  });

  test("Ghép cặp: nhầm được tính, ghép hết thì báo kết quả và lưu kỷ lục, không đổi lịch ôn", async ({ page }) => {
    await page.goto("/review/match");
    await expect(page.getByRole("heading", { name: "Ghép cặp", level: 1 })).toBeVisible();
    const lefts = page.getByRole("list", { name: "Chữ Hán" });
    const rights = page.getByRole("list", { name: "Nghĩa" });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // Mọi ô ở cả hai cột cao bằng nhau nên các hàng thẳng hàng.
    const heights = await page.locator("main ul button").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(heights).toHaveLength(TERMS.length * 2);
    expect(new Set(heights).size).toBe(1);

    // Một lần nhầm cố ý: chữ Hán đầu tiên với nghĩa của từ khác.
    const firstTerm = (await lefts.getByRole("button").first().locator("[lang=zh]").innerText()).trim();
    const other = TERMS.find((t) => t !== firstTerm)!;
    await lefts.getByRole("button").first().click();
    await rights.getByRole("button", { name: WORDS[other].short }).click();
    await expect(page.getByText(/Nhầm\s*1/)).toBeVisible();

    for (const term of TERMS) {
      await lefts.getByRole("button").filter({ has: page.locator(`[lang=zh]:text-is("${term}")`) }).click();
      await rights.getByRole("button", { name: WORDS[term].short }).click();
    }
    await expect(page.getByRole("status").filter({ hasText: /Ghép xong trong/ })).toContainText("nhầm 1 lần");
    expect(await page.evaluate(() => Number(localStorage.getItem("lyric-lab-match-best")))).toBeGreaterThanOrEqual(0);
    await page.getByRole("button", { name: "Vòng tiếp theo" }).click();
    await expect(page.getByText(/Đã ghép\s*0/)).toBeVisible();
    const { data } = await sb.from("user_cards").select("state,reps").eq("user_id", userId);
    expect(data!.every((c) => c.state === 0 && c.reps === 0)).toBe(true);
  });

  test("Điền lời: chọn đúng/sai, hiện đáp án, phím 1–4 hoạt động và kết thúc có kết quả", async ({ page }) => {
    const { data: rows } = await sb.from("user_cards").select("item_key,video_id,line_index").eq("user_id", userId);
    const videoId = rows![0].video_id as string;
    // Giả lập API câu hát: mỗi dòng chứa mọi từ có cùng chỉ số dòng (bài hư cấu, không phải lời thật).
    const lines: Record<number, object> = {};
    for (const [term, w] of Object.entries(WORDS)) {
      const idx = rows!.find((r) => r.item_key === `vocab:${term}`)!.line_index as number;
      const text = (lines[idx] as { text?: string } | undefined)?.text;
      lines[idx] = { text: text ? `${text}和${term}` : `我们一起${term}`, pinyin: "wǒmen", translation: "Câu mẫu", start: idx * 5, end: idx * 5 + 5 };
      void w;
    }
    await page.route("**/api/review/context**", (r) => r.fulfill({ json: { videoId, title: "夜车", artist: "Mẫu", lines } }));

    await page.goto("/review/cloze");
    await expect(page.getByRole("heading", { name: "Điền lời", level: 1 })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    const answerFor = async () => {
      const hint = await page.getByText(/Gợi ý nghĩa của từ cần điền/).innerText();
      return TERMS.find((t) => hint.includes(WORDS[t].meaning))!;
    };
    for (let i = 0; i < TERMS.length; i++) {
      const term = await answerFor();
      const choices = page.getByRole("group", { name: "Chọn từ điền vào chỗ trống" }).getByRole("button");
      expect(await choices.count()).toBeGreaterThanOrEqual(3);
      if (i === 0) {
        const wrong = choices.filter({ hasNot: page.locator(`[lang=zh]:text-is("${term}")`) }).first();
        await wrong.click();
        await expect(page.getByRole("status")).toContainText("Chưa đúng.");
      } else if (i === 1) {
        // Phím số: bấm phím ứng với vị trí của đáp án đúng.
        const texts = await choices.locator("[lang=zh]").allInnerTexts();
        await page.keyboard.press(String(texts.indexOf(term) + 1));
        await expect(page.getByRole("status")).toContainText("Chính xác!");
      } else {
        await choices.filter({ has: page.locator(`[lang=zh]:text-is("${term}")`) }).first().click();
        await expect(page.getByRole("status")).toContainText("Chính xác!");
      }
      await page.getByRole("button", { name: /Câu tiếp theo|Xem kết quả/ }).click();
    }
    await expect(page.getByRole("heading", { name: "Xong lượt điền lời" })).toBeVisible();
    await expect(page.getByText("Cần ôn lại")).toBeVisible();
  });
});

test("chưa có thẻ nào: mỗi chế độ hướng dẫn cách lưu từ và đạt axe", async ({ page }) => {
  for (const [path, title] of [["/review/pinyin", "Gõ pinyin"], ["/review/cloze", "Điền lời"], ["/review/match", "Ghép cặp"]]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chọn bài hát để lưu từ" })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await expect(page.getByRole("navigation", { name: "Chế độ ôn tập" }).getByRole("link", { name: "Ghép cặp" })).toHaveAttribute("aria-current", "page");
});
