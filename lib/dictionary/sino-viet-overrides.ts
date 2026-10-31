/**
 * Âm Hán Việt chuẩn của các chữ thông dụng, ĐÈ LÊN dữ liệu nạp từ Wiktionary/Unihan. Lý do: nguồn lẫn âm Nôm hoặc âm hiếm và liệt kê chúng trước
 * (柜 → "cũi" thay vì "quỹ", 子 → "tý" thay vì "tử", 饭 → "phằn" thay vì "phạn", 羽 → "võ" thay vì "vũ"). Ghi theo cú pháp `chữ(giản + phồn):âm`, các cặp cách nhau bằng khoảng trắng.
 * Chữ nhiều âm đều chính đáng (行 hành/hạnh, 长 trường/trưởng) lấy âm thông dụng nhất trong từ ghép hiện đại. Chữ còn tranh cãi giữa các âm thì KHÔNG đưa vào đây để khỏi đoán.
 * Thêm một chữ: kiểm tra bằng từ điển Hán Việt, ghi đúng âm đầu thông dụng, thêm test nếu là ca bị báo lỗi.
 */
const TABLE = `
一:nhất 二:nhị 三:tam 四:tứ 五:ngũ 六:lục 七:thất 八:bát 九:cửu 十:thập 百:bách 千:thiên 万萬:vạn 零:linh 两兩:lưỡng 半:bán 第:đệ
人:nhân 大:đại 小:tiểu 上:thượng 下:hạ 中:trung 左:tả 右:hữu 前:tiền 后後:hậu 里裏:lý 外:ngoại 内:nội 东東:đông 西:tây 南:nam 北:bắc
天:thiên 地:địa 日:nhật 月:nguyệt 水:thủy 火:hỏa 木:mộc 金:kim 土:thổ 山:sơn 石:thạch 河:hà 海:hải 湖:hồ 江:giang 风風:phong 雨:vũ 雪:tuyết 云雲:vân 电電:điện 光:quang 星:tinh 花:hoa 草:thảo 树樹:thụ 林:lâm
子:tử 女:nữ 男:nam 儿兒:nhi 父:phụ 母:mẫu 弟:đệ 妹:muội 兄:huynh 朋:bằng 友:hữu 老:lão 师師:sư 生:sinh 学學:học 校:hiệu 教:giáo 书書:thư 字:tự 文:văn 语語:ngữ 话話:thoại 说說:thuyết 读讀:độc 写寫:tả 看:khán 听聽:thính 见見:kiến
手:thủ 口:khẩu 目:mục 耳:nhĩ 心:tâm 头頭:đầu 面:diện 身:thân 足:túc 脚腳:cước 羽:vũ
饭飯:phạn 米:mễ 茶:trà 酒:tửu 肉:nhục 鱼魚:ngư 鸡雞:kê 羊:dương 牛:ngưu 马馬:mã 狗:cẩu 猫貓:miêu 鸟鳥:điểu 虫蟲:trùng
家:gia 门門:môn 窗:song 桌:trác 椅:ỷ 柜櫃:quỹ 床:sàng 房:phòng 屋:ốc 店:điếm 楼樓:lâu 院:viện 室:thất 厅廳:sảnh
车車:xa 路:lộ 站:trạm 飞飛:phi 机機:cơ 船:thuyền 钱錢:tiền 买買:mãi 卖賣:mại 贵貴:quý 便:tiện
高:cao 低:đê 长長:trường 短:đoản 快:khoái 慢:mạn 新:tân 旧舊:cựu 好:hảo 坏壞:hoại 多:đa 少:thiểu
红紅:hồng 白:bạch 黑:hắc 黄黃:hoàng 绿綠:lục 蓝藍:lam
爱愛:ái 欢歡:hoan 怕:phạ 忙:mang 工:công 作:tác 事:sự 国國:quốc 美:mỹ 英:anh 法:pháp 德:đức
时時:thời 间間:gian 年:niên 今:kim 明:minh 早:tảo 晚:vãn 昨:tạc 春:xuân 夏:hạ 秋:thu 冬:đông 夜:dạ 朝:triều
我:ngã 他:tha 们們:môn 的:đích 了:liễu 在:tại 有:hữu 不:bất 是:thị 也:dã 就:tựu 都:đô 和:hòa 与與:dữ
对對:đối 没沒:một 很:ngận 还還:hoàn 会會:hội 能:năng 可:khả 以:dĩ 为為:vi 要:yếu 想:tưởng 去:khứ 来來:lai 做:tố 吃:cật 喝:hát 给給:cấp 请請:thỉnh 问問:vấn 叫:khiếu 让讓:nhượng 用:dụng
得:đắc 觉覺:giác 参參:tham 发發:phát 假:giả 量:lượng 数數:số 难難:nan 切:thiết 省:tỉnh 宿:túc 台臺:đài 调調:điều 盛:thịnh 传傳:truyền 种種:chủng 将將:tương 角:giác 度:độ 曲:khúc 降:giáng 磨:ma 模:mô 恶惡:ác 薄:bạc 倒:đảo 分:phân 号號:hiệu 划劃:hoạch 禁:cấm 系係:hệ 相:tương 应應:ứng 载載:tái 转轉:chuyển
习習:tập 经經:kinh 济濟:tế 现現:hiện 实實:thực 开開:khai 关關:quan 动動:động 业業:nghiệp 体體:thể 点點:điểm 钟鐘:chung 气氣:khí 张張:trương 总總:tổng 种:chủng 过過:quá 进進:tiến 远遠:viễn 近:cận 送:tống 选選:tuyển 通:thông 道:đạo 街:nhai 城:thành 市:thị 乡鄉:hương 村:thôn 区區:khu 图圖:đồ 园園:viên
钱:tiền 银銀:ngân 铁鐵:thiết 铜銅:đồng 药藥:dược 病:bệnh 医醫:y 痛:thống 脸臉:kiểm 眼:nhãn 鼻:tị 牙:nha 腿:thoái 脑腦:não 血:huyết 骨:cốt
`;

/** Các cặp `[các chữ, âm]` đã tách (xuất ra để test kiểm tra trùng và định dạng). */
export const OVERRIDE_PAIRS: [string, string][] = TABLE.split(/\s+/).filter(Boolean).map((p) => p.split(":") as [string, string]);

const parse = (): Map<string, string> => {
  const m = new Map<string, string>();
  for (const [chars, reading] of OVERRIDE_PAIRS) for (const c of chars) m.set(c, reading);
  return m;
};

export const SINO_VIET_OVERRIDES: ReadonlyMap<string, string> = parse();

/** Âm Hán Việt chuẩn của một chữ nếu đã có trong bảng đè. */
export const overrideSinoViet = (char: string): string | undefined => SINO_VIET_OVERRIDES.get(char);

/** Đưa âm chuẩn (nếu có) lên đầu danh sách âm của một chữ, giữ các âm còn lại theo thứ tự cũ và bỏ trùng. */
export function orderSinoViet(char: string, readings: readonly string[]): string[] {
  const o = SINO_VIET_OVERRIDES.get(char);
  return o ? [o, ...readings.filter((r) => r !== o)] : [...readings];
}
