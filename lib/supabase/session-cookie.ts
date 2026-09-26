/** Có cookie phiên Supabase (`sb-<project>-auth-token`, có thể chia mảnh `.0`, `.1`) không: dấu hiệu người dùng đã từng dùng app. */
export function hasSupabaseSessionCookie(cookies: { name: string }[]): boolean {
  return cookies.some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name));
}
