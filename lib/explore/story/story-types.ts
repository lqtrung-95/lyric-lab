// Kiểu dữ liệu của chế độ cốt truyện ("phá án") trong Khám phá. Cốt truyện là dữ liệu tĩnh (hội thoại có lựa chọn, manh mối, mục tiêu), điều khiển bằng "cờ" (flag):
// mỗi hành động của người chơi (nói chuyện, chọn đúng câu, tìm manh mối) đặt cờ hoặc thêm manh mối, và cờ quyết định hội thoại/mục tiêu/nhân vật nào hiện ra.

/** Điều kiện theo cờ: có đủ mọi cờ trong `all` và không có cờ nào trong `none`. Bỏ trống = luôn đúng. */
export interface Condition {
  all?: string[];
  none?: string[];
}

/** Hiệu ứng khi đi qua một câu thoại hoặc một lựa chọn: đặt cờ, hoặc thêm manh mối vào sổ vụ án. */
export type Effect = { flag: string } | { clue: string };

export interface DialogueChoice {
  /** Câu người chơi nói (tiếng Trung) và nghĩa tiếng Việt. */
  zh: string;
  vi: string;
  /** Câu thoại kế tiếp; null = kết thúc hội thoại. */
  next: string | null;
  when?: Condition;
  effects?: Effect[];
  /** Hành động đặc biệt khi chọn: mở bảng buộc tội. */
  action?: "accuse";
  /** Đánh dấu đây là câu kiểm tra hiểu: chọn đúng/sai được tính điểm (XP khi phá án xong). */
  check?: "right" | "wrong";
}

export interface DialogueNode {
  id: string;
  /** Id người nói (khóa trong `StoryDef.speakers`); `player` là nhân vật của bạn. */
  speaker: string;
  /** Có thể rỗng: câu chỉ có phần tiếng Việt (suy nghĩ của người chơi, câu hỏi kiểm tra hiểu). */
  zh: string;
  vi: string;
  /** Áp dụng đúng một lần khi câu này hiện ra. */
  effects?: Effect[];
  /** Có `choices` thì người chơi chọn; không thì bấm "Tiếp" sang `next`. */
  next?: string | null;
  choices?: DialogueChoice[];
}

export interface Speaker {
  name: string;
  /** Khóa sprite phẳng (xem components/explore/art/flat). */
  sprite: string;
}

/** Nơi vào hội thoại của một NPC: chọn mục đầu tiên có điều kiện đúng. */
export interface DialogueEntry {
  when?: Condition;
  node: string;
}

/** NPC của cốt truyện đứng trong cảnh (ngoài NPC từ vựng có sẵn của cảnh). */
export interface StoryNpc {
  id: string;
  name: string;
  sprite: string;
  x: number;
  y: number;
  w: number;
  when?: Condition;
  entries: DialogueEntry[];
}

/** Chỗ có thể xem xét để lấy manh mối (thư, biên lai, dấu chân...). Xem xong thì thêm `clue` vào sổ vụ án. */
export interface ClueSpot {
  id: string;
  clue: string;
  label: string;
  sprite: string;
  x: number;
  y: number;
  w: number;
  when?: Condition;
  /** Chỗ nhân vật đứng để xem (mặc định ngay trước chân). */
  stand?: { x: number; y: number };
}

export interface ClueDef {
  id: string;
  /** Tên manh mối (tiếng Việt) hiện trong sổ vụ án. */
  title: string;
  zh: string;
  vi: string;
  /** Cảnh tìm ra manh mối. */
  sceneId: string;
  kind: "document" | "object" | "testimony";
}

/** Phần cốt truyện của một cảnh: ai đứng đó nói được gì, có gì để xem xét, cả đồ thị hội thoại của cảnh. */
export interface StorySceneDef {
  sceneId: string;
  /** Hội thoại của NPC có sẵn của cảnh (theo id NPC của cảnh). */
  sceneNpcEntries?: DialogueEntry[];
  npcs?: StoryNpc[];
  spots?: ClueSpot[];
  dialogues: Record<string, DialogueNode>;
}

export interface Objective {
  id: string;
  /** Câu hướng dẫn (tiếng Việt) hiện trên đầu cảnh. */
  text: string;
  /** Mục tiêu hiện khi điều kiện đúng; mục tiêu đầu tiên chưa xong và đang hiện là mục tiêu hiện tại. */
  when?: Condition;
  /** Cảnh cần đến để làm mục tiêu này (bản đồ đánh dấu); bỏ trống nếu ở đâu cũng được. */
  sceneId?: string;
  /** Xong khi điều kiện đúng. */
  done: Condition;
}

export interface Suspect {
  id: string;
  name: string;
  sprite: string;
  sceneId: string;
  /** Một câu tóm tắt lời khai (tiếng Việt) hiện trong sổ vụ án khi đã gặp. */
  note: string;
  /** Cờ đặt khi đã nghe lời khai của người này. */
  metFlag: string;
}

export interface StoryDef {
  id: string;
  title: string;
  /** Mở đầu (tiếng Việt). */
  intro: string;
  speakers: Record<string, Speaker>;
  clues: ClueDef[];
  suspects: Suspect[];
  objectives: Objective[];
  scenes: Record<string, StorySceneDef>;
  /** Kết luận: thủ phạm đúng, các manh mối then chốt và số manh mối đúng tối thiểu cần chọn để buộc tội. */
  solution: { suspectId: string; keyClues: string[]; needed: number };
  /** Cờ đặt khi vụ án được giải. */
  solvedFlag: string;
  /** Khi nào được buộc tội (mở nút trong sổ vụ án). */
  accuseWhen: Condition;
  /** Cảnh bắt đầu và cảnh buộc tội. */
  startScene: string;
  accuseScene: string;
  /** Câu thoại (trong `accuseScene`) mở đầu đoạn kết khi phá án xong. */
  epilogueNode: string;
}

/** Tiến độ cốt truyện của người chơi (lưu trong trình duyệt). */
export interface StoryProgress {
  flags: string[];
  clues: string[];
  /** Số câu kiểm tra hiểu: đúng ngay lần đầu / tổng, để tính điểm XP khi phá án xong. */
  checks: { right: number; total: number };
  /** Đã gửi điểm XP của vụ án chưa (tránh gửi hai lần). */
  scored: boolean;
}
