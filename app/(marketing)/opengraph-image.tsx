import { MARKETING_OG_ALT, MARKETING_OG_SIZE, renderMarketingOgImage } from "@/lib/seo/marketing-og-image";

export const runtime = "nodejs";
export const alt = MARKETING_OG_ALT;
export const size = MARKETING_OG_SIZE;
export const contentType = "image/png";

export default renderMarketingOgImage;
