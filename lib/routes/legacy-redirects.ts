// Đường dẫn cũ (tiếng Việt) chuyển vĩnh viễn (308) sang đường dẫn tiếng Anh mới, để link đã chia sẻ, dấu trang và thông báo cũ vẫn dùng được.
// Thứ tự quan trọng: quy tắc cụ thể đứng trước quy tắc `:path*`.

/** id cảnh Khám phá cũ → mới (id cũ còn nằm trong dữ liệu tiến độ đã lưu, xem `LEGACY_SCENE_IDS` ở explore-progress). */
export const LEGACY_SCENE_IDS: Record<string, string> = {
  phong: "room", "quan-an": "restaurant", cho: "market", "nha-ga": "station", "benh-vien": "hospital", "cong-vien": "park",
  "truong-hoc": "school", "cua-hang": "clothing-store", "khach-san": "hotel", "san-bay": "airport",
};

interface Redirect { source: string; destination: string; permanent: true; has?: { type: "query"; key: string; value: string }[] }
const to = (source: string, destination: string): Redirect => ({ source, destination, permanent: true });

export function legacyRedirects(): Redirect[] {
  const scenes = Object.entries(LEGACY_SCENE_IDS);
  return [
    to("/kham-pha", "/explore"),
    to("/kham-pha/vu-an/hop-go", "/explore/cases/wooden-box"),
    ...scenes.flatMap(([old, now]) => [to(`/kham-pha/vu-an/hop-go/${old}`, `/explore/cases/wooden-box/${now}`), to(`/kham-pha/${old}`, `/explore/${now}`)]),
    to("/kham-pha/:path*", "/explore/:path*"),
    // Vụ danh sách mua sắm từng có đường dẫn cảnh sai (`shop`), id đúng của cảnh cửa hàng là `clothing-store`.
    to("/explore/cases/shopping-list/shop", "/explore/cases/shopping-list/clothing-store"),
    to("/cai-app", "/install"),
    { source: "/hoc", has: [{ type: "query", key: "khoa", value: "(?<course>.+)" }], destination: "/courses?course=:course", permanent: true },
    to("/hoc/xep-lop", "/courses/placement"),
    to("/hoc", "/courses"),
    to("/hoc/:path*", "/courses/:path*"),
    to("/video/kenh/:channel", "/video/channel/:channel"),
    to("/review/doc-to", "/review/read-aloud"),
    to("/tra-tu", "/dictionary"),
    to("/tra-tu/:path*", "/dictionary/:path*"),
  ];
}
