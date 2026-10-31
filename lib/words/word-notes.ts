export const WORD_NOTES_KEY = "lyric-lab-word-notes";
export const WORD_NOTES_EVENT = "lyric-lab-word-notes-changed";
export const MAX_NOTE_CHARS = 300;
export const MAX_NOTES = 500;

/** Ghi chú cá nhân theo từ (khóa là chữ Hán giản thể của từ). Chỉ lưu ở thiết bị này. */
export type WordNotes = Record<string, string>;
export const EMPTY_NOTES: WordNotes = {};

export function parseWordNotes(raw: unknown): WordNotes {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return EMPTY_NOTES;
  const out: WordNotes = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v !== "string" || !/^\p{Script=Han}{1,12}$/u.test(k)) continue;
    const t = v.trim().slice(0, MAX_NOTE_CHARS);
    if (t) out[k] = t;
    if (Object.keys(out).length >= MAX_NOTES) break;
  }
  return Object.keys(out).length ? out : EMPTY_NOTES;
}

/** Đặt ghi chú cho một từ; rỗng thì xóa. Giữ tối đa MAX_NOTES ghi chú (đầy thì từ mới không thêm được, ghi chú cũ vẫn sửa được). */
export function setWordNote(notes: WordNotes, term: string, text: string): WordNotes {
  const t = text.trim().slice(0, MAX_NOTE_CHARS);
  if (!t) {
    if (!(term in notes)) return notes;
    const { [term]: _removed, ...rest } = notes; // eslint-disable-line @typescript-eslint/no-unused-vars
    return Object.keys(rest).length ? rest : EMPTY_NOTES;
  }
  if (!(term in notes) && Object.keys(notes).length >= MAX_NOTES) return notes;
  return { ...notes, [term]: t };
}
