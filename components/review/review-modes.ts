import type { IconName } from "@/components/ui/icon-names";

export interface ReviewMode { href: string; label: string; desc: string; icon: IconName }
export interface ReviewGroup { id: string; title: string; blurb: string; modes: ReviewMode[] }

/** Thẻ lớn "Ôn thẻ" (theo lịch FSRS) ở đầu trang Ôn & Nói; hiện số thẻ đến hạn. */
export const CARDS_MODE: ReviewMode = { href: "/review/cards", label: "Ôn thẻ", desc: "Ôn từ vựng đã lưu theo lịch nhắc nhớ thông minh", icon: "style" };

/** Các chế độ luyện, gom theo mục đích: nhớ từ, nghe và đọc, nói, thi đấu. Nguồn duy nhất cho trang chủ Ôn & Nói và thanh quay lại trong từng chế độ. */
export const REVIEW_GROUPS: ReviewGroup[] = [
  {
    id: "remember", title: "Nhớ từ vựng", blurb: "Củng cố từ đã lưu bằng game ngắn",
    modes: [
      { href: "/review/match", label: "Ghép cặp", desc: "Nối chữ Hán với nghĩa càng nhanh càng tốt", icon: "shuffle" },
      { href: "/review/pinyin", label: "Gõ pinyin", desc: "Nhìn chữ Hán, gõ pinyin có dấu thanh", icon: "keyboard" },
    ],
  },
  {
    id: "read-listen", title: "Nghe và đọc hiểu", blurb: "Nhận ra từ và câu khi nghe, khi đọc",
    modes: [
      { href: "/review/listen", label: "Nghe và chọn", desc: "Nghe một đoạn rồi chọn từ đúng", icon: "headphones" },
      { href: "/review/cloze", label: "Điền lời", desc: "Điền từ còn thiếu trong lời bài hát", icon: "edit" },
      { href: "/review/truth-or-lie", label: "Hai thật một giả", desc: "Ba câu, hai đúng một sai: tìm câu sai", icon: "quiz" },
      { href: "/review/word-order", label: "Xếp câu", desc: "Xếp thẻ từ thành câu đúng trật tự", icon: "list_alt" },
    ],
  },
  {
    id: "speak", title: "Nói và phản xạ", blurb: "Mở miệng nhiều hơn: nói nhanh, nói tự nhiên, nói đúng",
    modes: [
      { href: "/review/speak-reflex", label: "Hỏi nhanh – Đáp nhanh", desc: "Nghe câu hỏi, nói đáp ngay trong 8 giây", icon: "mic" },
      { href: "/review/speak-five-words", label: "Dùng 5 từ", desc: "Nói câu dùng đủ 5 từ đã lưu trong 30 giây", icon: "auto_awesome" },
      { href: "/review/speak-roleplay", label: "Trò chuyện tự do", desc: "Nói chuyện với AI đóng vai, không kịch bản", icon: "forum" },
      { href: "/review/read-aloud", label: "Đọc to", desc: "Đọc từ đã lưu và được chấm phát âm", icon: "volume_up" },
      { href: "/review/karaoke", label: "Karaoke", desc: "Hát theo lời, nhớ từ qua giai điệu", icon: "music_note" },
      { href: "/phat-am", label: "Luyện phát âm", desc: "Thanh điệu, bảng pinyin, lộ trình phát âm", icon: "graphic_eq" },
    ],
  },
  {
    id: "arcade", title: "Game vui", blurb: "Chơi cho vui mà vẫn nhớ từ: bắn chữ, nhạc rơi, đấu với bạn",
    modes: [
      { href: "/review/blaster", label: "Bắn chữ", desc: "Từ Hán rơi xuống, gõ pinyin để bắn nổ", icon: "local_fire_department" },
      { href: "/review/rain", label: "Nhạc rơi", desc: "Đọc pinyin, chạm đúng chữ như Piano Tiles", icon: "library_music" },
      { href: "/review/whack", label: "Đập chữ", desc: "30 giây đập đúng chữ trong chín hố", icon: "timer" },
      { href: "/review/daily", label: "Hán tự mỗi ngày", desc: "Mỗi ngày một từ, đoán bằng pinyin kiểu Wordle", icon: "calendar_month" },
      { href: "/review/duel", label: "Đấu 1–1", desc: "Thách bạn gõ pinyin, ai nhanh hơn thắng", icon: "group" },
    ],
  },
  {
    id: "compete", title: "Thi đấu", blurb: "So điểm với người học khác",
    modes: [{ href: "/review/leaderboard", label: "Xếp hạng", desc: "Bảng điểm luyện tập", icon: "leaderboard" }],
  },
];

/** Tên chế độ theo đường dẫn, để thanh quay lại hiện đúng tên bài đang làm. */
export const MODE_LABELS: Record<string, string> = Object.fromEntries([CARDS_MODE, ...REVIEW_GROUPS.flatMap((g) => g.modes)].map((m) => [m.href, m.label]));
