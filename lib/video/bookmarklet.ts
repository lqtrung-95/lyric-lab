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

// ES5 thuần để chạy được ở mọi trình duyệt; mỗi lệnh kết thúc bằng dấu chấm phẩy vì mã bị nén về một dòng. Chỉ dùng textContent/createElement (YouTube
// bật Trusted Types nên innerHTML bị chặn) và style qua CSSOM (không phụ thuộc CSP).
const SOURCE = `(function(O){
var m=location.search.match(/[?&]v=([\\w-]{11})/);
if(!/(^|\\.)youtube\\.com$/.test(location.hostname)||!m){alert('Hãy mở một video trên youtube.com rồi bấm lại nhé.');return;}
var id=m[1];
var SEG='ytd-transcript-segment-renderer,transcript-segment-view-model';
var OPEN='ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]';
var box=null,timer=null,dots=0;
function say(msg,link){
if(!box){box=document.createElement('div');box.style.cssText='position:fixed;top:16px;right:16px;z-index:2147483647;max-width:320px;padding:12px 16px;border-radius:14px;background:#7a1b10;color:#fff;font:600 14px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.4)';document.body.appendChild(box);}
box.textContent=msg;
if(link){var a=document.createElement('a');a.href=link;a.target='_blank';a.textContent=' Bấm để mở SongHanzi';a.style.cssText='color:#ffd54a;text-decoration:underline';box.appendChild(a);}
}
function stop(){if(timer){clearInterval(timer);timer=null;}}
function hide(){stop();if(box){box.remove();box=null;}}
function fail(msg){hide();alert(msg);}
function dbg(){var p=document.querySelectorAll(OPEN),ids=[];for(var i=0;i<p.length;i++){ids.push(p[i].getAttribute('target-id'));}return ' (mã lỗi: '+document.querySelectorAll(SEG).length+' dòng; '+ids.join(',')+')';}
var help='Video này có thể không có bản chép lời. Bạn thử bấm "Hiện bản chép lời" dưới phần mô tả rồi bấm lại, hoặc dán phụ đề vào trang Thêm video.';
function go(p){var b=btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');var url=O+'/video/add#d='+b;stop();say('Đã đọc xong, đang mở SongHanzi…');var w=window.open(url,'_blank');if(w){setTimeout(hide,2500);}else{say('Trình duyệt chặn cửa sổ mới.',url);}}
function ok(t){return /(^|\\n)(\\d{1,2}:)?\\d{1,2}:\\d{2}(\\n|\\s)/.test(t);}
function readPanel(){
var segs=document.querySelectorAll(SEG);
if(segs.length){var a=[];for(var i=0;i<segs.length;i++){a.push(segs[i].innerText||'');}var j=a.join('\\n');if(ok(j)){return j;}}
var els=document.querySelectorAll('[target-id*="transcript"],'+OPEN);var best='';
for(var k=0;k<els.length;k++){var s=els[k].innerText||'';if(s.length>best.length&&ok(s)){best=s;}}
return best;
}
function send(t){var han=(t.match(/[\\u4e00-\\u9fff]/g)||[]).length;if(han<10){fail('Bản chép lời đang không phải tiếng Trung. Hãy đổi ngôn ngữ ở cuối bảng bản chép lời sang tiếng Trung rồi bấm lại.');return;}go({v:id,t:t});}
var now=readPanel();
if(now){send(now);return;}
var base='SongHanzi: đang đọc bản chép lời';
say(base+'.');
timer=setInterval(function(){dots=(dots+1)%3;if(box){say(base+new Array(dots+2).join('.'));}},400);
var ex=document.querySelector('#description-inline-expander #expand')||document.querySelector('tp-yt-paper-button#expand');
if(ex){ex.click();}
var clicked=[];
function tryTab(){
var chips=document.querySelectorAll(OPEN+' yt-chip-cloud-chip-renderer,'+OPEN+' [role="tab"]');
for(var i=0;i<chips.length;i++){if(clicked.indexOf(chips[i])<0){clicked.push(chips[i]);chips[i].click();return;}}
}
function openButton(){
var b=document.querySelector('ytd-video-description-transcript-section-renderer button');
if(b){return b;}
var bs=document.querySelectorAll('button,yt-button-shape button');
for(var j=0;j<bs.length;j++){var s=(bs[j].getAttribute('aria-label')||'')+' '+(bs[j].innerText||'');if(/transcript|bản chép|轉錄|转录|文字稿/i.test(s)){return bs[j];}}
return null;
}
setTimeout(function(){
if(!readPanel()){var btn=openButton();if(btn){btn.click();}}
var tries=0;
(function wait(){
var t=readPanel();if(t){send(t);return;}
tries++;if(tries>14){fail('Bản chép lời chưa tải được. '+help+dbg());return;}
if(tries%2===0&&!document.querySelectorAll(SEG).length){tryTab();}
setTimeout(wait,500);
})();
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
