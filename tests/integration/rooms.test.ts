import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { roomAnswerPoints } from "@/lib/rooms/room-scoring";

// Vòng đời phòng thi đấu và RLS trên Supabase thật. Cần đã chạy migration practice_rooms và bật Anonymous sign-ins.
// Tự bỏ qua khi thiếu biến môi trường; xóa sạch phòng và tài khoản tạm sau khi chạy.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && anonKey && serviceKey);
const opts = { auth: { persistSession: false }, realtime: { transport: ws as never } };

describe.skipIf(!enabled)("phòng thi đấu: vòng đời và RLS", () => {
  let service: SupabaseClient;
  const users: { id: string; client: SupabaseClient; token: string }[] = [];
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
    users.push({ id: data.user.id, client, token: data.session.access_token });
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

  // Bộ câu hỏi nhỏ cho test: câu i có đáp án đúng ở chỉ số (2 nếu i chẵn, ngược lại 0), 4 lựa chọn a–d.
  async function addQuestions(roomId: string, count = 2) {
    const payload = (n: number) => ({ videoId, lineIndex: n, before: "我", after: "你", choices: ["a", "b", "c", "d"].map((term) => ({ term, reading: null, sinoViet: null, meaning: "" })) });
    const rows = Array.from({ length: count }, (_, i) => ({ room_id: roomId, idx: i, payload: payload(i) }));
    await service.from("room_questions").insert(rows);
    await service.from("room_question_keys").insert(rows.map((r) => ({ room_id: roomId, idx: r.idx, correct_index: r.idx % 2 === 0 ? 2 : 0, correct_term: r.idx % 2 === 0 ? "c" : "a" })));
  }

  it("bắt đầu: cần đủ hai người, cả hai sẵn sàng và đã có bộ câu hỏi; chỉ chủ phòng bắt đầu; lên lịch mở câu đầu sau 3 giây", async () => {
    const code = newCode();
    const id = await createRoom(0, code);
    const start = (user: number) => rpc<string>("start_room", { p_room: id, p_host: users[user].id, p_video: videoId });
    expect(await start(0)).toBe("need_two");
    await join(1, code);
    expect(await start(0)).toBe("not_ready");
    expect(await rpc<boolean>("set_room_ready", { p_room: id, p_user: users[1].id, p_ready: true })).toBe(true);
    expect(await start(1)).toBe("not_host");
    expect(await start(0)).toBe("no_questions");
    await addQuestions(id);
    expect(await start(0)).toBe("ok");
    expect(await roomRow(id)).toMatchObject({ status: "playing", video_id: videoId, current_question: 0 });
    const { data: q0 } = await service.from("room_questions").select("opens_at, deadline_at").eq("room_id", id).eq("idx", 0).single();
    expect(Date.parse(q0!.opens_at) - Date.now()).toBeGreaterThan(1000); // mở sau ~3 giây
    expect(Date.parse(q0!.deadline_at) - Date.parse(q0!.opens_at)).toBe(15_000);
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

  // Phòng đang chơi với hai người (host = users[0], khách = users[1]) và bộ câu hỏi nhỏ.
  async function playingRoom(questionCount = 2) {
    const code = newCode();
    const id = await createRoom(0, code);
    await join(1, code);
    await rpc("set_room_ready", { p_room: id, p_user: users[1].id, p_ready: true });
    await addQuestions(id, questionCount);
    expect(await rpc<string>("start_room", { p_room: id, p_host: users[0].id, p_video: videoId })).toBe("ok");
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
    expect((await answer(id, 1, 0, 2)).result).toBe("not_open"); // câu 0 mở sau 3 giây kể từ lúc bắt đầu
    await openQuestion(id, 0, -300);
    const ok = await answer(id, 1, 0, 2);
    expect(ok).toMatchObject({ result: "ok", correct: true, correct_index: 2 });
    expect(ok.points).toBeGreaterThanOrEqual(100);
    expect(ok.points).toBeLessThanOrEqual(130);
    expect(ok.elapsed_ms).toBeGreaterThanOrEqual(300);
    expect((await answer(id, 1, 0, 2)).result).toBe("already_answered");
    const me = () => service.from("room_players").select("score, correct, total_ms, answered_idx, last_answer_ms").eq("room_id", id).eq("user_id", users[1].id).single();
    // Điểm hiển thị CHƯA đổi lúc trả lời (nếu đổi thì Realtime báo cho đối thủ biết người này vừa đúng); chỉ đánh dấu đã trả lời.
    expect((await me()).data).toEqual({ score: 0, correct: 0, total_ms: 0, answered_idx: 0, last_answer_ms: ok.elapsed_ms });
    await service.from("room_questions").update({ deadline_at: new Date(Date.now() - 5000).toISOString() }).eq("room_id", id).eq("idx", 0); // hết hạn
    expect(await rpc<{ result: string }>("advance_room", { p_room: id })).toMatchObject({ result: "advanced" });
    expect((await me()).data).toMatchObject({ score: ok.points, correct: 1, total_ms: ok.elapsed_ms }); // câu đóng thì điểm mới được công bố
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
    // Chỉ câu đã được lên lịch mở (câu 0, lúc bắt đầu) đọc được; câu 1 chưa có lịch nên không lộ trước.
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

  const advance = (id: string) => rpc<{ result: string; current_question?: number }>("advance_room", { p_room: id });
  const closeByDeadline = (id: string, idx: number) =>
    service.from("room_questions").update({ deadline_at: new Date(Date.now() - 5000).toISOString() }).eq("room_id", id).eq("idx", idx);

  it("tiến câu: chưa mở/chưa trả lời hết thì not_ready, đủ người trả lời thì sang câu kế (mở sau 3 giây), gọi thừa vô hại", async () => {
    const { id } = await playingRoom(2);
    expect((await advance(id)).result).toBe("not_ready"); // câu 0 chưa mở
    await openQuestion(id, 0, -300);
    expect((await advance(id)).result).toBe("not_ready"); // đã mở, chưa ai trả lời
    await answer(id, 0, 0, 2);
    expect((await advance(id)).result).toBe("not_ready"); // mới một người trả lời
    await answer(id, 1, 0, 1);
    expect(await advance(id)).toMatchObject({ result: "advanced", current_question: 1 });
    expect((await roomRow(id)).current_question).toBe(1);
    const { data: q1 } = await service.from("room_questions").select("opens_at, deadline_at").eq("room_id", id).eq("idx", 1).single();
    expect(Date.parse(q1!.opens_at)).toBeGreaterThan(Date.now()); // câu kế mở sau 3 giây để người chơi kịp xem kết quả câu vừa rồi
    expect((await advance(id)).result).toBe("not_ready"); // gọi lại không nhảy thêm câu
    expect((await roomRow(id)).current_question).toBe(1);
    const { data: players } = await service.from("room_players").select("user_id, score, correct").eq("room_id", id);
    expect(players!.find((p) => p.user_id === users[0].id)).toMatchObject({ correct: 1 });
    expect(players!.find((p) => p.user_id === users[1].id)).toMatchObject({ score: 0, correct: 0 });
  });

  it("quá hạn mà người kia chưa trả lời vẫn tiến được (người chưa trả lời bị tính sai)", async () => {
    const { id } = await playingRoom(2);
    await openQuestion(id, 0, -300);
    await answer(id, 0, 0, 2);
    await closeByDeadline(id, 0);
    expect(await advance(id)).toMatchObject({ result: "advanced", current_question: 1 });
  });

  it("hết câu: ván kết thúc, người nhiều điểm hơn thắng; sau đó không tiến được nữa", async () => {
    const { id } = await playingRoom(2);
    for (const idx of [0, 1]) {
      await openQuestion(id, idx, -300);
      await answer(id, 0, idx, idx % 2 === 0 ? 2 : 0); // chủ phòng đúng cả hai câu
      await answer(id, 1, idx, 1); // khách sai cả hai
      const res = await advance(id);
      expect(res.result).toBe(idx === 1 ? "finished" : "advanced");
    }
    expect(await roomRow(id)).toMatchObject({ status: "finished", winner_id: users[0].id, forfeit: false });
    expect((await roomRow(id)).finished_at).not.toBeNull();
    expect((await advance(id)).result).toBe("not_playing");
    const { data: host } = await service.from("room_players").select("correct, score").eq("room_id", id).eq("user_id", users[0].id).single();
    expect(host!.correct).toBe(2);
    expect(host!.score).toBeGreaterThanOrEqual(200);
  });

  it("bằng điểm thì không có người thắng", async () => {
    const { id } = await playingRoom(2);
    for (const idx of [0, 1]) {
      await openQuestion(id, idx, -300);
      await answer(id, 0, idx, 1); // cả hai cùng sai cả hai câu: 0 câu đúng, 0 điểm
      await answer(id, 1, idx, 1);
      await advance(id);
    }
    expect(await roomRow(id)).toMatchObject({ status: "finished", winner_id: null, forfeit: false });
  });

  it("lịch sử: ván đã kết thúc hiện cho cả hai người với kết quả đúng góc nhìn; xem lại chỉ cho thành viên và chỉ khi đã xong", async () => {
    const { listRoomHistory } = await import("@/lib/rooms/room-history-repo");
    const { getFinishedRoomView } = await import("@/lib/rooms/room-repo");
    const { id } = await playingRoom(2);
    expect(await getFinishedRoomView(users[0].id, id)).toBeNull(); // ván đang chơi chưa xem lại được
    for (const idx of [0, 1]) {
      await openQuestion(id, idx, -300);
      await answer(id, 0, idx, idx % 2 === 0 ? 2 : 0);
      await answer(id, 1, idx, 1);
      await advance(id);
    }
    const host = (await listRoomHistory(users[0].id)).find((e) => e.roomId === id);
    expect(host).toMatchObject({ result: "win", forfeit: false, opponent: { name: expect.any(String) }, myCorrect: 2, theirCorrect: 0 });
    expect(host!.myScore).toBeGreaterThanOrEqual(200);
    expect((await listRoomHistory(users[1].id)).find((e) => e.roomId === id)).toMatchObject({ result: "loss", myScore: 0, theirScore: host!.myScore });

    const view = await getFinishedRoomView(users[1].id, id);
    expect(view).toMatchObject({ status: "finished", winner: "opponent" });
    expect(view!.rounds).toHaveLength(2);
    expect(await getFinishedRoomView(users[2].id, id)).toBeNull(); // người ngoài phòng không xem được
  });

  it("rời phòng giữa ván: ván kết thúc xử người còn lại thắng", async () => {
    const { id } = await playingRoom(2);
    await rpc("leave_room", { p_room: id, p_user: users[1].id });
    expect(await roomRow(id)).toMatchObject({ status: "finished", winner_id: users[0].id, forfeit: true });
  });

  it("vắng 3 câu liền (rớt mạng, đóng tab) thì bị coi là đã rời và ván kết thúc xử người còn lại thắng", async () => {
    const { id } = await playingRoom(4);
    for (const idx of [0, 1, 2]) {
      await openQuestion(id, idx, -300);
      await answer(id, 0, idx, 1); // chỉ chủ phòng trả lời
      await closeByDeadline(id, idx);
      const res = await advance(id);
      expect(res.result).toBe(idx === 2 ? "finished" : "advanced");
    }
    const { data: guest } = await service.from("room_players").select("left_at").eq("room_id", id).eq("user_id", users[1].id).single();
    expect(guest!.left_at).not.toBeNull();
    expect(await roomRow(id)).toMatchObject({ status: "finished", winner_id: users[0].id, forfeit: true });
  });

  // Realtime: chỉ thành viên nhận được thay đổi của phòng (RLS), người ngoài không nhận gì.
  // `setAuth` truyền token người dùng cho Realtime (client Node không tự làm); thiếu thì kênh chạy với vai trò anon và RLS chặn hết sự kiện.
  function listen(user: { client: SupabaseClient; token: string }, roomId: string, events: string[]) {
    const client = user.client;
    client.realtime.setAuth(user.token);
    return new Promise<() => Promise<unknown>>((resolve, reject) => {
      const channel = client.channel(`test-${roomId}-${Math.random()}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` }, (p) => events.push(p.eventType))
        .subscribe((status) => {
          if (status === "SUBSCRIBED") resolve(() => client.removeChannel(channel));
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") reject(new Error(`realtime ${status}`));
        });
    });
  }

  it("Realtime: thành viên nhận thay đổi người chơi của phòng mình, người ngoài không nhận gì", async () => {
    const { id } = await playingRoom(2);
    const memberEvents: string[] = [];
    const outsiderEvents: string[] = [];
    const stopMember = await listen(users[1], id, memberEvents);
    const stopOutsider = await listen(users[2], id, outsiderEvents);
    await new Promise((r) => setTimeout(r, 1500)); // chờ đăng ký có hiệu lực ở phía server
    await openQuestion(id, 0, -300);
    await answer(id, 0, 0, 2); // cập nhật room_players.answered_idx
    const deadline = Date.now() + 10_000;
    while (memberEvents.length === 0 && Date.now() < deadline) await new Promise((r) => setTimeout(r, 200));
    await new Promise((r) => setTimeout(r, 1500));
    await stopMember();
    await stopOutsider();
    expect(memberEvents).toContain("UPDATE");
    expect(outsiderEvents).toEqual([]);
  }, 30_000);

  it("công thức điểm ở SQL (room_answer_points) trùng bản TypeScript", async () => {
    for (const correct of [true, false]) {
      for (const elapsed of [-5, 0, 1, 250, 750, 1800, 7499, 7500, 7501, 14_750, 14_999, 15_000, 20_000]) {
        const sql = await rpc<number>("room_answer_points", { p_correct: correct, p_elapsed_ms: elapsed });
        expect(sql, `correct=${correct} elapsed=${elapsed}`).toBe(roomAnswerPoints(correct, elapsed));
      }
    }
  });

  // Chơi trọn một ván 1 câu giữa hai người (chủ phòng đúng, khách sai) để có đủ lịch sử: người chơi, câu trả lời, người thắng.
  async function finishedGame(host: number, guest: number) {
    const code = newCode();
    const id = await createRoom(host, code);
    await join(guest, code);
    await rpc("set_room_ready", { p_room: id, p_user: users[guest].id, p_ready: true });
    await addQuestions(id, 1);
    expect(await rpc<string>("start_room", { p_room: id, p_host: users[host].id, p_video: videoId })).toBe("ok");
    await openQuestion(id, 0, -300);
    await answer(id, host, 0, 2);
    await answer(id, guest, 0, 1);
    expect((await advance(id)).result).toBe("finished");
    return id;
  }

  it("gộp tài khoản: lịch sử phòng (người chơi, câu trả lời, chủ phòng, người thắng) đi theo tài khoản đích", async () => {
    const { createMergeToken, executeMerge } = await import("@/lib/account/merge-account");
    await signInAnon();
    await signInAnon();
    const [from, to, opponent] = [users.length - 2, users.length - 1, 1];
    const roomId = await finishedGame(from, opponent); // `from` là chủ phòng và người thắng
    expect(await roomRow(roomId)).toMatchObject({ host_id: users[from].id, winner_id: users[from].id });

    await executeMerge(service, await createMergeToken(service, users[from].id), users[to].id);

    expect(await roomRow(roomId)).toMatchObject({ host_id: users[to].id, winner_id: users[to].id, status: "finished" });
    const { data: players } = await service.from("room_players").select("user_id, display_name, correct").eq("room_id", roomId).order("joined_at");
    expect(players!.map((p) => p.user_id)).toEqual([users[to].id, users[opponent].id]);
    expect(players![0]).toMatchObject({ display_name: `Host${from}`, correct: 1 });
    const { data: answers } = await service.from("room_answers").select("user_id, correct").eq("room_id", roomId);
    expect(answers!.find((a) => a.user_id === users[to].id)).toMatchObject({ correct: true });
    expect(await service.from("room_players").select("user_id").eq("user_id", users[from].id).then((r) => r.data)).toEqual([]);
  });

  it("gộp tài khoản khi hai tài khoản từng đấu với nhau: giữ hàng và câu trả lời của tài khoản đích, không lỗi khóa trùng", async () => {
    const { createMergeToken, executeMerge } = await import("@/lib/account/merge-account");
    await signInAnon();
    await signInAnon();
    const [from, to] = [users.length - 2, users.length - 1];
    const roomId = await finishedGame(from, to); // from thắng, to thua; gộp from vào to
    await executeMerge(service, await createMergeToken(service, users[from].id), users[to].id);

    const { data: players } = await service.from("room_players").select("user_id, correct").eq("room_id", roomId);
    expect(players).toEqual([{ user_id: users[to].id, correct: 0 }]); // hàng của đích (đã thua) còn, hàng nguồn bỏ
    const { data: answers } = await service.from("room_answers").select("user_id, correct").eq("room_id", roomId);
    expect(answers).toEqual([{ user_id: users[to].id, correct: false }]);
    expect(await roomRow(roomId)).toMatchObject({ host_id: users[to].id, winner_id: users[to].id });
  });

  // Mọi bảng có khóa ngoại tới auth.users phải được phân loại: hoặc nằm trong merge_user_data (người dùng không được mất dữ liệu khi
  // đăng nhập Google), hoặc cố ý bỏ qua kèm lý do. Thêm bảng mới mà chưa phân loại thì test này đỏ, nhắc cập nhật hàm gộp.
  it("mọi bảng có user_id đều đã được phân loại cho việc gộp tài khoản", async () => {
    const merged = new Set([
      "user_profiles.user_id", "user_known_terms.user_id", "user_cards.user_id", "review_logs.user_id", "usage_events.user_id",
      "user_song_progress.user_id", "user_song_likes.user_id", "practice_scores.user_id", "leaderboard_profiles.user_id",
      "song_reports.user_id", "room_players.user_id", "room_answers.user_id", "rooms.host_id", "rooms.winner_id",
    ]);
    const ignored = new Set([
      "account_merge_tokens.from_user", // mã gộp của chính tài khoản nguồn, xóa theo tài khoản
      "feedback.user_id", // on delete set null: góp ý giữ lại, chỉ mất liên kết người gửi
      "translation_suggestions.user_id", // on delete set null: như trên
      "challenges.creator_id", // on delete set null: thử thách giữ lại, chỉ mất liên kết người tạo
      "challenge_attempts.user_id", // on delete set null: như trên; mỗi người một lượt nên không gộp
      "player_reports.reporter_id", // on delete set null: báo cáo giữ lại cho quản trị
      "email_prefs.user_id", // tùy chọn email gắn với tài khoản có email thật (Google); tài khoản ẩn danh không có hàng này nên không có gì để gộp
      "push_subscriptions.user_id", // đăng ký theo thiết bị: app đăng ký lại endpoint với tài khoản hiện tại mỗi lần mở, nên tự gắn lại sau khi gộp
      "video_lessons.added_by", // on delete set null: video người dùng thêm là dữ liệu dùng chung nên giữ lại, chỉ mất liên kết người thêm (bộ đếm 3 video/ngày của tài khoản gộp có thể được đặt lại, trần chung 100 video/ngày vẫn chặn lạm dụng)
      "video_translation_reports.user_id", // on delete set null: báo cáo giữ lại cho quản trị, chỉ mất liên kết người báo
    ]);
    const { data, error } = await service.rpc("tables_referencing_users");
    expect(error).toBeNull();
    const found = (data as { table_name: string; column_name: string }[]).map((r) => `${r.table_name}.${r.column_name}`);
    const unclassified = found.filter((f) => !merged.has(f) && !ignored.has(f));
    expect(unclassified, `Bảng chưa phân loại cho gộp tài khoản: ${unclassified.join(", ")}`).toEqual([]);
    // Danh sách khai báo cũng không được chứa bảng không còn tồn tại (tránh phân loại cũ lỗi thời).
    const stale = [...merged, ...ignored].filter((f) => !found.includes(f));
    expect(stale, `Phân loại cũ không còn bảng tương ứng: ${stale.join(", ")}`).toEqual([]);
  });

  it("các hàm phòng không gọi được bằng khóa anon/người dùng (chỉ service role)", async () => {
    const { error } = await users[0].client.rpc("join_room", { p_code: "123456", p_user: users[0].id, p_name: "Hacker" });
    expect(error).not.toBeNull();
  });
});
