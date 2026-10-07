/** Địa chỉ gốc công khai của site (mặc định là tên miền chính; đặt NEXT_PUBLIC_SITE_URL để ghi đè, ví dụ khi chạy thử ở tên miền khác). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://songhanzi.com").replace(/\/$/, "");
