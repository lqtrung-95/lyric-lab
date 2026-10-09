// Bookmarklet "Gửi sang SongHanzi": dấu trang chạy ngay trên trang video youtube.com của người dùng (IP và phiên của họ nên không bị YouTube chặn như
// server của ta). Nó tự mở bảng "Bản chép lời" nếu chưa mở, đọc chữ trong bảng rồi mở trang Thêm video của app kèm dữ liệu trong phần `#` của địa chỉ.
// Dữ liệu nằm sau dấu `#` nên không bao giờ gửi lên server qua địa chỉ, và không phụ thuộc cửa sổ mở ra còn liên kết với cửa sổ gốc hay không.
// Không đọc track phụ đề (`fmt=json3`) hay gọi API bản chép lời nội bộ: trên YouTube thật cả hai đều bị từ chối (trả rỗng / FAILED_PRECONDITION)
// vì thiếu mã xác thực mà chỉ trình phát của YouTube có.

/** Dữ liệu bookmarklet gửi: `t` là văn bản bản chép lời đọc từ bảng của YouTube (mốc giờ và lời, parse bằng `parsePastedTranscript`). */
export interface BookmarkletPayload {
  v: string;
  t: string;
}

// ES5 thuần để chạy được ở mọi trình duyệt; mỗi lệnh kết thúc bằng dấu chấm phẩy vì mã bị nén về một dòng.
const SOURCE = `(function(O){
var m=location.search.match(/[?&]v=([\\w-]{11})/);
if(!/(^|\\.)youtube\\.com$/.test(location.hostname)||!m){alert('Hãy mở một video trên youtube.com rồi bấm lại nhé.');return;}
var id=m[1];
var help='Video này có thể không có bản chép lời. Bạn thử bấm "Hiện bản chép lời" dưới phần mô tả rồi bấm lại, hoặc dán phụ đề vào trang Thêm video.';
function go(p){var b=btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');window.open(O+'/video/add#d='+b,'_blank');}
function readPanel(){var best='';var els=document.querySelectorAll('[target-id*="transcript"]');for(var i=0;i<els.length;i++){var s=els[i].innerText||'';if(s.length>best.length){best=s;}}return /(^|\\n)(\\d{1,2}:)?\\d{1,2}:\\d{2}(\\n|\\s)/.test(best)?best:'';}
function send(t){var han=(t.match(/[\\u4e00-\\u9fff]/g)||[]).length;if(han<10){alert('Bản chép lời đang không phải tiếng Trung. Hãy đổi ngôn ngữ ở cuối bảng bản chép lời sang tiếng Trung rồi bấm lại.');return;}go({v:id,t:t});}
var now=readPanel();
if(now){send(now);return;}
var ex=document.querySelector('#description-inline-expander #expand')||document.querySelector('tp-yt-paper-button#expand');
if(ex){ex.click();}
setTimeout(function(){
var bs=document.querySelectorAll('button,yt-button-shape button');var btn=null;
for(var i=0;i<bs.length&&!btn;i++){var s=(bs[i].getAttribute('aria-label')||'')+' '+(bs[i].innerText||'');if(/transcript|bản chép|轉錄|转录|文字稿/i.test(s)){btn=bs[i];}}
if(!btn){alert(help);return;}
btn.click();
var tries=0;
(function wait(){var t=readPanel();if(t){send(t);return;}tries++;if(tries>12){alert('Bản chép lời chưa tải được. '+help);return;}setTimeout(wait,500);})();
},700);
})`;

/** Mã `javascript:` để gắn vào dấu trang; `origin` là địa chỉ gốc của app (cùng nơi trang Thêm video chạy). */
export function buildBookmarklet(origin: string): string {
  return `javascript:${encodeURIComponent(`${SOURCE.replace(/\n/g, "")}(${JSON.stringify(origin)});`)}`;
}

/** Mã nguồn bookmarklet chưa mã hóa URL (dùng cho test). */
export const BOOKMARKLET_SOURCE = SOURCE;

/** Giải mã phần `#d=...` của địa chỉ; null nếu không hợp lệ. */
export function decodeBookmarkletHash(hash: string): BookmarkletPayload | null {
  const m = hash.match(/^#?d=([\w-]+)$/);
  if (!m) return null;
  try {
    const b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0));
    const p = JSON.parse(new TextDecoder().decode(bytes)) as BookmarkletPayload;
    return typeof p?.v === "string" && /^[A-Za-z0-9_-]{11}$/.test(p.v) && typeof p.t === "string" ? p : null;
  } catch {
    return null;
  }
}
