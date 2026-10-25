import type { ExampleSentence } from "@/lib/courses/course-types";
import type { Vec } from "./player-movement";

/** Một vật chạm được trong cảnh. Vị trí tính theo % khung cảnh: (x, y) là điểm giữa-đáy của vật, w là chiều rộng. */
export interface SceneObjectDef {
  id: string;
  term: string;
  /** Nghĩa tiếng Việt do ta viết (từ điển chỉ có nghĩa tiếng Anh). */
  gloss: string;
  /** Câu ví dụ ngắn dùng chính từ này trong ngữ cảnh của cảnh, tự viết (không lấy lời bài hát thật). */
  example: { zh: string; vi: string };
  x: number;
  y: number;
  w: number;
  /** Vật đặt trên mặt đồ khác (sách trên bàn...): luôn vẽ phía trên các vật khác dù y nhỏ hơn. */
  above?: boolean;
  /** Vật gắn trên tường (cửa sổ): không đổ bóng xuống sàn. */
  wall?: boolean;
  /** Chỗ nhân vật đứng để tương tác (mặc định ngay trước chân vật). Đồ đặt trên bàn thì đứng trước bàn. */
  stand?: Vec;
}

/** Nhân vật không chơi (NPC) giao nhiệm vụ: đứng yên trong cảnh, người chơi lại gần và nhấn E (hoặc chạm vào) để nói chuyện. */
export interface SceneNpc {
  id: string;
  name: string;
  /** Lời chào mặc định, nói về cách chơi. */
  greeting: string;
  /** Lời khi người chơi chưa học đủ từ để nhận nhiệm vụ. */
  notReady: string;
  x: number;
  y: number;
  w: number;
  stand?: Vec;
}

export interface SceneDef {
  id: string;
  title: string;
  subtitle: string;
  npc: SceneNpc;
  objects: SceneObjectDef[];
}

/** Vật cảnh kèm thông tin từ điển (pinyin, Hán Việt, cấp HSK): các trường này KHÔNG viết tay mà lấy từ từ điển. */
export interface SceneWord extends SceneObjectDef {
  pinyin: string;
  sinoViet: string | null;
  hskLevel: number | null;
  /** Câu thật từ video/bài hát đã duyệt có chứa từ này (rỗng nếu chưa có chỉ mục); dùng làm nguồn cho thẻ ôn và cầu nối sang bài nghe. */
  examples: ExampleSentence[];
}

export interface SceneDetail extends Omit<SceneDef, "objects"> {
  objects: SceneWord[];
}
