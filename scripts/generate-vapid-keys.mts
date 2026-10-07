// Sinh cặp khóa VAPID cho thông báo đẩy. In ra màn hình để bạn tự dán vào .env.local / biến môi trường Vercel; không ghi file nào.
//   npx tsx scripts/generate-vapid-keys.mts
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:email-cua-ban@example.com");
console.log("CRON_SECRET=<chuỗi ngẫu nhiên ≥ 16 ký tự>");
