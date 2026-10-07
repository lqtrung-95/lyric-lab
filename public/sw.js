// Service worker chỉ để nhận thông báo đẩy (nhắc học). Không cache gì, không chặn request.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* nội dung không phải JSON */ }
  event.waitUntil(self.registration.showNotification(data.title || "SongHanzi", {
    body: data.body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    data: { url: data.url || "/app" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/app";
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of all) {
      if ("focus" in client) { await client.navigate(url).catch(() => {}); return client.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});
