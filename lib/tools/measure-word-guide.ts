export interface MeasureExample { zh: string; pinyin: string; vi: string }
export interface MeasureWordGuide { word: string; pinyin: string; usage: string; examples: MeasureExample[] }

/**
 * Các lượng từ thông dụng nhất, giải thích bằng tiếng Việt kèm ví dụ ngắn. Dữ liệu tự biên soạn (không lấy từ nguồn có bản quyền);
 * pinyin ghi theo cách đọc thật (một ở 一 đã biến điệu: yí gè, yì běn).
 */
export const MEASURE_WORD_GUIDE: readonly MeasureWordGuide[] = [
  { word: "个", pinyin: "gè", usage: "Lượng từ phổ thông cho người và rất nhiều vật không có lượng từ riêng. Không nhớ lượng từ nào thì dùng 个 vẫn được hiểu.", examples: [
    { zh: "一个人", pinyin: "yí gè rén", vi: "một người" }, { zh: "三个苹果", pinyin: "sān gè píngguǒ", vi: "ba quả táo" } ] },
  { word: "本", pinyin: "běn", usage: "Sách, vở, tạp chí: những thứ đóng thành quyển.", examples: [
    { zh: "一本书", pinyin: "yì běn shū", vi: "một quyển sách" }, { zh: "两本词典", pinyin: "liǎng běn cídiǎn", vi: "hai quyển từ điển" } ] },
  { word: "张", pinyin: "zhāng", usage: "Vật có mặt phẳng: giấy, ảnh, vé, bàn, giường.", examples: [
    { zh: "一张纸", pinyin: "yì zhāng zhǐ", vi: "một tờ giấy" }, { zh: "两张票", pinyin: "liǎng zhāng piào", vi: "hai tấm vé" } ] },
  { word: "条", pinyin: "tiáo", usage: "Vật dài và mềm hoặc hẹp: sông, đường, quần, cá, khăn.", examples: [
    { zh: "一条鱼", pinyin: "yì tiáo yú", vi: "một con cá" }, { zh: "一条裤子", pinyin: "yì tiáo kùzi", vi: "một chiếc quần" } ] },
  { word: "只", pinyin: "zhī", usage: "Động vật nhỏ (mèo, chim, gà) và một trong hai thứ thành đôi (một bàn tay, một con mắt).", examples: [
    { zh: "一只猫", pinyin: "yì zhī māo", vi: "một con mèo" }, { zh: "一只手", pinyin: "yì zhī shǒu", vi: "một bàn tay" } ] },
  { word: "件", pinyin: "jiàn", usage: "Áo mặc phần trên, hành lý, và việc (sự việc).", examples: [
    { zh: "一件衣服", pinyin: "yí jiàn yīfu", vi: "một chiếc áo" }, { zh: "一件事", pinyin: "yí jiàn shì", vi: "một việc" } ] },
  { word: "杯", pinyin: "bēi", usage: "Đồ uống đựng trong cốc, ly.", examples: [
    { zh: "一杯水", pinyin: "yì bēi shuǐ", vi: "một cốc nước" }, { zh: "两杯咖啡", pinyin: "liǎng bēi kāfēi", vi: "hai ly cà phê" } ] },
  { word: "瓶", pinyin: "píng", usage: "Đồ đựng trong chai, lọ.", examples: [
    { zh: "一瓶牛奶", pinyin: "yì píng niúnǎi", vi: "một chai sữa" }, { zh: "三瓶啤酒", pinyin: "sān píng píjiǔ", vi: "ba chai bia" } ] },
  { word: "把", pinyin: "bǎ", usage: "Vật có cán hoặc tay cầm để nắm: ghế, dao, ô, chìa khóa.", examples: [
    { zh: "一把椅子", pinyin: "yì bǎ yǐzi", vi: "một chiếc ghế" }, { zh: "一把伞", pinyin: "yì bǎ sǎn", vi: "một chiếc ô" } ] },
  { word: "辆", pinyin: "liàng", usage: "Xe có bánh: ô tô, xe đạp, xe buýt.", examples: [
    { zh: "一辆车", pinyin: "yí liàng chē", vi: "một chiếc xe" }, { zh: "两辆自行车", pinyin: "liǎng liàng zìxíngchē", vi: "hai chiếc xe đạp" } ] },
  { word: "位", pinyin: "wèi", usage: "Người, với sắc thái lịch sự, kính trọng.", examples: [
    { zh: "一位老师", pinyin: "yí wèi lǎoshī", vi: "một thầy giáo (cô giáo)" }, { zh: "三位客人", pinyin: "sān wèi kèrén", vi: "ba vị khách" } ] },
  { word: "双", pinyin: "shuāng", usage: "Hai thứ thành đôi: giày, tất, đũa.", examples: [
    { zh: "一双鞋", pinyin: "yì shuāng xié", vi: "một đôi giày" }, { zh: "一双筷子", pinyin: "yì shuāng kuàizi", vi: "một đôi đũa" } ] },
  { word: "块", pinyin: "kuài", usage: "Miếng, cục (bánh, xà phòng); trong khẩu ngữ còn là \"tệ\" khi nói giá tiền.", examples: [
    { zh: "一块蛋糕", pinyin: "yí kuài dàngāo", vi: "một miếng bánh" }, { zh: "三块钱", pinyin: "sān kuài qián", vi: "ba tệ" } ] },
  { word: "家", pinyin: "jiā", usage: "Cửa hàng, công ty, nhà hàng, bệnh viện: nơi kinh doanh hoặc cơ quan.", examples: [
    { zh: "一家商店", pinyin: "yì jiā shāngdiàn", vi: "một cửa hàng" }, { zh: "两家饭馆", pinyin: "liǎng jiā fànguǎn", vi: "hai quán ăn" } ] },
  { word: "口", pinyin: "kǒu", usage: "Số người trong gia đình (đếm miệng ăn).", examples: [{ zh: "我家有四口人", pinyin: "wǒ jiā yǒu sì kǒu rén", vi: "nhà tôi có bốn người" }] },
];
