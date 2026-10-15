// 绕口令 (câu thách đọc nhanh): các câu dân gian lưu truyền, không phải lời bài hát. Mỗi câu nhắm vào một cặp âm người Việt hay lẫn.
export interface TongueTwister { id: string; level: 1 | 2 | 3; han: string; pinyin: string; meaning: string; focus: string }

export const TONGUE_TWISTERS: TongueTwister[] = [
  { id: "si-shi", level: 1, han: "四是四，十是十，十四是十四，四十是四十。", pinyin: "Sì shì sì, shí shì shí, shísì shì shísì, sìshí shì sìshí.", meaning: "Bốn là bốn, mười là mười, mười bốn là mười bốn, bốn mươi là bốn mươi.", focus: "s – sh" },
  { id: "bai-hei", level: 1, han: "白石白又滑，搬来待考察。", pinyin: "Bái shí bái yòu huá, bān lái dài kǎochá.", meaning: "Đá trắng vừa trắng vừa trơn, khiêng về chờ khảo sát.", focus: "b – p – d – t" },
  { id: "pu-tao", level: 2, han: "吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮。", pinyin: "Chī pútao bù tǔ pútao pí, bù chī pútao dào tǔ pútao pí.", meaning: "Ăn nho không nhả vỏ nho, không ăn nho lại nhả vỏ nho.", focus: "p – t bật hơi" },
  { id: "niu-liu", level: 2, han: "牛郎恋刘娘，刘娘恋牛郎。", pinyin: "Niúláng liàn Liú niáng, Liú niáng liàn Niúláng.", meaning: "Ngưu Lang yêu nàng Lưu, nàng Lưu yêu Ngưu Lang.", focus: "n – l" },
  { id: "shi-shi", level: 2, han: "石室诗士施氏，嗜狮，誓食十狮。", pinyin: "Shí shì shī shì Shī shì, shì shī, shì shí shí shī.", meaning: "Thi sĩ họ Thi ở nhà đá, thích sư tử, thề ăn mười con sư tử.", focus: "sh – s" },
  { id: "hua-fa", level: 3, han: "黑化肥发灰，灰化肥发黑。", pinyin: "Hēi huàféi fā huī, huī huàféi fā hēi.", meaning: "Phân hóa học đen ngả xám, phân hóa học xám ngả đen.", focus: "h – f" },
  { id: "zhi-zhu", level: 3, han: "吃饭、吃粥、吃稀饭，喝茶、喝酒、喝汽水。", pinyin: "Chī fàn, chī zhōu, chī xīfàn, hē chá, hē jiǔ, hē qìshuǐ.", meaning: "Ăn cơm, ăn cháo, ăn cháo loãng, uống trà, uống rượu, uống nước ngọt.", focus: "ch – zh – sh" },
];
