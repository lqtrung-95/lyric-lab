import type { HskTheme } from "./hsk1-themes";

/**
 * Bộ chủ đề dùng chung cho lộ trình HSK 2–5. Mỗi từ được AI xếp vào đúng một chủ đề (`scripts/theme-hsk-words.mts`), người dùng duyệt rồi
 * lưu ở `hsk-themed-words.json`. Thứ tự ở đây là thứ tự học trong mỗi cấp: gần gũi đời sống trước, trừu tượng sau.
 */
export const HSK_THEME_TAXONOMY: { id: string; title: string; hint: string }[] = [
  { id: "daily", title: "Đời sống hằng ngày", hint: "sinh hoạt, thói quen, việc nhà, đồ dùng cá nhân" },
  { id: "food", title: "Ăn uống và nấu nướng", hint: "món ăn, đồ uống, nguyên liệu, nhà hàng, vị" },
  { id: "home", title: "Nhà cửa và đồ vật", hint: "phòng ốc, nội thất, thiết bị, quần áo" },
  { id: "people", title: "Gia đình và quan hệ", hint: "người thân, bạn bè, cách xưng hô, hẹn hò, kết hôn" },
  { id: "school", title: "Học tập và trường lớp", hint: "môn học, thi cử, sách vở, kiến thức" },
  { id: "work", title: "Công việc và nghề nghiệp", hint: "nghề, công ty, họp hành, kinh doanh" },
  { id: "money", title: "Tiền bạc và mua sắm", hint: "giá cả, thanh toán, hàng hóa, ngân hàng" },
  { id: "travel", title: "Du lịch và giao thông", hint: "đi lại, phương tiện, khách sạn, cảnh đẹp, đường sá" },
  { id: "places", title: "Địa điểm và thành phố", hint: "nơi chốn, đất nước, khu vực, công trình" },
  { id: "nature", title: "Thiên nhiên và thời tiết", hint: "động vật, cây cối, khí hậu, môi trường" },
  { id: "health", title: "Cơ thể và sức khỏe", hint: "bộ phận cơ thể, bệnh, thuốc, thể trạng" },
  { id: "feelings", title: "Cảm xúc và tính cách", hint: "vui buồn, yêu ghét, đức tính, thái độ" },
  { id: "time", title: "Thời gian và tần suất", hint: "ngày giờ, mùa, thứ tự, thường xuyên, đã/sẽ" },
  { id: "actions", title: "Hành động thường gặp", hint: "động từ chuyển động, làm, cầm, mở, tìm..." },
  { id: "describe", title: "Miêu tả và mức độ", hint: "tính từ, phó từ mức độ, so sánh, hình dạng, màu sắc" },
  { id: "talk", title: "Giao tiếp và ý kiến", hint: "nói, hỏi, đồng ý, giải thích, suy nghĩ, kế hoạch" },
  { id: "society", title: "Xã hội và văn hóa", hint: "luật lệ, lịch sử, truyền thống, tổ chức, phong tục" },
  { id: "tech", title: "Công nghệ và truyền thông", hint: "mạng, máy móc, tin tức, phim ảnh, khoa học" },
  { id: "leisure", title: "Thể thao và giải trí", hint: "thể thao, nhạc, trò chơi, sở thích, lễ hội" },
  { id: "abstract", title: "Khái niệm trừu tượng", hint: "nguyên nhân, kết quả, khả năng, điều kiện, ý nghĩa" },
  { id: "grammar", title: "Từ nối và ngữ pháp", hint: "liên từ, giới từ, trợ từ, đại từ, lượng từ, cấu trúc cố định" },
];

export type ThemeAssignment = Record<string, string[]>; // themeId → các từ (đã sắp theo thứ tự học)

/** Dựng danh sách chủ đề theo thứ tự bộ chủ đề chung từ kết quả phân loại của một cấp; bỏ chủ đề trống và id lạ. */
export function themesFromAssignment(assignment: ThemeAssignment): HskTheme[] {
  return HSK_THEME_TAXONOMY.flatMap((t) => {
    const words = assignment[t.id];
    return words?.length ? [{ id: t.id, title: t.title, words }] : [];
  });
}

/** Đọc JSON model trả về `{"<từ>": "<mã chủ đề>"}`; chỉ giữ từ được hỏi với mã chủ đề hợp lệ. `missing` là các từ chưa phân loại được. */
export function parseThemeAssignment(raw: string, terms: string[]): { assigned: Record<string, string>; missing: string[] } {
  let json: unknown;
  try { json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")); } catch { return { assigned: {}, missing: [...terms] }; }
  const obj = json && typeof json === "object" ? ((json as { themes?: unknown }).themes ?? json) : {};
  const ids = new Set(HSK_THEME_TAXONOMY.map((t) => t.id));
  const assigned: Record<string, string> = {};
  if (obj && typeof obj === "object") {
    for (const term of terms) {
      const v = (obj as Record<string, unknown>)[term];
      if (typeof v === "string" && ids.has(v)) assigned[term] = v;
    }
  }
  return { assigned, missing: terms.filter((t) => !(t in assigned)) };
}

export function buildThemePrompt(items: { term: string; pinyin: string; meaning: string }[]): string {
  const taxonomy = HSK_THEME_TAXONOMY.map((t) => `${t.id}: ${t.title} (${t.hint})`).join("\n");
  const lines = items.map((i) => `${i.term} | ${i.pinyin} | ${i.meaning}`).join("\n");
  return `Các chủ đề (mã: tên (gợi ý)):
${taxonomy}

Danh sách từ (chữ giản thể | pinyin | nghĩa tiếng Anh):
${lines}

Xếp MỖI từ vào ĐÚNG MỘT chủ đề phù hợp nhất với nghĩa thông dụng của nó. Trả về JSON dạng {"<từ>": "<mã chủ đề>", ...} với đúng các từ ở trên, không thêm chữ nào ngoài JSON.`;
}
