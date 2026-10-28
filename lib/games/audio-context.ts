let ctx: AudioContext | null = null;

/** AudioContext dùng chung của các game (tạo lười, đánh thức lại nếu trình duyệt tạm dừng). Trả null nếu môi trường không có WebAudio. Chỉ gọi sau thao tác người dùng. */
export function getAudioContext(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}
