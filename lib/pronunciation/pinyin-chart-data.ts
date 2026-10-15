// Nội dung bảng âm tiết pinyin cho người Việt: phụ âm đầu (声母) và vần (韵母), mỗi âm có mẹo phát âm và hai ví dụ có chữ Hán (để phát giọng đọc chuẩn).
// So sánh với tiếng Việt chỉ mang tính gần đúng (hai ngôn ngữ không có cùng bộ âm), nên mỗi mẹo ghi rõ chỗ khác biệt cần chú ý.
export interface SoundExample { pinyin: string; han: string }
export interface Sound { symbol: string; tip: string; examples: [SoundExample, SoundExample] }
export interface SoundGroup { id: string; title: string; note?: string; sounds: Sound[] }

const ex = (pinyin: string, han: string): SoundExample => ({ pinyin, han });

export const INITIAL_GROUPS: SoundGroup[] = [
  {
    id: "moi", title: "Âm môi", note: "Hai môi hoặc môi–răng tạo âm.",
    sounds: [
      { symbol: "b", tip: "KHÔNG bật hơi, nghe gần như 'p' trong 'pa' (hoặc 'b' dứt khoát). Đặt tờ giấy trước miệng: giấy không được bay.", examples: [ex("bà", "爸"), ex("bā", "八")] },
      { symbol: "p", tip: "BẬT HƠI mạnh: thổi một luồng hơi ra, tờ giấy trước miệng phải bay. Tiếng Việt không có âm này (khác 'ph').", examples: [ex("pà", "怕"), ex("pí", "皮")] },
      { symbol: "m", tip: "Như 'm' tiếng Việt.", examples: [ex("mā", "妈"), ex("mǎi", "买")] },
      { symbol: "f", tip: "Như 'ph' tiếng Việt (răng trên chạm môi dưới).", examples: [ex("fā", "发"), ex("fàn", "饭")] },
    ],
  },
  {
    id: "dau-luoi", title: "Âm đầu lưỡi", note: "Cặp d–t khác nhau ở chỗ có bật hơi hay không.",
    sounds: [
      { symbol: "d", tip: "Không bật hơi, giống 't' tiếng Việt (như 'ta').", examples: [ex("dà", "大"), ex("dào", "到")] },
      { symbol: "t", tip: "BẬT HƠI, giống 'th' tiếng Việt (như 'thà').", examples: [ex("tā", "他"), ex("tiān", "天")] },
      { symbol: "n", tip: "Như 'n' tiếng Việt.", examples: [ex("nǐ", "你"), ex("nán", "难")] },
      { symbol: "l", tip: "Như 'l' tiếng Việt.", examples: [ex("lái", "来"), ex("lǎo", "老")] },
    ],
  },
  {
    id: "goc-luoi", title: "Âm gốc lưỡi", note: "Âm tạo ở phía sau miệng.",
    sounds: [
      { symbol: "g", tip: "Không bật hơi, giống 'c/k' tiếng Việt (như 'cá').", examples: [ex("gē", "哥"), ex("gè", "个")] },
      { symbol: "k", tip: "BẬT HƠI mạnh. Khác 'kh' tiếng Việt: 'kh' Việt là âm xát, còn k của tiếng Trung là âm bật.", examples: [ex("kàn", "看"), ex("kě", "渴")] },
      { symbol: "h", tip: "Gần giống 'kh' tiếng Việt: xát ở cuống họng, không phải 'h' nhẹ.", examples: [ex("hǎo", "好"), ex("hē", "喝")] },
    ],
  },
  {
    id: "mat-luoi", title: "Âm mặt lưỡi", note: "Môi dẹt, đầu lưỡi chạm chân răng dưới, mặt lưỡi áp vòm miệng. Chỉ đứng trước i và ü.",
    sounds: [
      { symbol: "j", tip: "Không bật hơi, gần 'ch' trong 'chi' nhưng môi dẹt và đầu lưỡi hạ xuống sau răng dưới.", examples: [ex("jiā", "家"), ex("jiǔ", "九")] },
      { symbol: "q", tip: "Như j nhưng BẬT HƠI mạnh.", examples: [ex("qù", "去"), ex("qī", "七")] },
      { symbol: "x", tip: "Gần 'x' trong 'xi', môi dẹt, mặt lưỡi sát vòm miệng.", examples: [ex("xiǎo", "小"), ex("xiè", "谢")] },
    ],
  },
  {
    id: "uon-luoi", title: "Âm uốn lưỡi", note: "Uốn đầu lưỡi lên phía vòm cứng. Người Việt miền Bắc dễ lẫn với z c s; người miền Nam có sẵn âm 'tr', 's' uốn lưỡi để so sánh.",
    sounds: [
      { symbol: "zh", tip: "Uốn lưỡi, không bật hơi; gần 'tr' giọng miền Nam.", examples: [ex("zhè", "这"), ex("zhōng", "中")] },
      { symbol: "ch", tip: "Như zh nhưng BẬT HƠI mạnh.", examples: [ex("chī", "吃"), ex("chá", "茶")] },
      { symbol: "sh", tip: "Uốn lưỡi, xát; gần 's' giọng miền Nam. KHÔNG phải 'x'.", examples: [ex("shì", "是"), ex("shū", "书")] },
      { symbol: "r", tip: "Uốn lưỡi, xát có rung dây thanh; gần 'r' miền Nam nhưng nhẹ hơn, đầu lưỡi không rung.", examples: [ex("rén", "人"), ex("rè", "热")] },
    ],
  },
  {
    id: "rang-luoi", title: "Âm đầu lưỡi–răng", note: "Đầu lưỡi áp sau răng cửa trên (không uốn lên vòm).",
    sounds: [
      { symbol: "z", tip: "Ghép 't' và 's' liền nhau (như 'ts' trong 'tsunami'), không bật hơi. Tiếng Việt không có âm tương đương.", examples: [ex("zài", "在"), ex("zuò", "做")] },
      { symbol: "c", tip: "Như z nhưng BẬT HƠI mạnh.", examples: [ex("cái", "才"), ex("cài", "菜")] },
      { symbol: "s", tip: "Gần 'x' tiếng Việt (như 'xa').", examples: [ex("sān", "三"), ex("sì", "四")] },
    ],
  },
  {
    id: "ban-nguyen-am", title: "Bán nguyên âm y, w", note: "Chỉ là cách viết khi âm tiết bắt đầu bằng i, u hoặc ü.",
    sounds: [
      { symbol: "y", tip: "Đọc như 'i' đầu âm tiết (yi ≈ 'i', ya ≈ 'ia').", examples: [ex("yī", "一"), ex("yǒu", "有")] },
      { symbol: "w", tip: "Đọc như 'u' đầu âm tiết (wo ≈ 'ua', wen ≈ 'uân').", examples: [ex("wǒ", "我"), ex("wèn", "问")] },
    ],
  },
];

export const FINAL_GROUPS: SoundGroup[] = [
  {
    id: "don", title: "Nguyên âm đơn",
    sounds: [
      { symbol: "a", tip: "Như 'a' tiếng Việt, mở miệng rộng.", examples: [ex("tā", "他"), ex("mā", "妈")] },
      { symbol: "o", tip: "Tròn môi. Sau b, p, m, f nghe gần 'ua' (bo ≈ 'pua').", examples: [ex("mō", "摸"), ex("pò", "破")] },
      { symbol: "e", tip: "Mở miệng vừa, môi KHÔNG tròn, lưỡi lùi sau; gần 'ơ' nhưng lưỡi kéo về sau (như 'ưa' ngắn).", examples: [ex("hé", "河"), ex("kě", "可")] },
      { symbol: "i", tip: "Như 'i'. Đặc biệt: sau z, c, s và zh, ch, sh, r thì đọc 'ư' kéo dài (zhi ≈ 'trư', si ≈ 'sư').", examples: [ex("nǐ", "你"), ex("shì", "是")] },
      { symbol: "u", tip: "Như 'u' tiếng Việt, tròn môi.", examples: [ex("shū", "书"), ex("bù", "不")] },
      { symbol: "ü", tip: "Tiếng Việt không có. Đọc 'i' rồi GIỮ NGUYÊN lưỡi và tròn môi như 'u'. Sau j, q, x, y chỉ viết u nhưng vẫn đọc ü.", examples: [ex("nǚ", "女"), ex("lǜ", "绿")] },
      { symbol: "er", tip: "Đọc 'ơ' rồi cong đầu lưỡi lên (âm uốn lưỡi).", examples: [ex("èr", "二"), ex("ér", "儿")] },
    ],
  },
  {
    id: "kep", title: "Nguyên âm kép",
    sounds: [
      { symbol: "ai", tip: "Như 'ai', a kéo dài, i nhẹ.", examples: [ex("ài", "爱"), ex("lái", "来")] },
      { symbol: "ei", tip: "Như 'ây' (trong 'bây').", examples: [ex("gěi", "给"), ex("hēi", "黑")] },
      { symbol: "ao", tip: "Như 'ao', a kéo dài, o nhẹ.", examples: [ex("hǎo", "好"), ex("lǎo", "老")] },
      { symbol: "ou", tip: "Như 'âu' / 'ôu': ô trượt sang u.", examples: [ex("tóu", "头"), ex("shǒu", "手")] },
    ],
  },
  {
    id: "mui-n", title: "Vần mũi -n", note: "Kết thúc bằng đầu lưỡi chạm lợi trên.",
    sounds: [
      { symbol: "an", tip: "Như 'an'.", examples: [ex("kàn", "看"), ex("nán", "难")] },
      { symbol: "en", tip: "Như 'ân' / 'ơn'.", examples: [ex("rén", "人"), ex("běn", "本")] },
      { symbol: "in", tip: "Như 'in'.", examples: [ex("xīn", "新"), ex("lín", "林")] },
      { symbol: "un", tip: "Viết un nhưng đọc 'uân' (uen).", examples: [ex("chūn", "春"), ex("kùn", "困")] },
      { symbol: "ün", tip: "ü + n: tròn môi như ü rồi kết thúc -n.", examples: [ex("yún", "云"), ex("qún", "群")] },
      { symbol: "ian", tip: "Đọc gần 'iên' (a ngắn và nghe như 'e').", examples: [ex("tiān", "天"), ex("nián", "年")] },
      { symbol: "uan", tip: "Như 'oan'.", examples: [ex("wán", "玩"), ex("guān", "关")] },
      { symbol: "üan", tip: "ü + 'en': tròn môi như ü rồi 'en'.", examples: [ex("yuǎn", "远"), ex("yuán", "圆")] },
    ],
  },
  {
    id: "mui-ng", title: "Vần mũi -ng", note: "Kết thúc ở cuống họng, đầu lưỡi KHÔNG chạm lợi. Hay lẫn với -n: in/ing, en/eng.",
    sounds: [
      { symbol: "ang", tip: "Như 'ang', mở rộng miệng.", examples: [ex("shàng", "上"), ex("máng", "忙")] },
      { symbol: "eng", tip: "Như 'ưng' / 'âng' (e + ng).", examples: [ex("néng", "能"), ex("lěng", "冷")] },
      { symbol: "ing", tip: "i + ng, khác 'in': không để đầu lưỡi chạm lợi.", examples: [ex("tīng", "听"), ex("xīng", "星")] },
      { symbol: "ong", tip: "Gần 'ung' (ô + ng), môi tròn.", examples: [ex("zhōng", "中"), ex("dōng", "东")] },
      { symbol: "iang", tip: "i + ang.", examples: [ex("xiǎng", "想"), ex("liǎng", "两")] },
      { symbol: "uang", tip: "Như 'oang'.", examples: [ex("chuáng", "床"), ex("huáng", "黄")] },
      { symbol: "iong", tip: "Gần 'iung'.", examples: [ex("yòng", "用"), ex("qióng", "穷")] },
      { symbol: "ueng", tip: "Chỉ có trong âm tiết 'weng'.", examples: [ex("wēng", "翁"), ex("wèng", "瓮")] },
    ],
  },
  {
    id: "dem", title: "Vần có i, u, ü đứng trước",
    sounds: [
      { symbol: "ia", tip: "i + a, đọc liền.", examples: [ex("jiā", "家"), ex("xià", "下")] },
      { symbol: "ie", tip: "i + ê (e đọc như 'ê').", examples: [ex("xiě", "写"), ex("xiè", "谢")] },
      { symbol: "iao", tip: "i + ao.", examples: [ex("xiǎo", "小"), ex("yào", "要")] },
      { symbol: "iu", tip: "Viết iu nhưng đọc 'iôu' (i + ô + u): liu ≈ 'liêu'.", examples: [ex("liù", "六"), ex("jiǔ", "九")] },
      { symbol: "ua", tip: "Như 'oa'.", examples: [ex("huā", "花"), ex("huà", "画")] },
      { symbol: "uo", tip: "Như 'uô' (u + ô).", examples: [ex("wǒ", "我"), ex("guò", "过")] },
      { symbol: "uai", tip: "Như 'oai'.", examples: [ex("kuài", "快"), ex("wài", "外")] },
      { symbol: "ui", tip: "Viết ui nhưng đọc 'uây' (uei).", examples: [ex("duì", "对"), ex("shuǐ", "水")] },
      { symbol: "üe", tip: "ü + ê: tròn môi như ü rồi 'ê'.", examples: [ex("yuè", "月"), ex("xué", "学")] },
    ],
  },
];

/** Các lỗi người Việt hay gặp nhất khi học phát âm tiếng Trung, kèm cách nhận ra. */
export const COMMON_MISTAKES: { title: string; body: string }[] = [
  { title: "Không bật hơi (p, t, k, q, ch, c)", body: "Thiếu luồng hơi nên p nghe thành b, t thành d, k thành g. Thử đặt tờ giấy trước miệng: với p, t, k, q, ch, c giấy phải bay." },
  { title: "Lẫn zh–z, ch–c, sh–s", body: "Người miền Bắc hay đọc zh/ch/sh thành z/c/s. Khi đọc zh/ch/sh hãy uốn đầu lưỡi lên vòm cứng, khi đọc z/c/s để đầu lưỡi nằm sau răng cửa." },
  { title: "Âm ü", body: "Thường bị đọc thành u. Đọc i trước, giữ nguyên lưỡi rồi mới tròn môi." },
  { title: "Thanh 2 và thanh 3", body: "Thanh 3 phải xuống thấp rồi mới lên (nếu chỉ lên là thanh 2). Thanh 2 lên đều, không có đoạn xuống." },
  { title: "Vần -n và -ng", body: "in/ing, en/eng bị lẫn. -n: đầu lưỡi chạm lợi trên. -ng: đầu lưỡi buông tự do, âm kết thúc ở cuống họng." },
];
