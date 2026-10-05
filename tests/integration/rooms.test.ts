import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Vòng đời phòng thi đấu và RLS trên Supabase thật. Cần đã chạy migration practice_rooms và bật Anonymous sign-ins.
// Tự bỏ qua khi thiếu biến môi trường; xóa sạch phòng và tài khoản tạm sau khi chạy.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && anonKey && serviceKey);
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };

describe.skipIf(!enabled)("phòng thi đấu: vòng đời và RLS", () => {
  let service: SupabaseClient;
  const users: { id: string; client: SupabaseClient }[] = [];
  const codes: string[] = [];
  let videoId = "";
  let seq = 0;

  // Mã riêng cho mỗi phòng test, tránh đụng phòng thật đang chơi.
  const newCode = () => {
    const code = String(900000 + ((Date.now() + seq++) % 99999));
    codes.push(code);
    return code;
  };
  const rpc = async <T>(fn: string, args: Record<string, unknown>) => {
    const { data, error } = await service.rpc(fn, args);
    if (error) throw new Error(`${fn}: ${error.message}`);
    return data as T;
  };
  const createRoom = (host: number, code: string, video: string | null = null) =>
    rpc<string>("create_room", { p_host: users[host].id, p_code: code, p_video: video, p_name: `Host${host}` });
  const join = (user: number, code: string) => rpc<string>("join_room", { p_code: code, p_user: users[user].id, p_name: `Guest${user}` });
  const roomRow = async (id: string) => (await service.from("rooms").select("*").eq("id", id).single()).data!;

  // Mỗi test dùng người dùng riêng biệt bằng cách đăng nhập ẩn danh bằng client RIÊNG (supabase-js gắn phiên vào client gọi nó).
  async function signInAnon() {
    const signer = createClient(url!, serviceKey!, opts);
    const { data, error } = await signer.auth.signInAnonymously();
    if (error || !data.user || !data.session) throw new Error(`signInAnonymously: ${error?.message}`);
    const client = createClient(url!, anonKey!, opts);
    await client.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
    users.push({ id: data.user.id, client });
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, opts);
    for (let i = 0; i < 4; i++) await signInAnon();
    const { data: song } = await service.from("songs").select("video_id").limit(1).single();
    videoId = song!.video_id;
  });

  afterAll(async () => {
    if (!service) return;
    await service.from("rooms").delete().in("code", codes);
    for (const u of users) await service.auth.admin.deleteUser(u.id);
  });

  it("tạo phòng: chủ phòng vào luôn và sẵn sàng; mã trùng phòng còn hiệu lực bị từ chối", async () => {
    const code = newCode();
    const id = await createRoom(0, code);
    const room = await roomRow(id);
    expect(room).toMatchObject({ code, status: "waiting", host_id: users[0].id, video_id: null });
    const { data: players } = await service.from("room_players").select("user_id, ready, display_name").eq("room_id", id);
    expect(players).toEqual([{ user_id: users[0].id, ready: true, display_name: "Host0" }]);
    await expect(createRoom(1, code)).rejects.toThrow(/duplicate|unique|23505/i);
  });

  it("vào phòng: ok, vào lại là idempotent, người thứ ba bị từ chối, mã lạ không tìm thấy", async () => {
    const code = newCode();
    await createRoom(0, code);
    expect(await join(1, code)).toBe("ok");
    expect(await join(1, code)).toBe("ok");
    expect(await join(2, code)).toBe("full");
    expect(await join(2, "999999")).toBe("not_found");
  });

  it("mỗi người chỉ ở một phòng: vào phòng mới thì tự rời phòng cũ (phòng cũ hết người thì hết hạn)", async () => {
    const first = newCode();
    const second = newCode();
    const firstId = await createRoom(3, first);
    await createRoom(0, second);
    expect(await join(3, second)).toBe("ok");
    expect((await roomRow(firstId)).status).toBe("expired");
  });

  it("phòng quá hạn: vào bị từ chối và phòng được đánh dấu hết hạn", async () => {
    const code = newCode();
    const id = await createRoom(0, code);
    await service.from("rooms").update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq("id", id);
    expect(await join(1, code)).toBe("expired");
    expect((await roomRow(id)).status).toBe("expired");
  });

  it("bắt đầu: cần đủ hai người và cả hai sẵn sàng, chỉ chủ phòng bắt đầu được, bài được điền khi chưa có", async () => {
    const code = newCode();
    const id = await createRoom(0, code);
    const start = (user: number) => rpc<string>("start_room", { p_room: id, p_host: users[user].id, p_video: videoId });
    expect(await start(0)).toBe("need_two");
    await join(1, code);
    expect(await start(0)).toBe("not_ready");
    expect(await rpc<boolean>("set_room_ready", { p_room: id, p_user: users[1].id, p_ready: true })).toBe(true);
    expect(await start(1)).toBe("not_host");
    expect(await start(0)).toBe("ok");
    expect(await roomRow(id)).toMatchObject({ status: "playing", video_id: videoId });
    expect(await start(0)).toBe("not_waiting");
    // Đang chơi thì không đổi sẵn sàng được nữa.
    expect(await rpc<boolean>("set_room_ready", { p_room: id, p_user: users[1].id, p_ready: false })).toBe(false);
  });

  it("rời phòng chờ: chủ phòng rời thì chuyển chủ cho người còn lại; hết người thì phòng hết hạn", async () => {
    const code = newCode();
    const id = await createRoom(0, code);
    await join(1, code);
    await rpc("leave_room", { p_room: id, p_user: users[0].id });
    expect((await roomRow(id)).host_id).toBe(users[1].id);
    expect((await roomRow(id)).status).toBe("waiting");
    await rpc("leave_room", { p_room: id, p_user: users[1].id });
    expect((await roomRow(id)).status).toBe("expired");
  });

  it("RLS: thành viên đọc được phòng và người chơi của phòng mình, người ngoài không thấy gì, không ai ghi trực tiếp", async () => {
    const code = newCode();
    const id = await createRoom(0, code);
    await join(1, code);
    const [member, other] = [users[1].client, users[2].client];
    expect((await member.from("rooms").select("code").eq("id", id)).data).toEqual([{ code }]);
    expect((await member.from("room_players").select("display_name").eq("room_id", id)).data).toHaveLength(2);
    expect((await other.from("rooms").select("code").eq("id", id)).data).toEqual([]);
    expect((await other.from("room_players").select("display_name").eq("room_id", id)).data).toEqual([]);

    await member.from("rooms").update({ status: "finished" }).eq("id", id);
    await member.from("room_players").update({ score: 9999 }).eq("room_id", id);
    expect((await roomRow(id)).status).toBe("waiting");
    const { data: scores } = await service.from("room_players").select("score").eq("room_id", id);
    expect(scores).toEqual([{ score: 0 }, { score: 0 }]);
    expect((await other.from("rooms").insert({ code: newCode(), host_id: users[2].id })).error).not.toBeNull();
  });

  it("các hàm phòng không gọi được bằng khóa anon/người dùng (chỉ service role)", async () => {
    const { error } = await users[0].client.rpc("join_room", { p_code: "123456", p_user: users[0].id, p_name: "Hacker" });
    expect(error).not.toBeNull();
  });
});
