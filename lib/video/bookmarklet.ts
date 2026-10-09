import type { CaptionLine } from "@/lib/captions/caption-provider-types";

// Bookmarklet "Gửi sang SongHanzi": dấu trang chạy ngay trên trang video youtube.com của người dùng (IP và phiên của họ nên không bị YouTube chặn như
// server của ta), đọc bản chép lời hoặc phụ đề tiếng Trung rồi mở trang Thêm video của app kèm dữ liệu trong phần `#` của địa chỉ.
// Dữ liệu nằm sau dấu `#` nên không bao giờ gửi lên server qua địa chỉ, và không phụ thuộc cửa sổ mở ra còn liên kết với cửa sổ gốc hay không.

/** Dữ liệu bookmarklet gửi: `t` là văn bản bản chép lời đọc từ bảng của YouTube; `l` là các cặp [giây bắt đầu, lời] từ track phụ đề. */
export interface BookmarkletPayload {
  v: string;
  t?: string;
  l?: [number, string][];
}

// ES5 thuần để chạy được ở mọi trình duyệt; mỗi lệnh kết thúc bằng dấu chấm phẩy vì mã bị nén về một dòng.
const SOURCE = `(function(O){
var m=location.search.match(/[?&]v=([\\w-]{11})/);
if(!/(^|\\.)youtube\\.com$/.test(location.hostname)||!m){alert('Hãy mở một video trên youtube.com rồi bấm lại nhé.');return;}
var id=m[1];
function go(p){var b=btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');window.open(O+'/video/add#d='+b,'_blank');}
var best='';var els=document.querySelectorAll('[target-id*="transcript"]');
for(var i=0;i<els.length;i++){var s=els[i].innerText||'';if(s.length>best.length){best=s;}}
if(/(^|\\n)(\\d{1,2}:)?\\d{1,2}:\\d{2}(\\n|\\s)/.test(best)){go({v:id,t:best});return;}
var pr=null;try{pr=document.getElementById('movie_player').getPlayerResponse();}catch(e){}
var tr=(pr&&pr.captions&&pr.captions.playerCaptionsTracklistRenderer&&pr.captions.playerCaptionsTracklistRenderer.captionTracks)||[];
var c=tr.filter(function(x){return /^(zh|yue)/.test(x.languageCode);}).sort(function(a,b){return (a.kind==='asr')-(b.kind==='asr');})[0];
var help='Hãy mở "Hiện bản chép lời" dưới phần mô tả video (nếu có) rồi bấm lại.';
if(!c){alert('Chưa thấy phụ đề tiếng Trung. '+help);return;}
fetch(c.baseUrl+'&fmt=json3').then(function(r){return r.json();}).then(function(d){
var l=[];(d.events||[]).forEach(function(e){if(!e.segs){return;}var x=e.segs.map(function(s){return s.utf8;}).join('').replace(/\\s+/g,' ').trim();if(x){l.push([(e.tStartMs||0)/1000,x]);}});
if(!l.length){throw 0;}go({v:id,l:l});
}).catch(function(){alert('Chưa đọc được phụ đề tự động. '+help);});
})`;

/** Mã `javascript:` để gắn vào dấu trang; `origin` là địa chỉ gốc của app (cùng nơi trang Thêm video chạy). */
export function buildBookmarklet(origin: string): string {
  return `javascript:${encodeURIComponent(`${SOURCE.replace(/\n/g, "")}(${JSON.stringify(origin)});`)}`;
}

/** Mã nguồn bookmarklet chưa mã hóa URL (dùng cho test). */
export const BOOKMARKLET_SOURCE = SOURCE;

const LAST_LINE_SECONDS = 5;

/** Giải mã phần `#d=...` của địa chỉ; null nếu không hợp lệ. */
export function decodeBookmarkletHash(hash: string): BookmarkletPayload | null {
  const m = hash.match(/^#?d=([\w-]+)$/);
  if (!m) return null;
  try {
    const b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0));
    const p = JSON.parse(new TextDecoder().decode(bytes)) as BookmarkletPayload;
    return typeof p?.v === "string" && /^[A-Za-z0-9_-]{11}$/.test(p.v) ? p : null;
  } catch {
    return null;
  }
}

/** Đổi các cặp [giây bắt đầu, lời] thành dòng có mốc kết thúc (là mốc bắt đầu của dòng sau; dòng cuối kéo dài vài giây). */
export function pairsToLines(pairs: [number, string][]): CaptionLine[] {
  const valid = pairs.filter((p) => Array.isArray(p) && typeof p[0] === "number" && typeof p[1] === "string" && p[1].trim());
  return valid.map(([start, text], i) => {
    const next = valid[i + 1]?.[0];
    return { text: text.trim().slice(0, 300), start, end: next !== undefined && next > start ? next : start + LAST_LINE_SECONDS };
  });
}
