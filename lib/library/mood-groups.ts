/**
 * Nhóm cảm xúc của bài hát để lọc ở Thư viện. Tag cảm xúc trong bản phân tích (`moods`) do AI tự viết nên rất rời rạc (hơn 360 cách viết cho vài
 * trăm bài: "nhớ nhung", "hoài niệm, mộng mơ", "buồn bã nhưng hy vọng"…); gộp bằng bảng từ khóa cố định (không gọi AI, kết quả luôn như nhau)
 * thành vài nhóm đủ lớn để làm bộ lọc. Một bài có thể thuộc nhiều nhóm; tag không khớp nhóm nào thì bài chỉ hiện ở "Tất cả".
 */
export type MoodGroupId = "buon" | "hoai-niem" | "co-don" | "lang-man" | "hy-vong" | "vui-tuoi" | "am-ap" | "giang-xe";

export interface MoodGroup {
  id: MoodGroupId;
  label: string;
  /** Mẫu chuỗi (chữ thường) tìm trong từng tag; khớp một mẫu là thuộc nhóm. */
  keywords: string[];
}

export const MOOD_GROUPS: MoodGroup[] = [
  { id: "lang-man", label: "Lãng mạn, ngọt ngào", keywords: ["lãng mạn", "ngọt ngào", "yêu", "tình cảm", "tình ái", "say đắm", "đắm say", "mê đắm", "ngây ngất", "rung động", "nồng", "cuồng nhiệt", "mãnh liệt", "thầm thương", "thầm yêu", "thơ mộng", "dịu dàng", "thủy chung", "e ấp", "si tình", "đam mê", "mộng mơ", "tương tư"] },
  { id: "hoai-niem", label: "Hoài niệm, tiếc nuối", keywords: ["hoài niệm", "nostalgic", "tiếc", "nuối", "nhớ", "hối", "luyến", "day dứt", "da diết", "man mác", "bâng khuâng", "bồi hồi", "khắc khoải", "thao thức", "ân hận", "thanh xuân", "đơn phương", "chia tay", "tạm biệt", "duyên phận", "định mệnh", "nỗi niềm", "xao xuyến"] },
  { id: "buon", label: "Buồn, đau lòng", keywords: ["buồn", "đau", "tuyệt vọng", "vô vọng", "bi thương", "thất vọng", "chua xót", "xót xa", "u sầu", "u uất", "u ám", "tổn thương", "vỡ mộng", "bế tắc", "mất mát", "tủi", "cam chịu", "bất lực", "vô lực", "mệt mỏi", "buông", "từ bỏ", "lạnh lẽo", "khổ", "nhẫn nhục", "nhẫn nhịn", "dằn lòng", "yếu đuối"] },
  { id: "co-don", label: "Cô đơn", keywords: ["cô đơn", "đơn độc", "lạc lõng", "lạc lối", "lẻ loi", "bị bỏ rơi", "cô độc", "lạc đường"] },
  { id: "hy-vong", label: "Hy vọng, tiếp thêm động lực", keywords: ["hy vọng", "hi vọng", "hopeful", "encouraging", "lạc quan", "kiên", "quyết tâm", "quyết liệt", "dũng cảm", "tự tin", "cảm hứng", "động viên", "khích lệ", "mạnh mẽ", "nhiệt huyết", "nỗ lực", "vượt", "chiến thắng", "tự hào", "hoài bão", "tự khẳng định", "khát vọng", "ước mơ", "mong ước", "sống trọn"] },
  { id: "vui-tuoi", label: "Vui tươi, tràn năng lượng", keywords: ["vui", "hạnh phúc", "tinh nghịch", "nghịch ngợm", "hào hứng", "hứng khởi", "năng động", "phấn khích", "tươi", "trẻ trung", "hài hước", "dễ thương", "hồn nhiên", "ngây thơ", "trong sáng", "trong trẻo", "yêu đời", "sảng khoái", "hồi hộp", "tự do", "ánh sáng"] },
  { id: "am-ap", label: "Ấm áp, chữa lành", keywords: ["ấm áp", "chữa lành", "an ủi", "bình yên", "yên bình", "yên tĩnh", "tĩnh lặng", "nhẹ nhàng", "nhẹ nhõm", "thư giãn", "thanh thản", "thanh tao", "biết ơn", "chân thành", "tin tưởng", "bao dung", "trân trọng", "đồng cảm", "cảm động", "xúc động", "chúc phúc", "đồng hành", "sâu lắng", "sâu sắc", "chiêm nghiệm", "suy tư", "trưởng thành", "chấp nhận", "khoảng lặng", "tha thiết"] },
  { id: "giang-xe", label: "Giằng xé, bối rối", keywords: ["bối rối", "lo lắng", "lo âu", "hoang mang", "giằng xé", "mâu thuẫn", "xung đột", "bồn chồn", "bất an", "bất định", "do dự", "lưỡng lự", "ngập ngừng", "hoài nghi", "không chắc", "sợ hãi", "tức giận", "phẫn uất", "bực bội", "bức xúc", "uất ức", "căng thẳng", "ghen tuông", "ám ảnh", "băn khoăn", "mơ hồ"] },
];

const BY_ID = new Map(MOOD_GROUPS.map((g) => [g.id, g]));

/** Chuỗi tham số `?mood=` hợp lệ thì trả id nhóm, còn lại null (không tin đầu vào của client). */
export function parseMoodGroup(value: string | null | undefined): MoodGroupId | null {
  return value && BY_ID.has(value as MoodGroupId) ? (value as MoodGroupId) : null;
}

export const moodGroupLabel = (id: MoodGroupId): string => BY_ID.get(id)?.label ?? id;

/** Các nhóm mà một tag cảm xúc thuộc về (không phân biệt hoa thường). Tag dạng "buồn bã, hoài niệm" có thể thuộc nhiều nhóm. */
export function moodGroupsForTag(tag: string): MoodGroupId[] {
  const t = tag.toLowerCase().normalize("NFC");
  return MOOD_GROUPS.filter((g) => g.keywords.some((k) => t.includes(k))).map((g) => g.id);
}

/** Hợp các nhóm của mọi tag của bài, theo thứ tự cố định của `MOOD_GROUPS`. */
export function moodGroupsForSong(moods: readonly string[]): MoodGroupId[] {
  const found = new Set(moods.flatMap(moodGroupsForTag));
  return MOOD_GROUPS.filter((g) => found.has(g.id)).map((g) => g.id);
}

/** Nhóm chính của MỘT tag để chip trên trang bài dẫn tới bộ lọc đúng nhóm; null nếu tag không thuộc nhóm nào. */
export function primaryMoodGroupForTag(tag: string): MoodGroupId | null {
  return moodGroupsForTag(tag)[0] ?? null;
}
