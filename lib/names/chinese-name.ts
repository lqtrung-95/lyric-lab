import { GIVEN, SKIPPED_MIDDLE, SURNAMES, type NameChar } from "./name-data";

export interface NamePart { syllable: string; role: "surname" | "middle" | "given"; han: string | null; meaning: string | null }

export const NAME_MAX_CHARS = 40;
export const NAME_MAX_SYLLABLES = 5;

/** Tách tên thành các âm tiết viết thường (chuẩn hóa NFC), bỏ ký tự lạ. Rỗng nếu không có chữ nào hoặc quá dài. */
export function splitName(input: string): string[] {
  const clean = input.normalize("NFC").toLowerCase().replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim();
  if (!clean || [...clean].length > NAME_MAX_CHARS) return [];
  return clean.split(" ").slice(0, NAME_MAX_SYLLABLES);
}

/**
 * Chuyển tên Việt sang chữ Hán: âm đầu là họ, âm cuối là tên, còn lại là đệm. Âm chưa có trong bảng gợi ý thì `han` = null (không đoán).
 * Một tên chỉ có một âm thì coi là tên gọi (không có họ). "Thị" bị bỏ vì tên Hán thường không có.
 */
export function convertName(input: string): NamePart[] {
  const syllables = splitName(input);
  const hasSurname = syllables.length > 1;
  return syllables.flatMap<NamePart>((syllable, i) => {
    const role: NamePart["role"] = hasSurname && i === 0 ? "surname" : i === syllables.length - 1 ? "given" : "middle";
    if (role === "middle" && SKIPPED_MIDDLE.has(syllable)) return [];
    if (role === "surname") return [{ syllable, role, han: SURNAMES[syllable] ?? null, meaning: SURNAMES[syllable] ? "họ" : null }];
    const c: NameChar | undefined = GIVEN[syllable];
    return [{ syllable, role, han: c?.han ?? null, meaning: c?.meaning ?? null }];
  });
}

/** Tên Hán ghép lại (null nếu còn âm chưa có chữ). */
export function joinHan(parts: readonly NamePart[]): string | null {
  return parts.length > 0 && parts.every((p) => p.han) ? parts.map((p) => p.han).join("") : null;
}
