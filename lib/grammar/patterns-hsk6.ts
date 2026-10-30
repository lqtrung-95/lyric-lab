import type { GrammarPattern } from "./grammar-types";

const L = 6 as const;
export const HSK6_PATTERNS: GrammarPattern[] = [
  {
    id: "fanshi", level: L, title: "凡是…都…", pattern: "凡是 A，都 B", key: ["凡是", "都"],
    explain: "Phàm là thuộc phạm vi A thì không có ngoại lệ, đều B. 凡是 mở vế đầu để chỉ cả một nhóm, 都 đứng trước động từ ở vế sau.",
    vsVi: "Giống “hễ là, phàm là… đều…”.",
    mistakes: [{ wrong: "凡是学生，也去了。", right: "凡是学生，都去了。", why: "凡是 đi với 都 để chỉ toàn bộ; 也 chỉ “cũng” nên sai nghĩa." }],
    examples: [{ zh: "凡是|来|过|的|人，|都|喜欢|这儿。", vi: "Phàm là người từng đến đều thích nơi này." }, { zh: "凡是|重要|的|事，|他|都|会|记下来。", vi: "Phàm là việc quan trọng anh ấy đều ghi lại." }, { zh: "凡是|学|过|的，|我|都|认识。", vi: "Những gì đã học tôi đều nhận ra." }],
    detect: "凡是",
  },
  {
    id: "yi-wei", level: L, title: "以…为…", pattern: "以 A 为 B", key: ["以", "为"],
    explain: "Lấy A làm B: coi A là B (mục tiêu, trung tâm, chuẩn mực). Mẫu cố định trang trọng, hay gặp trong văn viết và khẩu hiệu: 以人为本, 以…为主.",
    vsVi: "Giống “lấy… làm…”, “coi… là…”: lấy thầy làm gương.",
    mistakes: [{ wrong: "他把老师为榜样。", right: "他以老师为榜样。", why: "Mẫu cố định 以…为…, không thay 以 bằng 把." }],
    examples: [{ zh: "他|以|老师|为|榜样。", vi: "Anh ấy lấy thầy giáo làm tấm gương." }, { zh: "这|家|店|以|卖|茶|为|主。", vi: "Cửa hàng này lấy việc bán trà làm chính." }, { zh: "我们|以|诚信|为|本。", vi: "Chúng tôi lấy chữ tín làm gốc." }],
    detect: "(?<![可所])以(?![前后上下来外为])[^，。]{1,6}为[^，。]",
  },
  {
    id: "yuqishuo", level: L, title: "与其说…不如说…", pattern: "与其说 A，不如说 B", key: ["与其说", "不如说"],
    explain: "Dùng để điều chỉnh cách nhìn: thay vì nói A thì nói B mới đúng bản chất. Không so sánh hai lựa chọn như 与其…不如…, mà đính chính cách mô tả.",
    vsVi: "Giống “nói là A thì đúng hơn là B”, “thà nói là B còn hơn là A”.",
    mistakes: [{ wrong: "与其说他懒，不如他累。", right: "与其说他懒，不如说他累。", why: "不如说 phải đủ cả chữ 说 ở vế sau." }],
    examples: [{ zh: "这|与其说|是|工作，|不如说|是|兴趣。", vi: "Đây nói là công việc thì đúng hơn là sở thích." }, { zh: "他|与其说|聪明，|不如说|勤奋。", vi: "Nói anh ấy thông minh, chi bằng nói anh ấy chăm chỉ." }, { zh: "与其说|她|在|唱歌，|不如说|她|在|讲|故事。", vi: "Nói cô ấy hát thì đúng hơn là cô ấy đang kể chuyện." }],
    detect: "与其说",
  },
  {
    id: "hechang", level: L, title: "何尝: có phải đâu / chẳng phải", pattern: "A 何尝 (不) + động từ", key: ["何尝"],
    explain: "Câu hỏi tu từ nhấn mạnh nghĩa trái với bề ngoài: 何尝不想 = chẳng phải là muốn sao (thực ra rất muốn). 何尝 đã mang nghĩa hỏi nên không thêm 吗.",
    vsVi: "Giống “đâu phải là…”, “chẳng phải… sao”, “nào có…”.",
    mistakes: [{ wrong: "他何尝不努力吗？", right: "他何尝不努力？", why: "何尝 đã là câu hỏi tu từ, không thêm 吗." }],
    examples: [{ zh: "我|何尝|不|想|去，|只是|没|时间。", vi: "Tôi đâu phải không muốn đi, chỉ là không có thời gian." }, { zh: "我|何尝|不|知道|这|很|难？", vi: "Chẳng lẽ tôi không biết việc này khó sao?" }, { zh: "他|何尝|没|努力|过？", vi: "Anh ấy chẳng phải đã từng cố gắng sao?" }],
    detect: "何尝",
  },
  {
    id: "fei-buke", level: L, title: "非…不可", pattern: "非 A 不可", key: ["非", "不可"],
    explain: "Nhất định phải A, nếu không thì không được. Dạng nhấn mạnh sự cần thiết hoặc quyết tâm; 非…不行 và 非…不成 nghĩa tương tự trong khẩu ngữ.",
    vsVi: "Giống “nhất định phải… mới được”, “không… không xong”.",
    mistakes: [{ wrong: "这件事非你去。", right: "这件事非你去不可。", why: "非 luôn đi cặp với 不可; thiếu 不可 thì câu không hoàn chỉnh." }],
    examples: [{ zh: "这|件|事|非|你|去|不可。", vi: "Việc này nhất định phải bạn đi." }, { zh: "明天|的|会|非|参加|不可。", vi: "Cuộc họp ngày mai nhất định phải tham dự." }, { zh: "想|学|好|汉语，|非|多|练习|不可。", vi: "Muốn học giỏi tiếng Trung thì nhất định phải luyện nhiều." }],
    detect: "非(?![常洲])[^，。]{1,8}不[可行成]",
  },
  {
    id: "bujiande", level: L, title: "不见得: chưa chắc", pattern: "A 不见得 + động từ / tính từ", key: ["不见得"],
    explain: "不见得 diễn tả “chưa chắc, không hẳn”: phản bác nhẹ nhàng một nhận định, không phủ định hoàn toàn. Mềm hơn 不 và gần với 不一定.",
    vsVi: "Giống “chưa chắc, không hẳn, chưa hẳn là”.",
    mistakes: [{ wrong: "他不见得来了吗？", right: "他不见得会来。", why: "不见得 là một nhận định (chưa chắc), không dùng với 吗; nói về khả năng thì dùng 会." }],
    examples: [{ zh: "贵|的|不见得|就|好。", vi: "Đắt chưa chắc đã tốt." }, { zh: "有|钱|不见得|幸福。", vi: "Có tiền chưa chắc đã hạnh phúc." }, { zh: "他|不见得|会|来。", vi: "Anh ấy chưa chắc sẽ đến." }],
    detect: "不见得",
  },
];
