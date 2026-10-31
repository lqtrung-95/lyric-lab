/**
 * Âm Hán Việt của một từ = ghép âm đầu tiên của từng chữ ("城市" → "thành thị").
 * **Truyền dạng phồn thể của từ** (`DictWordRow.traditional`): Unihan gán âm cho chữ phồn thể, chữ giản thể
 * thường thiếu hoặc ra âm Nôm (忆 → "hắt", trong khi 憶 → "ức").
 * Chỉ trả về khi mọi chữ Hán đều có trong bảng; thiếu chữ nào thì trả null (không đoán).
 * `simplified` (tuỳ chọn): dạng giản thể của từ, dùng khi chữ phồn thể thiếu trong bảng.
 * Chữ có nhiều âm lấy âm đầu tiên trong Unihan; Unihan lẫn cả âm Nôm nên có ca sai (袋 → "đãy" thay vì "đại").
 */
// Chữ nhiều âm mà âm đầu tiên của Unihan không phải âm thông dụng (好 liệt kê "hiếu" trước "hảo"). Chỉ thêm khi đã xác nhận bằng dữ liệu thật.
const COMMON_SINO_VIET: Record<string, string> = { 好: "hảo" };

// Bảng bổ sung cho chữ thông dụng mà Unihan không có âm Hán Việt (đo trên từ vựng HSK 1–6: 需 nhu, 别 biệt, 话 thoại... làm cả từ như 需要, 别人, 电话 bị để trống).
// Khóa theo chữ giản thể hoặc phồn thể; chỉ thêm chữ có âm Hán Việt thông dụng, chắc chắn; chữ khẩu ngữ/vay mượn không có âm Hán Việt (她, 咖, 啡, 咱...) thì để trống.
export const SUPPLEMENT_SINO_VIET: Record<string, string> = {
  需: "nhu", 别: "biệt", 帮: "bang", 假: "giả", 昨: "tạc", 话: "thoại", 词: "từ", 纸: "chỉ", 办: "biện", 阴: "âm", 烟: "yên", 绝: "tuyệt", 却: "khước", 率: "suất",
  伞: "tản", 鲜: "tiên", 巨: "cự", 湿: "thấp", 聊: "liêu", 阅: "duyệt", 析: "tích", 尝: "thường", 戏: "hí", 犹: "do", 肤: "phu", 肩: "kiên", 肠: "tràng", 卧: "ngọa",
  骂: "mạ", 赔: "bồi", 辅: "phụ", 软: "nhuyễn", 醉: "túy", 锁: "tỏa", 幕: "mạc", 艳: "diễm", 岛: "đảo", 宅: "trạch", 允: "doãn", 剑: "kiếm", 吊: "điếu", 咨: "tư",
  践: "tiễn", 慧: "tuệ", 棉: "miên", 毁: "hủy", 阔: "khoát", 煮: "chử", 耀: "diệu", 祖: "tổ", 矿: "khoáng", 杂: "tạp", 账: "trướng", 钻: "toản", 缩: "súc", 贴: "thiếp",
  赞: "tán", 辩: "biện", 迅: "tấn", 酸: "toan", 夹: "giáp", 糟: "tao", 糕: "cao", 罚: "phạt", 团: "đoàn", 录: "lục", 场: "trường", 刚: "cương", 饿: "ngạ", 摆: "bãi",
  鸡: "kê", 赖: "lại", 脏: "tạng", 挡: "đáng", 当: "đương", 袜: "mạt", 碗: "uyển",
  別: "biệt", 幫: "bang", 話: "thoại", 詞: "từ", 紙: "chỉ", 辦: "biện", 陰: "âm", 煙: "yên", 絕: "tuyệt", 鮮: "tiên", 濕: "thấp", 閱: "duyệt", 嘗: "thường", 戲: "hí",
  這: "giá", 这: "giá", 着: "trước", 睛: "tinh", 筷: "khoái", 并: "tịnh", 並: "tịnh", 晒: "sái", 曬: "sái", 騙: "phiến", 骗: "phiến", 仲: "trọng", 伺: "tứ", 侃: "khản", 俘: "phu", 剃: "thế", 剏: "sáng", 垻: "bá", 塼: "chuyên",
  媚: "mị", 嬉: "hi", 履: "lý", 岡: "cương", 冈: "cương", 岳: "nhạc", 巔: "điên", 巅: "điên", 拓: "thác", 搾: "trá", 榨: "trá", 撼: "hám", 晝: "trú", 昼: "trú", 殻: "xác", 渣: "tra", 溯: "tố", 瓣: "biện", 畸: "cơ", 疇: "trù", 畴: "trù",
  痒: "dưỡng", 癢: "dưỡng", 瘓: "hoán", 痪: "hoán", 瘤: "lựu", 癮: "ẩn", 瘾: "ẩn", 睜: "tranh", 睁: "tranh", 矚: "chúc", 瞩: "chúc", 稼: "giá", 窯: "diêu", 窑: "diêu", 竣: "tuấn", 粘: "niêm", 粽: "tống", 紊: "vấn",
  繽: "tân", 缤: "tân", 纖: "tiêm", 纤: "tiêm", 纜: "lãm", 缆: "lãm", 翅: "sí", 聳: "tủng", 耸: "tủng", 聾: "lung", 聋: "lung", 肇: "triệu", 肪: "phương", 胚: "phôi", 脂: "chi", 膀: "bàng", 膊: "bạc", 膩: "nị", 腻: "nị", 臊: "tao",
  芯: "tâm", 茲: "tư", 兹: "tư", 藹: "ái", 蔼: "ái", 袱: "phục", 裔: "duệ", 覆: "phúc", 訝: "nhạ", 讶: "nhạ", 賃: "nhẫm", 赁: "nhẫm", 輻: "phúc", 辐: "phúc", 辮: "biện", 辫: "biện", 迪: "địch", 逗: "đậu", 醇: "thuần", 醞: "uẩn", 酝: "uẩn",
  采: "thái", 鈔: "sao", 钞: "sao", 銹: "tú", 锈: "tú", 鎊: "bảng", 镑: "bảng", 鑄: "chú", 铸: "chú", 阱: "tỉnh", 隕: "vẫn", 陨: "vẫn", 靶: "bả", 韌: "nhận", 韧: "nhận", 飃: "phiêu", 馱: "đà", 驮: "đà", 騐: "nghiệm", 鯊: "sa", 鲨: "sa",
};

import { modernizeTone, overrideSinoViet, WORD_SINO_VIET_OVERRIDES } from "./sino-viet-overrides";

export function sinoVietForWord(word: string, readings: ReadonlyMap<string, string[]>, simplified?: string): string | null {
  const whole = WORD_SINO_VIET_OVERRIDES.get(word) ?? (simplified ? WORD_SINO_VIET_OVERRIDES.get(simplified) : undefined);
  if (whole) return whole;
  const parts: string[] = [];
  // Chữ phồn thể không có trong bảng thì thử chữ giản thể cùng vị trí (như 況 thiếu mà 况 có "huống"), rồi tới bảng bổ sung.
  const simpChars = simplified && [...simplified].length === [...word].length ? [...simplified] : null;
  let i = -1;
  for (const ch of word) {
    i++;
    if (!/\p{Script=Han}/u.test(ch)) return null;
    const simp = simpChars?.[i];
    const r = COMMON_SINO_VIET[ch] ?? overrideSinoViet(ch) ?? (simp ? overrideSinoViet(simp) : undefined) ?? readings.get(ch)?.[0] ?? (simp ? readings.get(simp)?.[0] : undefined) ?? SUPPLEMENT_SINO_VIET[ch] ?? (simp ? SUPPLEMENT_SINO_VIET[simp] : undefined);
    if (!r) return null;
    parts.push(r);
  }
  return parts.length ? modernizeTone(parts.join(" ")) : null;
}
