export interface ReminderInput {
  /** Số thẻ ôn đã đến hạn. */
  dueCards: number;
  /** Chuỗi ngày học đang chạy (hôm nay chưa học vẫn giữ nếu hôm qua đã học). */
  currentStreak: number;
  studiedToday: boolean;
}

export interface ReminderMessage {
  title: string;
  body: string;
  /** Trang mở khi bấm vào thông báo. */
  url: string;
}

/**
 * Nội dung nhắc học trong ngày; null khi hôm nay đã học (không làm phiền). Ưu tiên thẻ đến hạn (việc cụ thể nhất), rồi giữ chuỗi
 * ngày, cuối cùng là lời mời chung.
 */
export function buildReminder({ dueCards, currentStreak, studiedToday }: ReminderInput): ReminderMessage | null {
  if (studiedToday) return null;
  if (dueCards > 0) return { title: `Có ${dueCards} thẻ cần ôn`, body: "Ôn vài phút để từ vựng không bị quên.", url: "/review" };
  if (currentStreak > 0) return { title: `Giữ chuỗi ${currentStreak} ngày nhé`, body: "Nghe một bài hoặc ôn vài thẻ là đủ.", url: "/app" };
  return { title: "Hôm nay nghe một bài nhé?", body: "Học tiếng Trung qua bài hát chỉ mất vài phút.", url: "/app" };
}
