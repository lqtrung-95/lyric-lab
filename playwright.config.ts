import { defineConfig } from "@playwright/test";

// Cổng riêng để không đụng dev server khác trên máy.
const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  // Nhiều test dùng chung dữ liệu thật trên Supabase (bài mẫu E2E, tài khoản ẩn danh tìm theo từ đã lưu): chạy tuần tự để không dẫm chân nhau.
  workers: 1,
  fullyParallel: false,
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
});
