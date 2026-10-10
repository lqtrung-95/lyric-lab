/** Ba cách học một video, là ba tab của màn học video: xem phụ đề, chép chính tả, luyện nói (shadowing). */
export type StudyTab = "subtitles" | "dictation" | "shadowing";

export const STUDY_TABS: { id: StudyTab; label: string }[] = [
  { id: "subtitles", label: "Phụ đề" },
  { id: "dictation", label: "Nghe – chép" },
  { id: "shadowing", label: "Luyện nói" },
];

/** Giá trị `?tab=` trên địa chỉ; sai hoặc thiếu thì về tab Phụ đề. */
export function parseStudyTab(value: string | null | undefined): StudyTab {
  return value === "dictation" || value === "shadowing" ? value : "subtitles";
}

/** Địa chỉ trang học video ở một tab (tab Phụ đề không cần tham số). */
export function studyTabHref(videoId: string, tab: StudyTab): string {
  return tab === "subtitles" ? `/video/${videoId}` : `/video/${videoId}?tab=${tab}`;
}
