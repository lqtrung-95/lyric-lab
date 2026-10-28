// Danh sách icon Material Symbols đang dùng (theo thứ tự chữ cái). Google Fonts chỉ tải đúng các icon này (`icon_names`).
// Thêm icon mới: thêm tên vào đây, giữ thứ tự bảng chữ cái.
export const ICON_NAMES = [
  "add", "add_box", "arrow_back", "arrow_forward", "auto_awesome", "auto_stories", "block", "bookmark", "bookmark_add", "brush", "build", "calendar_month", "campaign",
  "check", "check_circle", "chevron_left", "chevron_right", "close", "content_copy", "content_paste", "dark_mode", "delete", "dictionary", "download", "edit",
  "emoji_events", "event", "expand_less", "expand_more", "favorite", "favorite_border", "feedback", "flag", "format_quote", "forum", "forward_5", "graphic_eq",
  "group", "headphones", "history", "history_edu", "home", "hourglass_top", "install_mobile", "ios_share", "keyboard", "laps", "leaderboard",
  "library_music", "light_mode", "lightbulb", "link", "list_alt", "local_fire_department", "logout", "menu_book", "mic", "more_horiz", "more_vert",
  "music_note", "open_in_full", "pause", "person", "person_add", "photo_camera", "play_arrow", "play_circle", "psychology", "push_pin", "quiz",
  "repeat_one", "replay", "replay_5", "schedule", "school", "search", "send", "sentiment_dissatisfied", "share", "shuffle", "skip_next", "smart_display", "star", "star_border", "stop",
  "style", "subtitles", "sync", "timer", "translate", "tune", "undo", "verified", "visibility", "visibility_off", "volume_up", "warning",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
