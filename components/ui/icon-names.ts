// Danh sách icon Material Symbols đang dùng (theo thứ tự chữ cái). Google Fonts chỉ tải đúng các icon này (`icon_names`).
// Thêm icon mới: thêm tên vào đây, giữ thứ tự bảng chữ cái.
export const ICON_NAMES = [
  "add", "arrow_back", "arrow_forward", "auto_awesome", "auto_stories", "bookmark", "bookmark_add", "brush",
  "check_circle", "chevron_right", "close", "content_paste", "dark_mode", "dictionary", "expand_less", "expand_more",
  "format_quote", "graphic_eq", "headphones", "history_edu", "home", "hourglass_top", "laps", "library_music",
  "light_mode", "lightbulb", "link", "list_alt", "local_fire_department", "menu_book", "more_horiz", "music_note",
  "pause", "person", "play_arrow", "play_circle", "psychology", "quiz", "repeat_one", "schedule", "share",
  "skip_next", "smart_display", "star", "star_border", "style", "subtitles", "translate", "verified",
  "visibility_off", "volume_up", "warning",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
