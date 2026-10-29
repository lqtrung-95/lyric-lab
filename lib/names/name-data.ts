/**
 * Bảng chuyển tên Việt sang chữ Hán theo âm Hán Việt. Họ là cách viết chuẩn; tên gọi chọn MỘT chữ đẹp, nghĩa tốt cho mỗi âm
 * (một âm có nhiều chữ Hán, đây là gợi ý chứ không phải duy nhất). Nghĩa tiếng Việt do ta viết; pinyin KHÔNG viết tay mà tra từ điển ở máy chủ.
 */
export interface NameChar { han: string; meaning: string }

export const SURNAMES: Record<string, string> = {
  nguyễn: "阮", trần: "陈", lê: "黎", phạm: "范", hoàng: "黄", huỳnh: "黄", phan: "潘", vũ: "武", võ: "武", đặng: "邓", bùi: "裴", đỗ: "杜", hồ: "胡", ngô: "吴",
  dương: "杨", lý: "李", đinh: "丁", lương: "梁", trịnh: "郑", đào: "陶", đoàn: "段", mai: "梅", cao: "高", lâm: "林", tạ: "谢", hà: "何", trương: "张", lưu: "刘",
  châu: "周", tô: "苏", thái: "蔡", quách: "郭", kiều: "乔", chu: "朱", từ: "徐", tăng: "曾", giang: "江", phùng: "冯", vương: "王", diệp: "叶", la: "罗", mạc: "莫",
  tống: "宋", triệu: "赵", lục: "陆", lại: "赖", nghiêm: "严", khương: "姜", thạch: "石", hứa: "许", doãn: "尹", tiêu: "萧", bạch: "白", âu: "欧", liêu: "廖", lăng: "凌",
};

/** Âm đệm "Thị" của nữ thường không dịch sang tên Hán, nên bỏ qua khi ghép tên. */
export const SKIPPED_MIDDLE = new Set(["thị"]);

export const GIVEN: Record<string, NameChar> = {
  an: { han: "安", meaning: "bình an" }, anh: { han: "英", meaning: "tinh anh, tài giỏi" }, ánh: { han: "映", meaning: "ánh sáng chiếu rọi" }, bách: { han: "柏", meaning: "cây bách bền bỉ" },
  bảo: { han: "宝", meaning: "quý báu" }, bình: { han: "平", meaning: "bình yên" }, cẩm: { han: "锦", meaning: "gấm vóc" }, châu: { han: "珠", meaning: "ngọc trai" },
  chi: { han: "芝", meaning: "linh chi, cỏ quý" }, chinh: { han: "征", meaning: "chinh phục" }, cường: { han: "强", meaning: "mạnh mẽ" }, dũng: { han: "勇", meaning: "dũng cảm" },
  dung: { han: "容", meaning: "dung mạo, khoan dung" }, duy: { han: "维", meaning: "gìn giữ, kết nối" }, duyên: { han: "缘", meaning: "duyên phận" }, dương: { han: "阳", meaning: "mặt trời" },
  đạt: { han: "达", meaning: "đạt thành" }, đức: { han: "德", meaning: "đạo đức" }, điệp: { han: "蝶", meaning: "bươm bướm" }, định: { han: "定", meaning: "vững vàng" },
  đông: { han: "东", meaning: "phương đông" }, đan: { han: "丹", meaning: "màu đỏ son" }, đào: { han: "桃", meaning: "hoa đào" }, đại: { han: "大", meaning: "to lớn" },
  đăng: { han: "登", meaning: "bước lên cao" }, giang: { han: "江", meaning: "dòng sông" }, hà: { han: "河", meaning: "dòng sông" }, hải: { han: "海", meaning: "biển cả" },
  hạnh: { han: "幸", meaning: "hạnh phúc" }, hân: { han: "欣", meaning: "vui mừng" }, hiền: { han: "贤", meaning: "hiền tài" }, hiếu: { han: "孝", meaning: "hiếu thảo" },
  hoa: { han: "花", meaning: "bông hoa" }, hoài: { han: "怀", meaning: "ấp ủ, nhớ thương" }, hoàng: { han: "煌", meaning: "rực rỡ" }, hồng: { han: "红", meaning: "màu hồng đỏ may mắn" },
  huệ: { han: "惠", meaning: "ân huệ" }, hùng: { han: "雄", meaning: "hùng mạnh" }, hương: { han: "香", meaning: "hương thơm" }, huy: { han: "辉", meaning: "rạng rỡ" },
  hưng: { han: "兴", meaning: "hưng thịnh" }, hằng: { han: "恒", meaning: "bền lâu" }, hòa: { han: "和", meaning: "hòa thuận" }, hậu: { han: "厚", meaning: "đôn hậu" },
  hợp: { han: "合", meaning: "hòa hợp" }, hiệp: { han: "侠", meaning: "hiệp nghĩa" }, khánh: { han: "庆", meaning: "mừng vui" }, khang: { han: "康", meaning: "khỏe mạnh" },
  khôi: { han: "魁", meaning: "đứng đầu" }, kiên: { han: "坚", meaning: "kiên cường" }, kiều: { han: "娇", meaning: "xinh đẹp yêu kiều" }, kim: { han: "金", meaning: "vàng" },
  khoa: { han: "科", meaning: "khoa bảng" }, khải: { han: "凯", meaning: "khải hoàn" }, kỳ: { han: "琪", meaning: "ngọc đẹp" }, lam: { han: "蓝", meaning: "xanh lam" },
  lan: { han: "兰", meaning: "hoa lan" }, lâm: { han: "林", meaning: "rừng" }, linh: { han: "灵", meaning: "linh hoạt, thông tuệ" }, liên: { han: "莲", meaning: "hoa sen" },
  long: { han: "龙", meaning: "rồng" }, lộc: { han: "禄", meaning: "phúc lộc" }, lệ: { han: "丽", meaning: "xinh đẹp" }, loan: { han: "鸾", meaning: "chim loan, phượng" },
  lợi: { han: "利", meaning: "thuận lợi" }, lực: { han: "力", meaning: "sức mạnh" }, mai: { han: "梅", meaning: "hoa mai" }, mạnh: { han: "孟", meaning: "đứng đầu, trưởng" },
  minh: { han: "明", meaning: "sáng suốt" }, my: { han: "眉", meaning: "đôi mày thanh tú" }, mỹ: { han: "美", meaning: "xinh đẹp" }, mẫn: { han: "敏", meaning: "nhanh nhạy" },
  nam: { han: "南", meaning: "phương nam" }, ngân: { han: "银", meaning: "bạc" }, nghĩa: { han: "义", meaning: "nghĩa khí" }, ngọc: { han: "玉", meaning: "ngọc quý" },
  nguyên: { han: "元", meaning: "khởi đầu" }, nhân: { han: "仁", meaning: "nhân ái" }, nhi: { han: "儿", meaning: "bé nhỏ đáng yêu" }, nhung: { han: "绒", meaning: "nhung mềm mại" },
  như: { han: "如", meaning: "như ý" }, nga: { han: "娥", meaning: "nàng tiên nga" }, nhật: { han: "日", meaning: "mặt trời" }, nhàn: { han: "闲", meaning: "thong dong" },
  phát: { han: "发", meaning: "phát đạt" }, phi: { han: "飞", meaning: "bay cao" }, phong: { han: "风", meaning: "gió" }, phúc: { han: "福", meaning: "phúc lành" },
  phước: { han: "福", meaning: "phúc lành" }, phương: { han: "芳", meaning: "thơm ngát" }, phụng: { han: "凤", meaning: "chim phượng" }, quân: { han: "君", meaning: "quân tử" },
  quang: { han: "光", meaning: "ánh sáng" }, quốc: { han: "国", meaning: "quốc gia" }, quyên: { han: "娟", meaning: "xinh đẹp dịu dàng" }, quỳnh: { han: "琼", meaning: "ngọc quỳnh" },
  quý: { han: "贵", meaning: "cao quý" }, sơn: { han: "山", meaning: "núi" }, sinh: { han: "生", meaning: "sự sống" }, sương: { han: "霜", meaning: "sương" },
  tâm: { han: "心", meaning: "trái tim" }, tân: { han: "新", meaning: "mới mẻ" }, tài: { han: "才", meaning: "tài năng" }, thái: { han: "泰", meaning: "bình yên thịnh vượng" },
  thanh: { han: "清", meaning: "trong sáng" }, thảo: { han: "草", meaning: "cỏ xanh" }, thắng: { han: "胜", meaning: "chiến thắng" }, thành: { han: "成", meaning: "thành công" },
  thịnh: { han: "盛", meaning: "hưng thịnh" }, thiện: { han: "善", meaning: "thiện lương" }, thu: { han: "秋", meaning: "mùa thu" }, thủy: { han: "水", meaning: "nước" },
  thúy: { han: "翠", meaning: "xanh biếc" }, thi: { han: "诗", meaning: "thơ" }, thuận: { han: "顺", meaning: "thuận lợi" }, thọ: { han: "寿", meaning: "trường thọ" },
  thục: { han: "淑", meaning: "hiền thục" }, tiên: { han: "仙", meaning: "tiên" }, tiến: { han: "进", meaning: "tiến lên" }, tín: { han: "信", meaning: "chữ tín" },
  toàn: { han: "全", meaning: "trọn vẹn" }, trang: { han: "庄", meaning: "trang nghiêm" }, trí: { han: "智", meaning: "trí tuệ" }, trúc: { han: "竹", meaning: "cây trúc" },
  trung: { han: "忠", meaning: "trung thành" }, trinh: { han: "贞", meaning: "trong trắng" }, tú: { han: "秀", meaning: "thanh tú" }, tuấn: { han: "俊", meaning: "tuấn tú" },
  tùng: { han: "松", meaning: "cây tùng" }, tuyết: { han: "雪", meaning: "tuyết" }, tuệ: { han: "慧", meaning: "thông tuệ" }, tường: { han: "祥", meaning: "may mắn" },
  tố: { han: "素", meaning: "thanh khiết" }, uyên: { han: "渊", meaning: "sâu sắc uyên bác" }, vân: { han: "云", meaning: "mây" }, văn: { han: "文", meaning: "văn chương" },
  vinh: { han: "荣", meaning: "vinh quang" }, việt: { han: "越", meaning: "vượt trội" }, vy: { han: "薇", meaning: "hoa tường vi" }, vĩ: { han: "伟", meaning: "vĩ đại" },
  vũ: { han: "宇", meaning: "vũ trụ" }, vượng: { han: "旺", meaning: "thịnh vượng" }, xuân: { han: "春", meaning: "mùa xuân" }, yến: { han: "燕", meaning: "chim én" },
  ý: { han: "意", meaning: "ý chí" }, oanh: { han: "莺", meaning: "chim oanh" }, diệu: { han: "妙", meaning: "kỳ diệu" }, diễm: { han: "艳", meaning: "kiều diễm" },
  yên: { han: "安", meaning: "bình yên" },
  // Bổ sung các âm hay gặp (huyền, nguyệt, nhiên, trân, thư...). Mỗi âm chọn MỘT chữ đẹp, nghĩa tốt.
  huyền: { han: "玄", meaning: "huyền diệu, sâu xa" }, hiển: { han: "显", meaning: "hiển đạt, rõ ràng" }, hoan: { han: "欢", meaning: "vui vẻ" }, hạ: { han: "夏", meaning: "mùa hạ" },
  hào: { han: "豪", meaning: "hào kiệt" }, kiệt: { han: "杰", meaning: "kiệt xuất" }, luân: { han: "伦", meaning: "đạo lý, luân thường" }, mộc: { han: "木", meaning: "cây gỗ" },
  mộng: { han: "梦", meaning: "giấc mộng đẹp" }, nguyệt: { han: "月", meaning: "ánh trăng" }, nhã: { han: "雅", meaning: "thanh nhã" }, nhiên: { han: "然", meaning: "tự nhiên" },
  nhu: { han: "柔", meaning: "dịu dàng" }, sâm: { han: "森", meaning: "rừng cây xanh tốt" }, tiểu: { han: "小", meaning: "nhỏ nhắn đáng yêu" }, tình: { han: "情", meaning: "tình cảm" },
  trà: { han: "茶", meaning: "hoa trà" }, trâm: { han: "簪", meaning: "cây trâm cài tóc" }, triết: { han: "哲", meaning: "hiền triết, thông thái" }, trọng: { han: "重", meaning: "coi trọng" },
  trường: { han: "长", meaning: "dài lâu" }, tư: { han: "思", meaning: "suy nghĩ, nhớ nhung" }, uy: { han: "威", meaning: "uy nghiêm" }, uyển: { han: "婉", meaning: "dịu dàng uyển chuyển" },
  vạn: { han: "万", meaning: "muôn vàn" }, ân: { han: "恩", meaning: "ân nghĩa" }, ái: { han: "爱", meaning: "yêu thương" }, băng: { han: "冰", meaning: "băng trong" },
  bích: { han: "碧", meaning: "ngọc xanh biếc" }, cầm: { han: "琴", meaning: "đàn cầm" }, cúc: { han: "菊", meaning: "hoa cúc" }, chiến: { han: "战", meaning: "chiến đấu" },
  chân: { han: "真", meaning: "chân thật" }, dạ: { han: "夜", meaning: "đêm" }, di: { han: "怡", meaning: "vui vẻ thư thái" }, dĩnh: { han: "颖", meaning: "thông minh sáng dạ" },
  đoan: { han: "端", meaning: "đoan chính" }, đồng: { han: "桐", meaning: "cây ngô đồng" }, hiên: { han: "轩", meaning: "khí độ ung dung" }, huân: { han: "勋", meaning: "công huân" },
  khuê: { han: "奎", meaning: "sao Khuê, văn chương" }, kha: { han: "柯", meaning: "cành cây" }, liễu: { han: "柳", meaning: "cây liễu" }, ly: { han: "璃", meaning: "lưu ly, ngọc trong" },
  nghi: { han: "仪", meaning: "phong thái" }, ngôn: { han: "言", meaning: "lời nói" }, san: { han: "珊", meaning: "san hô" }, sa: { han: "沙", meaning: "cát" },
  thăng: { han: "升", meaning: "thăng tiến" }, thiên: { han: "天", meaning: "trời" }, thư: { han: "书", meaning: "sách, thư thái" }, tĩnh: { han: "静", meaning: "tĩnh lặng" },
  trân: { han: "珍", meaning: "trân quý" }, trầm: { han: "沉", meaning: "trầm tĩnh" }, tuyền: { han: "泉", meaning: "dòng suối" }, tuyên: { han: "宣", meaning: "tuyên bố, rõ ràng" },
  vọng: { han: "望", meaning: "hy vọng" }, xuyên: { han: "川", meaning: "dòng sông" }, cát: { han: "吉", meaning: "cát tường" }, lĩnh: { han: "岭", meaning: "đỉnh núi" },
  diệp: { han: "叶", meaning: "chiếc lá" }, lương: { han: "良", meaning: "lương thiện" }, phượng: { han: "凤", meaning: "chim phượng" }, quế: { han: "桂", meaning: "cây quế" },
};

/** Họ có chữ đa âm mà từ điển hay chọn cách đọc khác khi đứng riêng: ép cách đọc khi dùng làm họ. */
export const SURNAME_PINYIN: Record<string, string> = { 曾: "zēng", 单: "shàn", 区: "ōu", 仇: "qiú", 查: "zhā", 解: "xiè", 朴: "piáo", 万: "wàn" };

/** Chữ dùng trong tên mà từ điển hay chọn cách đọc hiếm khi đứng riêng (叶 hay ra xié, 长 ra zhǎng...): ép cách đọc thông dụng của tên người. Áp cho mọi vị trí trong tên. */
export const NAME_PINYIN: Record<string, string> = {
  ...SURNAME_PINYIN,
  叶: "yè", 长: "cháng", 重: "zhòng", 和: "hé", 兴: "xīng", 丽: "lì", 陆: "lù", 何: "hé", 柏: "bǎi", 发: "fā", 禄: "lù", 乐: "lè", 都: "dū", 盛: "shèng", 朝: "zhāo", 行: "xíng", 蕃: "fān",
};
