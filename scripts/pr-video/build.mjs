// Dựng video PR dọc 9:16 (TikTok/Reels) từ config.json: quay màn hình site thật bằng Playwright, thêm hiệu ứng (chữ nảy,
// vòng chạm, nháy chuyển cảnh, thanh tiến độ, tiếng whoosh), ghép giọng đọc rồi mã hóa bằng ffmpeg.
// Giọng đọc, ưu tiên từ trên xuống: file của bạn trong voice/ (1.m4a, 2.mp3…) > ElevenLabs (cần ELEVENLABS_API_KEY) > "say" của macOS.
// Chạy: node scripts/pr-video/build.mjs [thư-mục-xuất]   (mặc định ~/Desktop/songhanzi-pr)
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { elevenLabsVoiceId, elevenLabsSpeak } from "./eleven-labs.mjs";
import { setupEffects } from "./page-effects.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(here, "config.json"), "utf8"));
const out = path.resolve(process.argv[2] ?? path.join(os.homedir(), "Desktop", "songhanzi-pr"));
const work = path.join(out, "work");
fs.mkdirSync(work, { recursive: true });
const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"] }).toString();

// 1) Giọng đọc. Độ dài mỗi cảnh = max(minSeconds, giọng + 0,5s).
const ownVoice = (n) => {
  const dir = path.join(here, "voice");
  const f = fs.existsSync(dir) && fs.readdirSync(dir).find((x) => x.startsWith(`${n}.`));
  return f ? path.join(dir, f) : null;
};
const useEleven = cfg.tts.provider === "elevenlabs" && !!process.env.ELEVENLABS_API_KEY;
if (cfg.tts.provider === "elevenlabs" && !useEleven) console.warn("Chưa có ELEVENLABS_API_KEY, tạm dùng giọng macOS 'say'.");
const voiceId = useEleven ? await elevenLabsVoiceId(cfg.tts.voice) : null;
const scenes = [];
for (const [i, s] of cfg.scenes.entries()) {
  const n = i + 1, wav = path.join(work, `vo${n}.wav`);
  let src = ownVoice(n);
  if (!src && useEleven) { src = path.join(work, `vo${n}.mp3`); fs.writeFileSync(src, await elevenLabsSpeak(voiceId, s.voice, cfg.tts)); }
  if (!src) { src = path.join(work, `vo${n}.aiff`); run("say", ["-v", cfg.tts.say.voice, "-r", String(cfg.tts.say.rate), "-o", src, s.voice]); }
  run("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-ar", "44100", "-ac", "1", wav]);
  const len = parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]));
  scenes.push({ ...s, n, wav, seconds: Math.max(s.minSeconds ?? 3, len + 0.5) });
}
fs.writeFileSync(path.join(out, "script.txt"), scenes.map((s) => `${s.n}. (${s.seconds.toFixed(1)}s) ${s.voice}`).join("\n") + "\n");
const total = scenes.reduce((a, s) => a + s.seconds, 0);

// 2) Quay màn hình ở 540x960 (khung điện thoại); ffmpeg phóng lên 1080x1920 ở bước 3.
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 540, height: 960 }, recordVideo: { dir: work, size: { width: 540, height: 960 } } });
const p = await c.newPage();
const sleep = (ms) => p.waitForTimeout(ms);
const fx = setupEffects(p);
const id = cfg.videoId, listen = `${cfg.site}/learn/${id}/listen`;
const actions = {
  "type-link": async () => { await sleep(900); await fx.tap(p.getByPlaceholder(/youtube\.com/).first()); await p.keyboard.type(`https://www.youtube.com/watch?v=${id}`, { delay: 40 }); },
  analyze: async () => { await fx.tap(p.getByRole("button", { name: /Phân tích bài hát/ })); await p.waitForURL(new RegExp(id), { timeout: 20000 }); await p.waitForLoadState("networkidle"); await p.getByText(/Bắt đầu nghe/).first().waitFor({ timeout: 20000 }); },
  "preview-scroll": async () => { await sleep(600); for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 260); await sleep(450); } await p.goto(listen, { waitUntil: "networkidle" }); await p.locator("iframe").first().waitFor(); await sleep(1500); },
  listen: async () => { await fx.tap(p.getByRole("button", { name: /Bản dịch/ }).first()); await sleep(600); await p.mouse.wheel(0, 560); },
  "word-popup": async () => { await sleep(500); await fx.tap(p.getByRole("button", { name: /城/ }).first()); },
  outro: async () => { await fx.outro(); },
};
const t0 = Date.now();
await p.goto(`${cfg.site}/app`, { waitUntil: "networkidle" }); await sleep(2500);
const tStart = (Date.now() - t0) / 1000; // phần tải trang trước đó sẽ bị cắt
const starts = [];
const barEnd = total - scenes.at(-1).seconds; // thanh tiến độ chạy hết ở cuối cảnh cuối trước màn kết
const bar = () => fx.progress((Date.now() - t0) / 1000 - tStart > 0 ? ((Date.now() - t0) / 1000 - tStart) / barEnd : 0, Math.max(0.1, barEnd - ((Date.now() - t0) / 1000 - tStart)));
for (const s of scenes) {
  starts.push((Date.now() - t0) / 1000 - tStart);
  const began = Date.now();
  await fx.flash();
  if (s.action !== "outro") await bar();
  await fx.caption(s.caption, { top: s.captionTop, hook: s.hook });
  await actions[s.action]();
  if (s.action === "analyze" || s.action === "preview-scroll") { await fx.caption(s.caption, { top: s.captionTop, hook: s.hook }); await bar(); } // trang mới tải: dựng lại lớp phủ
  const left = s.seconds * 1000 - (Date.now() - began);
  if (left > 0) await sleep(left);
}
const vp = p.video();
await p.close(); const raw = await vp.path(); await c.close(); await b.close();

// 3) Ghép: cắt phần tải trang, phóng 2x, gắn giọng đọc + tiếng whoosh ở mỗi lần chuyển cảnh.
const ms = starts.map((x) => Math.round(x * 1000));
const voiceIn = scenes.flatMap((s) => ["-i", s.wav]);
const whooshIn = scenes.flatMap(() => ["-f", "lavfi", "-t", "0.35", "-i", "anoisesrc=color=pink:amplitude=0.6:sample_rate=44100"]);
const n = scenes.length;
const voiceF = scenes.map((_, i) => `[${i + 1}:a]adelay=${ms[i]}|${ms[i]}[v${i}]`);
const whooshF = scenes.map((_, i) => `[${n + 1 + i}:a]highpass=f=600,afade=t=in:d=0.12,afade=t=out:st=0.15:d=0.2,volume=0.22,adelay=${Math.max(0, ms[i] - 40)}|${Math.max(0, ms[i] - 40)}[w${i}]`);
const labels = scenes.map((_, i) => `[v${i}][w${i}]`).join("");
const mp4 = path.join(out, "songhanzi-pr.mp4");
run("ffmpeg", ["-loglevel", "error", "-y", "-ss", tStart.toFixed(3), "-i", raw, ...voiceIn, ...whooshIn,
  "-filter_complex", `[0:v]scale=1080:1920:flags=lanczos[v];${[...voiceF, ...whooshF].join(";")};${labels}amix=inputs=${n * 2}:normalize=0[a]`,
  "-map", "[v]", "-map", "[a]", "-t", total.toFixed(2), "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
  "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", mp4]);
console.log(`Xong: ${mp4} (${total.toFixed(1)}s, giọng: ${useEleven ? "ElevenLabs " + cfg.tts.voice : "macOS say / file của bạn"}). Lời đọc: ${path.join(out, "script.txt")}`);
