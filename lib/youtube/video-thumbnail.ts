import { isValidVideoId } from "./parse-video-id";

/**
 * URL ảnh bìa chuẩn của YouTube (đã validate videoId để không tạo URL tùy ý). Nơi hiển thị bằng `next/image` phải đặt `unoptimized`:
 * ảnh đã là JPG nhỏ trên CDN của YouTube, còn qua trình tối ưu của Vercel thì mỗi bài mới tốn một "ảnh nguồn" của hạn mức hằng tháng
 * (gói Hobby); hết hạn mức là ảnh vỡ với lỗi 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED.
 */
export function videoThumbnailUrl(videoId: string, quality: "hqdefault" | "mqdefault" = "hqdefault"): string {
  if (!isValidVideoId(videoId)) throw new Error("videoId không hợp lệ");
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}
