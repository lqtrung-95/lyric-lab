import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { parsePet, type Pet } from "./pet-logic";

export const PET_STORAGE_KEY = "lyric-lab-pet";
export const PET_EVENT = "lyric-lab-pet";

/** Bản làm việc trong trình duyệt: vẽ ngay không chờ mạng, và là nơi lưu duy nhất khi chưa đăng nhập. */
export function readLocalPet(): Pet | null {
  try {
    const raw = localStorage.getItem(PET_STORAGE_KEY);
    return raw ? parsePet(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeLocalPet(pet: Pet): void {
  try {
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pet));
  } catch {
    // localStorage bị chặn: pet chỉ tồn tại tới khi tải lại trang.
  }
  window.dispatchEvent(new Event(PET_EVENT));
}

async function currentUserId(): Promise<{ sb: ReturnType<typeof createSupabaseBrowserClient>; userId: string }> {
  const sb = createSupabaseBrowserClient();
  const userId = (await sb.auth.getSession()).data.session?.user.id;
  if (!userId) throw new Error("no_session");
  return { sb, userId };
}

/** Đọc pet của người dùng hiện tại. `null` = chưa nhận nuôi; ném lỗi nếu chưa đăng nhập hoặc bảng chưa tạo (caller coi là "không đồng bộ"). */
export async function loadRemotePet(): Promise<Pet | null> {
  const { sb, userId } = await currentUserId();
  const { data, error } = await sb.from("user_pet").select("species,name,adopted_at,base_xp").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as { species: string; name: string; adopted_at: string; base_xp: number | null } | null;
  return row ? parsePet({ species: row.species, name: row.name, adoptedAt: row.adopted_at, baseXp: row.base_xp ?? 0 }) : null;
}

export async function saveRemotePet(pet: Pet): Promise<void> {
  const { sb, userId } = await currentUserId();
  const { error } = await sb.from("user_pet").upsert({ user_id: userId, species: pet.species, name: pet.name, adopted_at: pet.adoptedAt, base_xp: pet.baseXp, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
