import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

/**
 * Lớp chặn thô cho mọi API phòng (xem phòng, sẵn sàng, rời, bắt đầu, trả lời, tiến câu): một client bình thường thăm dò khoảng
 * 15 lượt/phút và vài thao tác mỗi ván, nên 180 lượt/phút/tài khoản là rộng rãi nhưng đủ chặn việc dội yêu cầu vào DB. Đếm trong bộ nhớ
 * của từng instance serverless nên không chính xác tuyệt đối (giống các limiter theo IP khác); tạo phòng và thử mã vào phòng đã có
 * hạn mức chính xác trong DB (`room`, `room_join`).
 */
export const ROOM_REQUESTS_PER_MINUTE = 180;
const limiter = new InMemoryRateLimiter(ROOM_REQUESTS_PER_MINUTE, 60_000);

export const allowRoomRequest = (userId: string, l: Pick<InMemoryRateLimiter, "tryConsume"> = limiter): boolean => l.tryConsume(userId);
