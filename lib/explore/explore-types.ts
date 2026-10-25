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
}

export interface SceneDef {
  id: string;
  title: string;
  subtitle: string;
  /** Nhân vật dẫn đường: lời chào ở đầu cảnh. */
  guide: { name: string; greeting: string };
  objects: SceneObjectDef[];
}

/** Vật cảnh kèm thông tin từ điển (pinyin, Hán Việt, cấp HSK): các trường này KHÔNG viết tay mà lấy từ từ điển. */
export interface SceneWord extends SceneObjectDef {
  pinyin: string;
  sinoViet: string | null;
  hskLevel: number | null;
}

export interface SceneDetail extends Omit<SceneDef, "objects"> {
  objects: SceneWord[];
}
