/** Địa chỉ gốc công khai của site (đặt NEXT_PUBLIC_SITE_URL khi có tên miền riêng). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://lyric-lab-indol.vercel.app").replace(/\/$/, "");
