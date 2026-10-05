import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { roomAnswerPoints } from "@/lib/rooms/room-scoring";

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

  // Phòng đang chơi với hai người và bộ câu hỏi nhỏ: câu 0 đáp án đúng ở chỉ số 2, câu 1 đáp án đúng ở chỉ số 0.
  async function playingRoom() {
    const code = newCode();
    const id = await createRoom(0, code);
    await join(1, code);
    await rpc("set_room_ready", { p_room: id, p_user: users[1].id, p_ready: true });
    expect(await rpc<string>("start_room", { p_room: id, p_host: users[0].id, p_video: videoId })).toBe("ok");
    const payload = (n: number) => ({ videoId, lineIndex: n, before: "我", after: "你", choices: ["a", "b", "c", "d"].map((term) => ({ term, reading: null, sinoViet: null, meaning: "" })) });
    await service.from("room_questions").insert([{ room_id: id, idx: 0, payload: payload(0) }, { room_id: id, idx: 1, payload: payload(1) }]);
    await service.from("room_question_keys").insert([
      { room_id: id, idx: 0, correct_index: 2, correct_term: "c" },
      { room_id: id, idx: 1, correct_index: 0, correct_term: "a" },
    ]);
    return { code, id };
  }
  const openQuestion = (id: string, idx: number, opensInMs = -200, lastsMs = 15_000) =>
    service.from("room_questions").update({
      opens_at: new Date(Date.now() + opensInMs).toISOString(),
      deadline_at: new Date(Date.now() + opensInMs + lastsMs).toISOString(),
    }).eq("room_id", id).eq("idx", idx);
  const answer = (id: string, user: number, idx: number, choice: number) =>
    rpc<{ result: string; correct?: boolean; points?: number; elapsed_ms?: number; correct_index?: number }>("submit_room_answer", {
      p_room: id, p_user: users[user].id, p_idx: idx, p_choice: choice,
    });

  it("trả lời: chưa mở thì từ chối; đúng được 100–130 điểm và cộng vào người chơi; trả lời lần hai bị từ chối", async () => {
    const { id } = await playingRoom();
    expect((await answer(id, 1, 0, 2)).result).toBe("not_open"); // opens_at còn null
    await openQuestion(id, 0, -300);
    const ok = await answer(id, 1, 0, 2);
    expect(ok).toMatchObject({ result: "ok", correct: true, correct_index: 2 });
    expect(ok.points).toBeGreaterThanOrEqual(100);
    expect(ok.points).toBeLessThanOrEqual(130);
    expect(ok.elapsed_ms).toBeGreaterThanOrEqual(300);
    expect((await answer(id, 1, 0, 2)).result).toBe("already_answered");
    const { data: me } = await service.from("room_players").select("score, correct, total_ms").eq("room_id", id).eq("user_id", users[1].id).single();
    expect(me).toMatchObject({ score: ok.points, correct: 1 });
    expect(me!.total_ms).toBe(ok.elapsed_ms);
  });

  it("trả lời sai: 0 điểm nhưng vẫn ghi nhận và hiện đáp án đúng; người khác trả lời độc lập", async () => {
    const { id } = await playingRoom();
    await openQuestion(id, 0, -100);
    expect(await answer(id, 0, 0, 1)).toMatchObject({ result: "ok", correct: false, points: 0, correct_index: 2 });
    expect(await answer(id, 1, 0, 2)).toMatchObject({ result: "ok", correct: true });
    const { data: host } = await service.from("room_players").select("score, correct").eq("room_id", id).eq("user_id", users[0].id).single();
    expect(host).toEqual({ score: 0, correct: 0 });
  });

  it("trả lời: quá hạn quá 1 giây bị từ chối, trong 1 giây ân hạn thì được nhưng không có thưởng; người ngoài và câu không tồn tại bị từ chối", async () => {
    const { id } = await playingRoom();
    await openQuestion(id, 0, -20_000, 15_000); // hạn đã qua 5 giây
    expect((await answer(id, 1, 0, 2)).result).toBe("closed");
    await openQuestion(id, 1, -15_500, 15_000); // hạn qua 0,5 giây: còn trong thời gian ân hạn
    expect(await answer(id, 1, 1, 0)).toMatchObject({ result: "ok", correct: true, points: 100 });
    expect((await answer(id, 2, 1, 0)).result).toBe("not_in_room");
    expect((await answer(id, 1, 7, 0)).result).toBe("no_question");
  });

  it("trả lời: phòng chưa bắt đầu thì từ chối", async () => {
    const code = newCode();
    const id = await createRoom(0, code);
    expect((await answer(id, 0, 0, 0)).result).toBe("not_playing");
  });

  it("RLS: thành viên chỉ thấy câu hỏi đã lên lịch mở, không bao giờ đọc được đáp án đúng hay câu trả lời; người ngoài không thấy gì", async () => {
    const { id } = await playingRoom();
    const member = users[1].client;
    const other = users[2].client;
    expect((await member.from("room_questions").select("idx").eq("room_id", id)).data).toEqual([]); // chưa câu nào có lịch mở
    await openQuestion(id, 0, 2000); // lên lịch mở sau 2 giây
    expect((await member.from("room_questions").select("idx").eq("room_id", id)).data).toEqual([{ idx: 0 }]);
    expect((await other.from("room_questions").select("idx").eq("room_id", id)).data).toEqual([]);
    await openQuestion(id, 0, -100);
    await answer(id, 0, 0, 2);
    expect((await member.from("room_question_keys").select("correct_index").eq("room_id", id)).data).toEqual([]);
    expect((await users[0].client.from("room_question_keys").select("correct_index").eq("room_id", id)).data).toEqual([]);
    expect((await member.from("room_answers").select("choice").eq("room_id", id)).data).toEqual([]); // không thấy cả của người khác
    expect((await users[0].client.from("room_answers").select("choice").eq("room_id", id)).data).toEqual([]);
    expect((await member.rpc("submit_room_answer", { p_room: id, p_user: users[1].id, p_idx: 0, p_choice: 2 })).error).not.toBeNull();
  });

  it("công thức điểm ở SQL (room_answer_points) trùng bản TypeScript", async () => {
    for (const correct of [true, false]) {
      for (const elapsed of [-5, 0, 1, 250, 750, 1800, 7499, 7500, 7501, 14_750, 14_999, 15_000, 20_000]) {
        const sql = await rpc<number>("room_answer_points", { p_correct: correct, p_elapsed_ms: elapsed });
        expect(sql, `correct=${correct} elapsed=${elapsed}`).toBe(roomAnswerPoints(correct, elapsed));
      }
    }
  });

  it("các hàm phòng không gọi được bằng khóa anon/người dùng (chỉ service role)", async () => {
    const { error } = await users[0].client.rpc("join_room", { p_code: "123456", p_user: users[0].id, p_name: "Hacker" });
    expect(error).not.toBeNull();
  });
});
