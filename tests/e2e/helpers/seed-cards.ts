import { expect, type Page } from "@playwright/test";
import { serviceClientForTests } from "./seed-analysis";

// Từ → pinyin trong từ điển, nghĩa ngắn trên ô ghép, nghĩa đầy đủ và chỉ số dòng của bài hư cấu 夜车 (dữ liệu mẫu, không phải lời thật).
export const WORDS: Record<string, { pinyin: string; short: string; meaning: string; line: number }> = {
  离开: { pinyin: "lí kāi", short: "rời đi", meaning: "rời đi, rời khỏi", line: 1 },
  从来: { pinyin: "cóng lái", short: "xưa nay", meaning: "xưa nay, từ trước đến giờ", line: 1 },
  星光: { pinyin: "xīng guāng", short: "ánh sao", meaning: "ánh sao", line: 2 },
  回忆: { pinyin: "huí yì", short: "ký ức", meaning: "ký ức, kỷ niệm", line: 4 },
  口袋: { pinyin: "kǒu dài", short: "túi áo", meaning: "túi áo, túi quần", line: 4 },
  天亮: { pinyin: "tiān liàng", short: "trời sáng", meaning: "trời sáng, rạng đông", line: 5 },
};
export const TERMS = Object.keys(WORDS);

/** Lưu 6 từ từ trang xem trước mẫu (tạo tài khoản ẩn danh + thẻ mới) và trả id người dùng để dọn sau. */
export async function seedCards(page: Page): Promise<string> {
  const sb = serviceClientForTests();
  await page.goto("/dev/preview-fixture");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  for (const term of TERMS) {
    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: term, exact: true }) });
    await card.getByRole("button", { name: "Lưu" }).click();
    await expect(card.getByRole("button", { name: "Đã lưu" })).toBeVisible();
  }
  let userId = "";
  await expect.poll(async () => {
    const { data } = await sb.from("user_cards").select("user_id").eq("item_key", "vocab:离开").order("created_at", { ascending: false }).limit(1);
    userId = data?.[0]?.user_id ?? "";
    if (!userId) return 0;
    return (await sb.from("user_cards").select("item_key").eq("user_id", userId)).data?.length ?? 0;
  }, { timeout: 20_000 }).toBe(TERMS.length);
  return userId;
}
