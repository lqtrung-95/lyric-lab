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
    featureList: [
      "Chọn từ vựng và ngữ pháp đáng học từ lời bài hát, kèm pinyin và âm Hán Việt",
      "Nghe với lời chạy theo nhạc, tra nghĩa theo ngữ cảnh câu",
      "Học qua video tiếng Trung: phụ đề tương tác, chép chính tả, luyện nói",
      "AI nghe giọng và nhận xét thanh điệu (bản thử nghiệm)",
      "Hỏi AI về từng câu",
      "Ôn tập flashcard FSRS và trò chơi luyện tập",
      "Chuỗi ngày học, mục tiêu hằng ngày và thi đấu 1v1",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
