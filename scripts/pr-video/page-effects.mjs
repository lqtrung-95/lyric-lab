// Hiệu ứng chèn thẳng vào trang khi quay: chữ phụ đề nảy vào (có tô màu **cụm nhấn**), vòng ripple khi "chạm",
// nháy trắng chuyển cảnh, thanh tiến độ chạy suốt video và màn kết.
export function setupEffects(p) {
  const css = `
    @keyframes prPop{0%{transform:scale(.8) translateY(14px);opacity:0}60%{transform:scale(1.05);opacity:1}100%{transform:scale(1)}}
    @keyframes prRipple{0%{transform:translate(-50%,-50%) scale(.2);opacity:.9}100%{transform:translate(-50%,-50%) scale(1.6);opacity:0}}
    @keyframes prFlash{0%{opacity:.85}100%{opacity:0}}
    @keyframes prRise{0%{transform:translateY(30px) scale(.9);opacity:0}100%{transform:none;opacity:1}}
    #pr-cap b{color:#ffd54a}`;
  const ensureCss = () => p.evaluate((c) => {
    if (document.getElementById("pr-css")) return;
    const s = document.createElement("style"); s.id = "pr-css"; s.textContent = c; document.head.appendChild(s);
  }, css);

  return {
    // Phụ đề: **cụm** thành chữ vàng đậm; bbật lại animation mỗi lần đổi chữ.
    async caption(text, { top = false, hook = false } = {}) {
      await ensureCss();
      await p.evaluate(([t, top, hook]) => {
        let el = document.getElementById("pr-cap");
        if (el) el.remove();
        el = document.createElement("div"); el.id = "pr-cap";
        const esc = t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        el.innerHTML = esc.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
        el.style.cssText = `position:fixed;left:16px;right:16px;z-index:99999;text-align:center;color:#fff;background:rgba(20,10,8,.84);padding:14px 18px;border-radius:18px;font:700 ${hook ? 30 : 22}px/1.3 system-ui,sans-serif;pointer-events:none;box-shadow:0 8px 30px rgba(0,0,0,.35);animation:prPop .45s cubic-bezier(.2,.9,.3,1.2);${top || hook ? `top:${hook ? 130 : 84}px` : "bottom:110px"}`;
        el.style.display = t ? "block" : "none";
        document.body.appendChild(el);
      }, [text, top, hook]);
    },
    // Nháy trắng ngắn ở đầu mỗi cảnh.
    async flash() {
      await ensureCss();
      await p.evaluate(() => {
        const d = document.createElement("div");
        d.style.cssText = "position:fixed;inset:0;z-index:100001;background:#fff;pointer-events:none;animation:prFlash .35s ease-out forwards";
        document.body.appendChild(d); setTimeout(() => d.remove(), 450);
      });
    },
    // Thanh tiến độ đỏ ở mép trên: bắt đầu từ `frac` (0-1) và chạy tới đầy trong `seconds` giây.
    // Mất khi trang tải lại nên gọi lại sau mỗi lần điều hướng.
    async progress(frac, seconds) {
      await p.evaluate(([f, sec]) => {
        document.getElementById("pr-bar")?.remove();
        const bar = document.createElement("div"); bar.id = "pr-bar";
        bar.style.cssText = `position:fixed;top:0;left:0;height:5px;width:${f * 100}%;background:#ff5a3c;z-index:100002;transition:width ${sec}s linear`;
        document.body.appendChild(bar); requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = "100%"; }));
      }, [frac, seconds]);
    },
    // Vòng ripple tại tâm phần tử rồi mới bấm, như ngón tay chạm.
    async tap(locator) {
      await ensureCss();
      await locator.scrollIntoViewIfNeeded();
      const box = await locator.boundingBox();
      if (box) {
        await p.evaluate(([x, y]) => {
          const d = document.createElement("div");
          d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:90px;height:90px;border-radius:50%;background:rgba(255,213,74,.55);border:3px solid #ffd54a;z-index:100003;pointer-events:none;animation:prRipple .6s ease-out forwards`;
          document.body.appendChild(d); setTimeout(() => d.remove(), 700);
        }, [box.x + box.width / 2, box.y + box.height / 2]);
        await p.waitForTimeout(220);
      }
      await locator.click();
    },
    // Màn kết thương hiệu: logo nảy lên rồi tới nút songhanzi.com.
    async outro() {
      await ensureCss();
      await p.evaluate(() => {
        const d = document.createElement("div");
        d.style.cssText = "position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:linear-gradient(160deg,#7a1b10,#c0392b);color:#fff;font-family:Georgia,serif;text-align:center;padding:24px";
        d.innerHTML = '<div style="font-size:64px;font-weight:700;animation:prRise .6s ease-out both">SongHanzi</div><div style="font:600 26px system-ui,sans-serif;animation:prRise .6s .15s ease-out both">Học tiếng Trung qua bài hát</div><div style="font:700 30px system-ui,sans-serif;background:#fff;color:#7a1b10;padding:12px 28px;border-radius:999px;margin-top:12px;animation:prPop .5s .45s ease-out both">songhanzi.com</div><div style="font:500 20px system-ui,sans-serif;opacity:.9;animation:prRise .6s .7s ease-out both">Miễn phí · Dán link YouTube là học</div>';
        document.body.appendChild(d);
      });
    },
  };
}
