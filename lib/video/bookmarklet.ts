// Bookmarklet "Gửi sang SongHanzi": dấu trang chạy ngay trên trang video youtube.com của người dùng (IP và phiên của họ nên không bị YouTube chặn như
// server của ta). Nó tự mở bảng "Bản chép lời" nếu chưa mở, đọc chữ trong bảng rồi mở trang Thêm video của app kèm dữ liệu trong phần `#` của địa chỉ.
// Dữ liệu nằm sau dấu `#` nên không bao giờ gửi lên server qua địa chỉ, và không phụ thuộc cửa sổ mở ra còn liên kết với cửa sổ gốc hay không.
// Không đọc track phụ đề (`fmt=json3`) hay gọi API bản chép lời nội bộ: trên YouTube thật cả hai đều bị từ chối (trả rỗng / FAILED_PRECONDITION)
// vì thiếu mã xác thực mà chỉ trình phát của YouTube có.

/**
 * Dữ liệu bookmarklet gửi: `t` là văn bản bản chép lời tiếng Trung đọc từ bảng của YouTube (mốc giờ và lời, parse bằng `parsePastedTranscript`);
 * `vt` (nếu có) là bản chép lời tiếng Việt của track phụ đề tiếng Việt do người làm, để ghép làm bản dịch thay vì nhờ AI.
 */
export interface BookmarkletPayload {
  v: string;
  t: string;
  vt?: string;
}

// ES5 thuần để chạy được ở mọi trình duyệt; mỗi lệnh kết thúc bằng dấu chấm phẩy vì mã bị nén về một dòng. Chỉ dùng textContent/createElement (YouTube
// bật Trusted Types nên innerHTML bị chặn) và style qua CSSOM (không phụ thuộc CSP).
// `visibleSegs` (trong SOURCE): YouTube giữ nhiều bản của khung bản chép lời trong trang (khung ẩn, khung cũ sau khi đổi ngôn ngữ), nên chỉ lấy các dòng đang hiện và thuộc MỘT khung (khung nhiều dòng nhất).
// Không được viết chú thích `//` bên trong SOURCE: bản `javascript:` bỏ hết xuống dòng nên chú thích sẽ nuốt phần mã phía sau.
const SOURCE = `(function(O){
var m=location.search.match(/[?&]v=([\\w-]{11})/);
if(!/(^|\\.)youtube\\.com$/.test(location.hostname)||!m){alert('Hãy mở một video trên youtube.com rồi bấm lại nhé.');return;}
var id=m[1];
var SEG='ytd-transcript-segment-renderer,transcript-segment-view-model';
var OPEN='ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]';
var box=null,timer=null,dots=0,moved=false;
function say(msg,link){
if(!box){box=document.createElement('div');box.style.cssText='position:fixed;top:16px;right:16px;z-index:2147483647;max-width:320px;padding:12px 40px 12px 16px;border-radius:14px;background:#7a1b10;color:#fff;font:600 14px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.4)';document.body.appendChild(box);}
box.textContent=msg;
if(link){var a=document.createElement('a');a.href=link;a.target='_blank';a.textContent=' Bấm để mở SongHanzi';a.style.cssText='color:#ffd54a;text-decoration:underline';box.appendChild(a);}
var x=document.createElement('button');x.type='button';x.textContent='\u00d7';x.setAttribute('aria-label','Đóng');x.style.cssText='position:absolute;top:6px;right:8px;width:28px;height:28px;border:0;border-radius:14px;background:transparent;color:#fff;font:400 22px/28px system-ui,sans-serif;cursor:pointer';x.onclick=hide;box.appendChild(x);
}
function stop(){if(timer){clearInterval(timer);timer=null;}}
function hide(){stop();if(box){box.remove();box=null;}}
function fail(msg){hide();alert(msg);}
function dbg(){var p=document.querySelectorAll(OPEN),ids=[];for(var i=0;i<p.length;i++){ids.push(p[i].getAttribute('target-id'));}var tr=null;try{tr=langTrigger();}catch(e){}return ' (mã lỗi: '+document.querySelectorAll(SEG).length+' dòng; '+ids.join(',')+'; ngôn ngữ: '+(tr?norm(tr.innerText):'?')+')';}
var help='Video này có thể không có phụ đề. Bạn thử bấm nút hiện phụ đề dạng văn bản (Show transcript) dưới phần mô tả rồi bấm lại, hoặc dán phụ đề vào trang Thêm video.';
function go(p){var b=btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');var url=O+'/video/add#d='+b;stop();say('Đã đọc xong, đang mở SongHanzi…');var w=window.open(url,'_blank');if(w){setTimeout(hide,2500);}else{say('Trình duyệt chặn cửa sổ mới.',url);}}
function ok(t){return /(^|\\n)(\\d{1,2}:)?\\d{1,2}:\\d{2}(\\n|\\s)/.test(t);}
function visibleSegs(){var all=document.querySelectorAll(SEG),vis=[],i;for(i=0;i<all.length;i++){if(shown(all[i])){vis.push(all[i]);}}
if(!vis.length){return all;}var roots=[],groups=[];for(i=0;i<vis.length;i++){var r=vis[i].closest('ytd-engagement-panel-section-list-renderer')||document,k=roots.indexOf(r);if(k<0){roots.push(r);groups.push([]);k=roots.length-1;}groups[k].push(vis[i]);}
var best=groups[0];for(i=1;i<groups.length;i++){if(groups[i].length>best.length){best=groups[i];}}return best;}
function readPanel(){
var segs=visibleSegs();
if(segs.length){var a=[];for(var i=0;i<segs.length;i++){a.push(segs[i].innerText||'');}var j=a.join('\\n');if(ok(j)){return j;}}
var els=document.querySelectorAll('[target-id*="transcript"],'+OPEN);var best='';
for(var k=0;k<els.length;k++){var s=els[k].innerText||'';if(s.length>best.length&&ok(s)){best=s;}}
return best;
}
function han(t){return (t.match(/[\\u4e00-\\u9fff]/g)||[]).length;}
var LANGS=['ar','zh','en','fr','de','id','it','ja','ko','pt','ru','es','th','ur','vi','hi','tr','nl','pl','ms'];
var dn=null;try{dn=new Intl.DisplayNames([document.documentElement.lang||navigator.language||'en'],{type:'language'});}catch(e){}
function nm(c){try{return dn?dn.of(c):null;}catch(e){return null;}}
function norm(t){return (t||'').replace(/\\s+/g,' ').trim().toLowerCase();}
function isLang(t){t=norm(t);if(!t||t.length>50){return false;}for(var i=0;i<LANGS.length;i++){var n=nm(LANGS[i]);if(n&&t.indexOf(n.toLowerCase())===0){return true;}}return false;}
function isLangItem(code,t){var n=nm(code);return !!n&&norm(t).indexOf(n.toLowerCase())===0;}
function shown(e){return !!(e.offsetWidth||e.offsetHeight||(e.getClientRects&&e.getClientRects().length));}
function langTrigger(){
var segs=document.querySelectorAll(SEG);
var root=(segs[0]&&(segs[0].closest('ytd-engagement-panel-section-list-renderer')||segs[0].closest('[target-id]')))||document;
var c=root.querySelectorAll('yt-dropdown-menu,tp-yt-paper-button,[role="combobox"],[role="button"],button');
for(var i=c.length-1;i>=0;i--){if(shown(c[i])&&isLang(c[i].innerText)){return c[i];}}
return null;
}
function navLink(e){var h=e.getAttribute&&e.getAttribute('href');return e.tagName==='A'&&!!h&&/^(\\/|https?:)/.test(h);}
function inPopup(e){return !!(e.closest&&e.closest('tp-yt-iron-dropdown,ytd-menu-popup-renderer,tp-yt-paper-listbox'));}
function langItem(code){
var c=document.querySelectorAll('tp-yt-paper-item,[role="menuitem"],[role="option"],[role="menuitemradio"],yt-list-item-view-model,ytd-menu-service-item-renderer,a');
var fb=null;
for(var i=0;i<c.length;i++){if(shown(c[i])&&isLangItem(code,c[i].innerText)&&!navLink(c[i])){if(inPopup(c[i])){return c[i];}if(!fb){fb=c[i];}}}
return fb;
}
function switchLang(code,accept,done){
var tr=langTrigger();if(!tr){done(false);return;}
tr.click();
setTimeout(function(){
var it=langItem(code);if(!it){tr.click();done(false);return;}
var u0=location.href;it.click();
var n=0;(function w(){if(location.href!==u0){moved=true;done(false);return;}var t=readPanel();if(t&&accept(t)){done(t);return;}n++;if(n>10){done(false);return;}setTimeout(w,500);})();
},500);
}
function humanVi(){try{var tr=document.getElementById('movie_player').getPlayerResponse().captions.playerCaptionsTracklistRenderer.captionTracks;for(var i=0;i<tr.length;i++){if(/^vi/i.test(tr[i].languageCode)&&tr[i].kind!=='asr'){return true;}}}catch(e){}return false;}
function withVi(t){
if(!humanVi()){go({v:id,t:t});return;}
say('SongHanzi: đang đọc phụ đề tiếng Việt…');
switchLang('vi',function(x){return x!==t&&han(x)<10;},function(x){go(x?{v:id,t:t,vt:x}:{v:id,t:t});});
}
function zhShown(){var tr=langTrigger();return !!tr&&isLangItem('zh',tr.innerText);}
function send(t,sw){
if(moved){fail('YouTube vừa chuyển sang trang khác khi chọn ngôn ngữ nên dừng lại. Hãy mở lại video, chọn tiếng Trung ở ô ngôn ngữ cuối bảng phụ đề rồi bấm lại.');return;}
if(han(t)<10){
if(zhShown()){fail('Video này có phụ đề gắn nhãn tiếng Trung nhưng nội dung không phải chữ Hán (có thể là tiếng Anh), nên chưa thêm được. Hãy thử video khác nhé.');return;}
if(sw){fail('Chưa tự chuyển được phụ đề sang tiếng Trung. Hãy chọn tiếng Trung ở ô ngôn ngữ cuối bảng phụ đề rồi bấm lại.'+dbg());return;}
say('SongHanzi: đang chuyển phụ đề sang tiếng Trung…');
switchLang('zh',function(x){return han(x)>=10;},function(x){if(x){send(x,true);}else{send(t,true);}});
return;
}
withVi(t);
}
function noZh(){try{var tr=document.getElementById('movie_player').getPlayerResponse().captions.playerCaptionsTracklistRenderer.captionTracks;if(tr&&tr.length){for(var i=0;i<tr.length;i++){if(/^(zh|yue)/i.test(tr[i].languageCode)){return false;}}return true;}}catch(e){}return false;}
if(noZh()){alert('Video này không có phụ đề tiếng Trung nên chưa thêm được. Hãy thử video khác.');return;}
var now=readPanel();
if(now){send(now);return;}
var base='SongHanzi: đang đọc phụ đề';
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
tries++;if(tries>14){fail('Phụ đề chưa tải được. '+help+dbg());return;}
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
    if (typeof p?.v !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(p.v) || typeof p.t !== "string") return null;
    return typeof p.vt === "string" ? p : { v: p.v, t: p.t };
  } catch {
    return null;
  }
}
