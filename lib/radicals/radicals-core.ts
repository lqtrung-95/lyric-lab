/**
 * 214 bộ thủ Khang Hy: số thứ tự, chữ gốc, biến thể thường gặp (kể cả dạng giản thể), số nét, pinyin, tên Hán Việt và nghĩa tiếng Việt.
 * Bảng viết tay: nhiều bộ không phải từ độc lập nên từ điển không có mục (như bảng `RADICAL_NAMES`); pinyin ở đây chỉ để gọi tên bộ, còn pinyin của chữ chứa bộ luôn lấy từ từ điển.
 * Mỗi dòng: số|chữ|biến thể|số nét|pinyin|tên Hán Việt|nghĩa
 */
const LINES = [
  "1|一||1|yī|Nhất|số một", "2|丨||1|gǔn|Cổn|nét sổ", "3|丶||1|zhǔ|Chủ|nét chấm", "4|丿||1|piě|Phiệt|nét phẩy", "5|乙|乚乛|1|yǐ|Ất|can thứ hai, nét gập", "6|亅||1|jué|Quyết|nét móc",
  "7|二||2|èr|Nhị|số hai", "8|亠||2|tóu|Đầu|cái nắp", "9|人|亻|2|rén|Nhân|người", "10|儿||2|ér|Nhi|chân người đang đi, trẻ con", "11|入||2|rù|Nhập|vào", "12|八|丷|2|bā|Bát|số tám, chia ra",
  "13|冂||2|jiōng|Quynh|vùng biên, khung", "14|冖||2|mì|Mịch|cái khăn trùm", "15|冫||2|bīng|Băng|băng, đá lạnh", "16|几||2|jǐ|Kỷ|cái ghế, bàn nhỏ", "17|凵||2|kǎn|Khảm|há miệng, cái hố",
  "18|刀|刂|2|dāo|Đao|con dao", "19|力||2|lì|Lực|sức mạnh", "20|勹||2|bāo|Bao|bọc lại", "21|匕||2|bǐ|Chủy|cái thìa, con dao găm", "22|匚||2|fāng|Phương|cái hòm", "23|匸||2|xǐ|Hễ|che giấu",
  "24|十||2|shí|Thập|số mười", "25|卜||2|bǔ|Bốc|bói", "26|卩|㔾|2|jié|Tiết|đốt tre, dấu ấn", "27|厂||2|hàn|Hán|sườn núi", "28|厶||2|sī|Tư|riêng tư", "29|又||2|yòu|Hựu|lại nữa, bàn tay phải",
  "30|口||3|kǒu|Khẩu|miệng", "31|囗||3|wéi|Vi|vây quanh", "32|土||3|tǔ|Thổ|đất", "33|士||3|shì|Sĩ|học trò, người có học", "34|夂||3|zhǐ|Trĩ|đi theo sau", "35|夊||3|suī|Tuy|đi chậm",
  "36|夕||3|xī|Tịch|buổi tối", "37|大||3|dà|Đại|to lớn", "38|女||3|nǚ|Nữ|phụ nữ", "39|子||3|zǐ|Tử|con, trẻ con", "40|宀||3|mián|Miên|mái nhà", "41|寸||3|cùn|Thốn|tấc (đơn vị đo)",
  "42|小|⺌|3|xiǎo|Tiểu|nhỏ", "43|尢|尣|3|wāng|Uông|què, yếu", "44|尸||3|shī|Thi|xác chết, thân người", "45|屮||3|chè|Triệt|mầm cây", "46|山||3|shān|Sơn|núi", "47|巛|川|3|chuān|Xuyên|sông",
  "48|工||3|gōng|Công|thợ, công việc", "49|己||3|jǐ|Kỷ|bản thân", "50|巾||3|jīn|Cân|cái khăn", "51|干||3|gān|Can|khô, can thiệp", "52|幺||3|yāo|Yêu|nhỏ xíu", "53|广||3|guǎng|Nghiễm|mái nhà rộng",
  "54|廴||3|yǐn|Dẫn|bước dài", "55|廾||3|gǒng|Củng|chắp hai tay", "56|弋||3|yì|Dặc|bắn tên có dây", "57|弓||3|gōng|Cung|cái cung", "58|彐|⺕|3|jì|Ký|đầu con nhím", "59|彡||3|shān|Sam|lông, tia sáng", "60|彳||3|chì|Xích|bước chân trái",
  "61|心|忄⺗|4|xīn|Tâm|trái tim, tâm trí", "62|戈||4|gē|Qua|cây giáo", "63|戶|户|4|hù|Hộ|cửa một cánh", "64|手|扌|4|shǒu|Thủ|bàn tay", "65|支||4|zhī|Chi|cành, chi nhánh", "66|攴|攵|4|pū|Phộc|đánh nhẹ",
  "67|文||4|wén|Văn|chữ, văn chương", "68|斗||4|dǒu|Đẩu|cái đấu đong", "69|斤||4|jīn|Cân|cái rìu, cân", "70|方||4|fāng|Phương|vuông, phương hướng", "71|无|旡|4|wú|Vô|không", "72|日||4|rì|Nhật|mặt trời, ngày",
  "73|曰||4|yuē|Viết|nói rằng", "74|月||4|yuè|Nguyệt|mặt trăng, tháng", "75|木||4|mù|Mộc|cây, gỗ", "76|欠||4|qiàn|Khiếm|thiếu, ngáp", "77|止||4|zhǐ|Chỉ|dừng lại", "78|歹|歺|4|dǎi|Đãi|xấu, chết chóc",
  "79|殳||4|shū|Thù|binh khí, đánh", "80|毋||4|wú|Vô|đừng, chớ", "81|比||4|bǐ|Tỷ|so sánh", "82|毛||4|máo|Mao|lông", "83|氏||4|shì|Thị|họ", "84|气||4|qì|Khí|hơi, khí",
  "85|水|氵氺|4|shuǐ|Thủy|nước", "86|火|灬|4|huǒ|Hỏa|lửa", "87|爪|爫|4|zhǎo|Trảo|móng vuốt", "88|父||4|fù|Phụ|cha", "89|爻||4|yáo|Hào|vạch quẻ", "90|爿||4|qiáng|Tường|mảnh gỗ, giường",
  "91|片||4|piàn|Phiến|mảnh, tấm", "92|牙||4|yá|Nha|răng", "93|牛|牜|4|niú|Ngưu|con trâu, bò", "94|犬|犭|4|quǎn|Khuyển|con chó", "95|玄||5|xuán|Huyền|huyền bí, đen sẫm", "96|玉|王|5|yù|Ngọc|ngọc",
  "97|瓜||5|guā|Qua|quả dưa", "98|瓦||5|wǎ|Ngõa|ngói", "99|甘||5|gān|Cam|ngọt", "100|生||5|shēng|Sinh|sống, sinh ra", "101|用||5|yòng|Dụng|dùng", "102|田||5|tián|Điền|ruộng",
  "103|疋|⺪|5|pǐ|Thất|cuộn vải, đơn vị vải", "104|疒||5|nè|Nạch|bệnh tật", "105|癶||5|bō|Bát|hai chân gạt ngược", "106|白||5|bái|Bạch|màu trắng", "107|皮||5|pí|Bì|da", "108|皿||5|mǐn|Mãnh|cái đĩa, bát",
  "109|目|罒|5|mù|Mục|con mắt", "110|矛||5|máo|Mâu|cây mác", "111|矢||5|shǐ|Thỉ|mũi tên", "112|石||5|shí|Thạch|đá", "113|示|礻|5|shì|Thị|thần linh, tế lễ", "114|禸||5|róu|Nhựu|vết chân thú",
  "115|禾||5|hé|Hòa|cây lúa", "116|穴||5|xué|Huyệt|cái hang", "117|立||5|lì|Lập|đứng", "118|竹|⺮|6|zhú|Trúc|cây tre", "119|米||6|mǐ|Mễ|gạo", "120|糸|纟糹|6|mì|Mịch|sợi tơ",
  "121|缶||6|fǒu|Phẫu|cái vại sành", "122|网|罒冈|6|wǎng|Võng|cái lưới", "123|羊|⺶|6|yáng|Dương|con dê, cừu", "124|羽||6|yǔ|Vũ|lông vũ", "125|老|耂|6|lǎo|Lão|già", "126|而||6|ér|Nhi|mà, và",
  "127|耒||6|lěi|Lỗi|cái cày", "128|耳||6|ěr|Nhĩ|cái tai", "129|聿|⺻|6|yù|Duật|cây bút", "130|肉|月⺼|6|ròu|Nhục|thịt", "131|臣||6|chén|Thần|bề tôi", "132|自||6|zì|Tự|tự mình, mũi",
  "133|至||6|zhì|Chí|đến", "134|臼||6|jiù|Cữu|cái cối", "135|舌||6|shé|Thiệt|cái lưỡi", "136|舛||6|chuǎn|Suyễn|trái ngược", "137|舟||6|zhōu|Chu|con thuyền", "138|艮||6|gèn|Cấn|bền, dừng",
  "139|色||6|sè|Sắc|màu sắc", "140|艸|艹|6|cǎo|Thảo|cỏ", "141|虍||6|hū|Hô|vằn hổ", "142|虫||6|chóng|Trùng|côn trùng", "143|血||6|xuè|Huyết|máu", "144|行||6|xíng|Hành|đi, hàng lối",
  "145|衣|衤|6|yī|Y|cái áo", "146|襾|覀西|6|xī|Á|che đậy", "147|見|见|7|jiàn|Kiến|nhìn thấy", "148|角||7|jiǎo|Giác|cái sừng", "149|言|讠|7|yán|Ngôn|lời nói", "150|谷||7|gǔ|Cốc|thung lũng",
  "151|豆||7|dòu|Đậu|hạt đậu", "152|豕||7|shǐ|Thỉ|con lợn", "153|豸||7|zhì|Trãi|loài thú dữ", "154|貝|贝|7|bèi|Bối|vỏ sò, tiền của", "155|赤||7|chì|Xích|màu đỏ", "156|走||7|zǒu|Tẩu|chạy",
  "157|足|⻊|7|zú|Túc|bàn chân", "158|身||7|shēn|Thân|thân mình", "159|車|车|7|chē|Xa|cỗ xe", "160|辛||7|xīn|Tân|cay, vất vả", "161|辰||7|chén|Thần|giờ thìn, ngày giờ", "162|辵|辶|7|chuò|Sước|đi, chạy",
  "163|邑|阝|7|yì|Ấp|thành ấp", "164|酉||7|yǒu|Dậu|rượu, giờ dậu", "165|釆||7|biàn|Biện|phân biệt", "166|里||7|lǐ|Lý|làng, dặm", "167|金|钅釒|8|jīn|Kim|vàng, kim loại", "168|長|长|8|cháng|Trường|dài",
  "169|門|门|8|mén|Môn|cái cổng", "170|阜|阝|8|fù|Phụ|gò đất", "171|隶||8|dài|Đãi|bắt kịp", "172|隹||8|zhuī|Chuy|chim đuôi ngắn", "173|雨||8|yǔ|Vũ|mưa", "174|青||8|qīng|Thanh|màu xanh",
  "175|非||8|fēi|Phi|không phải", "176|面||9|miàn|Diện|mặt", "177|革||9|gé|Cách|da thuộc", "178|韋|韦|9|wéi|Vi|da mềm", "179|韭||9|jiǔ|Cửu|cây hẹ", "180|音||9|yīn|Âm|âm thanh",
  "181|頁|页|9|yè|Hiệt|cái đầu, trang giấy", "182|風|风|9|fēng|Phong|gió", "183|飛|飞|9|fēi|Phi|bay", "184|食|饣飠|9|shí|Thực|ăn, thức ăn", "185|首||9|shǒu|Thủ|cái đầu", "186|香||9|xiāng|Hương|thơm",
  "187|馬|马|10|mǎ|Mã|con ngựa", "188|骨||10|gǔ|Cốt|xương", "189|高||10|gāo|Cao|cao", "190|髟||10|biāo|Tiêu|tóc dài", "191|鬥||10|dòu|Đấu|đánh nhau", "192|鬯||10|chàng|Sưởng|rượu nếp thơm",
  "193|鬲||10|lì|Cách|cái đỉnh ba chân", "194|鬼||10|guǐ|Quỷ|ma quỷ", "195|魚|鱼|11|yú|Ngư|con cá", "196|鳥|鸟|11|niǎo|Điểu|con chim", "197|鹵|卤|11|lǔ|Lỗ|muối mỏ", "198|鹿||11|lù|Lộc|con hươu",
  "199|麥|麦|11|mài|Mạch|lúa mạch", "200|麻||11|má|Ma|cây gai", "201|黃|黄|12|huáng|Hoàng|màu vàng", "202|黍||12|shǔ|Thử|lúa nếp, kê", "203|黑||12|hēi|Hắc|màu đen", "204|黹||12|zhǐ|Chỉ|may thêu",
  "205|黽|黾|13|mǐn|Mãnh|con ếch", "206|鼎||13|dǐng|Đỉnh|cái vạc", "207|鼓||13|gǔ|Cổ|cái trống", "208|鼠||13|shǔ|Thử|con chuột", "209|鼻||14|bí|Tỵ|cái mũi", "210|齊|齐|14|qí|Tề|đều nhau",
  "211|齒|齿|15|chǐ|Xỉ|cái răng", "212|龍|龙|16|lóng|Long|con rồng", "213|龜|龟|16|guī|Quy|con rùa", "214|龠||17|yuè|Dược|cây sáo",
];

export interface Radical {
  num: number;
  char: string;
  /** Dạng biến thể và dạng giản thể thường gặp (rỗng nếu không có). */
  variants: string[];
  strokes: number;
  pinyin: string;
  /** Âm Hán Việt, ví dụ "Nhân" (gọi là "bộ Nhân"). */
  name: string;
  meaning: string;
}

export const RADICALS: Radical[] = LINES.map((l) => {
  const [num, char, variants, strokes, pinyin, name, meaning] = l.split("|");
  return { num: Number(num), char, variants: [...variants], strokes: Number(strokes), pinyin, name, meaning };
});

export const radicalByNum = (n: number): Radical | undefined => RADICALS[n - 1]?.num === n ? RADICALS[n - 1] : RADICALS.find((r) => r.num === n);
export const radicalByChar = (c: string): Radical | undefined => RADICALS.find((r) => r.char === c || r.variants.includes(c));
/** Tên gọi đầy đủ: "Bộ Nhân". */
export const radicalTitle = (r: Radical): string => `Bộ ${r.name}`;
