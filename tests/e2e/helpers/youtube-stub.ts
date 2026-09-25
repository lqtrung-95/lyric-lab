import type { Page } from "@playwright/test";

/**
 * YouTube IFrame API giả cho E2E: không phụ thuộc mạng và điều khiển được thời gian phát qua `window.__t`.
 * `window.__yt` ghi lại các lệnh player nhận được (seek/play/pause/rate).
 */
export const YOUTUBE_STUB = `window.__t = 0; window.__playing = true; window.__yt = [];
window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { window.__yt.push('seek:' + s); window.__t = s; },
    playVideo: function () { window.__yt.push('play'); window.__playing = true; },
    pauseVideo: function () { window.__yt.push('pause'); window.__playing = false; },
    setPlaybackRate: function (r) { window.__yt.push('rate:' + r); },
    getCurrentTime: function () { return window.__t; },
    getPlayerState: function () { return window.__playing ? 1 : 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

export async function stubYouTube(page: Page) {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: YOUTUBE_STUB }));
  // Ảnh bìa YouTube: trả ảnh trống để test không phụ thuộc mạng.
  await page.route("https://i.ytimg.com/**", (route) => route.fulfill({ status: 204 }));
}
