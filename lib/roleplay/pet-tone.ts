/** Giọng nhận xét của linh vật do người học chọn. Chỉ gửi lên server đúng bốn giá trị này (không nhận chữ tự do) nên không thể chèn chỉ thị vào prompt. */
export const PET_TONES = ["encourage", "sweet", "sassy", "strict"] as const;
export type PetTone = (typeof PET_TONES)[number];

export const DEFAULT_PET_TONE: PetTone = "sassy";
export const PET_TONE_KEY = "lyric-lab-pet-tone";
export const PET_TONE_EVENT = "lyric-lab-pet-tone-changed";

export const PET_TONE_INFO: Record<PetTone, { label: string; emoji: string; desc: string }> = {
  encourage: { label: "Động viên", emoji: "🌱", desc: "Khen trước, sửa nhẹ nhàng, khuyến khích nói tiếp" },
  sweet: { label: "Thảo mai", emoji: "🍯", desc: "Ngọt như mía lùi, khen cường điệu rồi khéo sửa" },
  sassy: { label: "Đanh đá", emoji: "😼", desc: "Cà khịa, trêu thẳng nhưng vui, sửa cả lỗi nhỏ" },
  strict: { label: "Gắt", emoji: "🔥", desc: "Thẳng thừng như huấn luyện viên, bắt nói lại cho đúng" },
};

export const parsePetTone = (raw: unknown): PetTone => (typeof raw === "string" && (PET_TONES as readonly string[]).includes(raw) ? (raw as PetTone) : DEFAULT_PET_TONE);
