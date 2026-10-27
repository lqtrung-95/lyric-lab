/** Chủ đề để lọc hội thoại; "scene" là hội thoại ngắn lấy từ các cảnh của Khám phá. */
export type DialogueTopic = "life" | "food" | "travel" | "health" | "work" | "shopping" | "scene";

export const DIALOGUE_TOPICS: { id: DialogueTopic; label: string; emoji: string }[] = [
  { id: "life", label: "Đời sống", emoji: "🏠" },
  { id: "food", label: "Ăn uống", emoji: "🍜" },
  { id: "shopping", label: "Mua sắm", emoji: "🛍️" },
  { id: "travel", label: "Đi lại", emoji: "🚆" },
  { id: "health", label: "Sức khỏe", emoji: "💊" },
  { id: "work", label: "Học tập và công việc", emoji: "💼" },
  { id: "scene", label: "Từ các cảnh Khám phá", emoji: "🧭" },
];

export interface DialogueLine {
  /** Chỉ số người nói trong `speakers`. */
  who: number;
  zh: string;
  vi: string;
}

/** Một hội thoại hai người, tự viết (không lấy từ nguồn có bản quyền). Pinyin và cấp HSK không viết tay mà lấy từ từ điển. */
export interface DialogueDef {
  id: string;
  title: { zh: string; vi: string };
  topic: DialogueTopic;
  speakers: [string, string];
  lines: DialogueLine[];
  /** Hội thoại lấy từ một cảnh Khám phá: dùng để mời người học sang học từ ở cảnh đó. */
  sceneId?: string;
}

/** Nhóm cấp để lọc (cấp từ HSK 3.0 từ 4 trở lên gộp một nhóm). */
export type LevelBand = 1 | 2 | 3 | 4;

export const LEVEL_BANDS: { id: LevelBand; label: string }[] = [
  { id: 1, label: "HSK 1" },
  { id: 2, label: "HSK 2" },
  { id: 3, label: "HSK 3" },
  { id: 4, label: "HSK 4+" },
];

/** Thông tin hiện ở danh sách (không kèm pinyin). `level` null khi không tra được từ điển. */
export interface DialogueSummary {
  id: string;
  title: { zh: string; vi: string };
  topic: DialogueTopic;
  speakers: [string, string];
  lineCount: number;
  level: LevelBand | null;
  sceneId?: string;
  /** Chữ Hán và nghĩa Việt gộp lại, để tìm theo từ khóa ở client. */
  haystack: string;
}
