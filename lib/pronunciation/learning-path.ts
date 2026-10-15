// Lộ trình học phát âm: các bước theo thứ tự nên làm. Mỗi bước trỏ tới một công cụ có sẵn.
export interface PathLesson { id: string; title: string; goal: string; href: string }

export const LEARNING_PATH: PathLesson[] = [
  { id: "initials", title: "Phụ âm đầu", goal: "Nghe và đọc các phụ âm đầu; chú ý cặp bật hơi b–p, d–t, g–k.", href: "/phat-am/bang-pinyin" },
  { id: "finals", title: "Vần", goal: "Làm quen các vần đơn, vần kép và vần mũi (n, ng).", href: "/phat-am/bang-pinyin" },
  { id: "tones-listen", title: "Nghe phân biệt 4 thanh", goal: "Đạt ít nhất 6/8 ở trò nghe đoán thanh.", href: "/phat-am/nghe-doan-thanh" },
  { id: "tones-speak", title: "Đọc đúng 4 thanh", goal: "Ghi âm và khớp đường cao độ của từng thanh.", href: "/phat-am/luyen-thanh-dieu" },
  { id: "sentences", title: "Đọc cả câu", goal: "Đọc một câu hoàn chỉnh và đạt điểm từng chữ từ 80 trở lên.", href: "/phat-am/doc-to-cham-diem" },
  { id: "twisters", title: "Thử thách 绕口令", goal: "Đọc trơn một câu thách và chia sẻ điểm của bạn.", href: "/phat-am/rao-khau-lenh" },
];
