import OpenGraphImage from "./opengraph-image";
import { MARKETING_OG_ALT, MARKETING_OG_SIZE } from "@/lib/seo/marketing-og-image";

// Cùng ảnh với og:image (X/Twitter đọc twitter:image). Khai báo lại các hằng vì Next đọc cấu hình trực tiếp từ từng file ảnh.
export const runtime = "nodejs";
export const alt = MARKETING_OG_ALT;
export const size = MARKETING_OG_SIZE;
export const contentType = "image/png";

export default OpenGraphImage;
