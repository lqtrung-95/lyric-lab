import { isValidVideoId } from "./parse-video-id";

/** URL ảnh bìa chuẩn của YouTube (đã validate videoId để không tạo URL tùy ý). */
export function videoThumbnailUrl(videoId: string, quality: "hqdefault" | "mqdefault" = "hqdefault"): string {
  if (!isValidVideoId(videoId)) throw new Error("videoId không hợp lệ");
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}
