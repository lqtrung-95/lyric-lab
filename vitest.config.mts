import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.ts", "scripts/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Test tích hợp gọi Supabase thật nhiều lần liên tiếp (mỗi lượt 150–500 ms tùy mạng): 5 giây mặc định không đủ cho các kịch bản dài
    // như chơi trọn một ván hay gộp tài khoản. Test đơn vị vẫn chạy trong vài ms nên giới hạn rộng này không che lỗi treo của chúng.
    testTimeout: 30_000,
    coverage: { provider: "v8", include: ["lib/**"] },
  },
});
