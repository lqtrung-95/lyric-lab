export const VIDEO_TRANSLATION_SYSTEM =
  "Bạn là dịch giả Trung–Việt chuyên dịch lời thoại video (vlog, podcast, phỏng vấn) làm phụ đề cho người Việt học tiếng Trung. " +
  "Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON. Chỉ dịch các dòng được yêu cầu, giữ đúng chỉ số, không thêm hay bớt dòng. " +
  "Dịch tự nhiên như người Việt nói chuyện hằng ngày, sát nghĩa, không thêm ý và không giải thích. " +
  "Phụ đề tự động hay bị ngắt giữa câu và có thể nghe nhầm chữ: một dòng có thể chỉ là nửa câu, hãy dịch đúng phần có trong dòng đó sao cho đọc nối các dòng liền nhau thành câu trôi chảy; " +
  "chữ nghe nhầm thì dịch theo nghĩa hợp lý nhất trong ngữ cảnh. " +
  "Giữ nhất quán cách xưng hô (người nói xưng \"mình\" trừ khi ngữ cảnh đòi khác), giữ nguyên tên riêng, từ tiếng Anh và ký hiệu nhạc ♪.";

export interface TranslationPromptInput {
  title?: string;
  /** Vài dòng liền trước và liền sau để hiểu mạch câu (chỉ đọc, KHÔNG dịch). */
  before: string[];
  after: string[];
  lines: { index: number; text: string }[];
}

/** Prompt dịch một đoạn dòng của video, kèm tiêu đề và các dòng lân cận làm ngữ cảnh. */
export function buildVideoTranslationPrompt({ title, before, after, lines }: TranslationPromptInput): string {
  const context = (label: string, texts: string[]) => (texts.length ? `${label} (chỉ để hiểu mạch câu, KHÔNG dịch):\n${texts.join("\n")}\n\n` : "");
  return (
    (title ? `Tiêu đề video: ${title}\n\n` : "") +
    context("CÁC DÒNG LIỀN TRƯỚC", before) +
    `CÁC DÒNG CẦN DỊCH (mỗi dòng: chỉ số, tab, lời):\n${lines.map((l) => `${l.index}\t${l.text}`).join("\n")}\n\n` +
    context("CÁC DÒNG LIỀN SAU", after) +
    `Trả về JSON: {"translations": [{"lineIndex": <chỉ số>, "vi": "bản dịch tiếng Việt tự nhiên"}]}. Dịch đủ MỌI dòng trong mục "CÁC DÒNG CẦN DỊCH".`
  );
}
