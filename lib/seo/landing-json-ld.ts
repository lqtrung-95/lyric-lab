import { SITE_URL } from "./site-url";

/** Dữ liệu có cấu trúc (schema.org) mô tả SongHanzi như một ứng dụng web giáo dục miễn phí. */
export function landingJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SongHanzi",
    url: SITE_URL,
    description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "vi",
    image: `${SITE_URL}/songhanzi-mark.png`,
    publisher: { "@type": "Organization", name: "SongHanzi", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/songhanzi-mark.png`, width: 512, height: 512 } },
    featureList: [
      "Chọn từ vựng và ngữ pháp đáng học từ lời bài hát, kèm pinyin và âm Hán Việt",
      "Nghe với lời chạy theo nhạc, tra nghĩa theo ngữ cảnh câu",
      "Học qua video tiếng Trung: phụ đề tương tác, chép chính tả, luyện nói",
      "AI nghe giọng và nhận xét thanh điệu (bản thử nghiệm)",
      "Hỏi AI về từng câu",
      "Lộ trình HSK 1–6 hơn 700 chặng: học từng thẻ, xem đoạn video thật, đọc to chấm điểm, bài kiểm tra cuối cấp và bài xếp lớp",
      "XP, cấp độ, huy hiệu, nhiệm vụ mỗi ngày và thi đấu 1v1",
      "Ôn tập flashcard FSRS và trò chơi luyện tập",
      "Chuỗi ngày học, mục tiêu hằng ngày và thi đấu 1v1",
      "Khám phá 66 cảnh đời sống bằng tiếng Trung, hành trình trong ngày và hộ chiếu",
      "Bạn nhỏ đồng hành (pet): phiêu lưu, nhà trang trí, mục tiêu tuần",
      "Truyện ngắn có cấp độ, hội thoại đóng vai, bấm từ để tra và lưu thẻ",
      "Viết chữ Hán theo thứ tự nét, ghép bộ thủ, luyện từ khó",
      "Công cụ miễn phí: tên tiếng Trung, pinyin, ngữ pháp AI, giấy tập viết",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
