import { defineConfig } from "@playwright/test";

// Cổng riêng để không đụng dev server khác trên máy.
const PORT = 3100;

// Mặc định chạy e2e trên bản production (`next start` sau khi dựng): không biên dịch tuyến lúc chạy nên nhanh và ổn định hơn nhiều so với `next dev`
// (nhiều test từng trượt vì lần đầu mở tuyến còn biên dịch). `E2E_DEV=1` quay về `next dev` khi cần gỡ lỗi nhanh. Các trang thử `/dev/*` mở nhờ ENABLE_DEV_FIXTURES=1.
const useDev = process.env.E2E_DEV === "1";

export default defineConfig({
  testDir: "tests/e2e",
  // Nhiều test dùng chung dữ liệu thật trên Supabase (bài mẫu E2E, tài khoản ẩn danh tìm theo từ đã lưu): chạy tuần tự để không dẫm chân nhau.
  workers: 1,
  fullyParallel: false,
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: useDev ? `npx next dev -p ${PORT}` : `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { ENABLE_DEV_FIXTURES: "1" },
  },
});
