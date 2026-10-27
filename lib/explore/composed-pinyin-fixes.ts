/**
 * Từ ghép của cảnh chưa có trong từ điển: pinyin được ghép từ các chữ con, nhưng chữ đa âm hay bị chọn nhầm âm hiếm
 * (车 jū, 柜 jǔ, 汤 shāng…). Bảng này sửa riêng những từ đó; từ nào có trong từ điển thì không dùng bảng.
 */
export const COMPOSED_PINYIN_FIXES: Record<string, string> = {
  行李车: "xíng li chē",
  书车: "shū chē",
  药柜: "yào guì",
  点心柜: "diǎn xin guì",
  机柜: "jī guì",
  酸梅汤: "suān méi tāng",
  臂圈: "bì quān",
  打包袋: "dǎ bāo dài",
  发刷: "fà shuā",
};
