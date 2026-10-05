# Giai đoạn 3: Máy trạng thái ván chơi và kênh thời gian thực

## Context
- [plan.md](plan.md). Hiện chưa dùng Realtime ở đâu trong app; `lib/supabase/service-client.ts` có sẵn transport `ws` cho Node 20.
- Vercel gói Hobby: mỗi request tối đa 60s và **không giữ kết nối dài**, nên không có timer chạy nền ở server.

## Tổng quan
Ưu tiên cao, rủi ro cao nhất. Chưa làm. Ván chơi tiến triển nhờ các request ngắn và trạng thái nằm trong DB; client nhận thay đổi qua Supabase Realtime.

## Điểm then chốt
- **Không dựa vào timer của server.** Mỗi câu có `opens_at` và `deadline_at` trong DB. "Sang câu kế" là một API idempotent (so sánh-và-đặt): bất kỳ client nào gọi, server tự kiểm tra thời gian và chỉ chuyển khi đủ điều kiện (cả hai đã trả lời, hoặc quá hạn).
- Kênh chính là **Postgres Changes** trên `rooms`, `room_players`, `room_answers` (đã có RLS cho thành viên ở giai đoạn 1). Broadcast chỉ dùng cho presence và (sau này) emoji.

## Yêu cầu
- Cả hai người thấy cùng câu hỏi gần như cùng lúc; thấy "đối thủ đã trả lời" (không thấy đáp án họ chọn trước khi mình trả lời).
- Một người rớt mạng không làm phòng treo.
- Ván kết thúc ra điểm cuối và người thắng.

## Máy trạng thái
`waiting` → (chủ phòng bắt đầu, cả hai sẵn sàng) `playing` (câu 1…10) → `finished`; `expired` nếu phòng chờ quá 30 phút hoặc cả hai bỏ đi.
- Mở câu k: server đặt `opens_at = now() + 3s` (đếm ngược để hai máy kịp nhận), `deadline_at = opens_at + 15s`.
- Kết thúc câu k khi: cả hai đã trả lời, hoặc quá `deadline_at`. Người chưa trả lời bị tính sai.
- Sau câu 10: tính tổng, ghi `finished`, ghi lịch sử (để suy ra bạn luyện cùng) và có thể ghi điểm vào `practice_scores` (đề xuất: có, chế độ `cloze`, để bảng xếp hạng chung cũng thấy).

## Rớt mạng và gian lận thời gian
- Presence theo dõi người đang online. Quá 15 giây mất kết nối giữa ván thì đối thủ nhận quyền "kết thúc ván", người rớt bị xử thua ván đó.
- Thời gian trả lời luôn tính bằng giờ server, không tin đồng hồ client.
- Khi cả hai cùng rớt: `expired` sau khoảng thời gian chờ.

## Kiến trúc client
- Hook `useRoom(code)`: nạp trạng thái ban đầu qua API, rồi đăng ký Postgres Changes; hợp nhất sự kiện vào một state duy nhất; tự gọi API "tiến câu" khi hết giờ (mọi client đều gọi được, server chống trùng).
- Dùng lại `createSupabaseBrowserClient`; kênh có tên theo phòng; hủy đăng ký khi rời trang.

## Các file liên quan
- Tạo: `lib/rooms/room-state.ts` (hàm thuần: tính trạng thái kế tiếp từ dữ liệu, + test), `app/api/rooms/[code]/advance/route.ts`, `components/room/use-room.ts`, migration bật Realtime cho các bảng (publication `supabase_realtime`).
- Sửa: tài liệu kiến trúc (`docs/system-architecture.md`: mục Realtime).

## Các bước
1. Hàm thuần `nextRoomState(room, players, answers, now)` có test đầy đủ (đủ trả lời, quá hạn, mất kết nối, kết thúc).
2. API `advance`: dùng so sánh-và-đặt (ví dụ `update ... where current_question = k`) để hai máy gọi cùng lúc không nhảy hai câu.
3. Bật Realtime cho các bảng và kiểm tra RLS đúng (người ngoài phòng không nhận được).
4. `useRoom`: đăng ký, hợp nhất sự kiện, tiến câu khi hết giờ, presence.
5. Thử với hai trình duyệt thật ở hai tài khoản ẩn danh, cố ý ngắt mạng một bên.

## Danh sách việc
- [ ] `room-state` + test
- [ ] API `advance` idempotent
- [ ] Bật Realtime + kiểm RLS
- [ ] `useRoom` + presence
- [ ] Thử thủ công hai trình duyệt, rớt mạng

## Tiêu chí hoàn thành
Hai người chơi trọn 10 câu, cùng thấy câu và đồng hồ; một bên rớt mạng thì ván kết thúc đúng quy tắc; hai máy cùng gọi "tiến câu" không làm nhảy câu.

## Rủi ro
- **Giới hạn Realtime của gói Free (đã đối chiếu với tài liệu Supabase, 2026-10-05):** 200 kết nối đồng thời, 100 tin nhắn/giây, 100 lượt vào kênh/giây, 100 kênh/kết nối, presence 20 tin/giây, quota 2 triệu tin nhắn/tháng (Free không tính thêm phí, vượt thì bị giới hạn). Ước lượng thô của tôi (chưa đo): một ván 1v1 mất khoảng 100–150 tin nhắn (Postgres Changes nhân theo số người nghe, cộng presence), tức khoảng 13.000+ ván/tháng; 200 kết nối ≈ **tối đa khoảng 100 ván cùng lúc** nếu mỗi người chỉ có một kết nối. Để giữ số này: chỉ mở kết nối Realtime khi đang ở trong phòng và đóng ngay khi rời, tránh để kết nối mở ở các trang khác.
- Số phòng chơi cùng lúc thực tế của app hiện rất nhỏ nên giới hạn này không phải nút thắt; theo dõi trong Supabase Dashboard (Realtime) sau khi mở cho nhiều người.
- Độ trễ Postgres Changes có thể cao hơn Broadcast (tài liệu Supabase cũng ghi Postgres Changes kém co giãn hơn Broadcast khi nhiều người nghe); nếu thấy lag thì chuyển sự kiện nóng sang Broadcast do server phát.
- Lệch đồng hồ giữa hai máy làm đếm ngược không khớp: dùng thời điểm server trả về và hiển thị phần còn lại tính từ đó.

## Bảo mật
Người ngoài phòng không subscribe được (RLS). Không phát đáp án đúng trong bất kỳ sự kiện nào trước khi câu kết thúc.

## Bước tiếp theo
Giai đoạn 4 (giao diện).

## Câu hỏi còn mở
- Đếm ngược 3 giây giữa các câu là đủ? Cần thử cảm giác thật.
- Có hiện đáp án đúng ngay sau mỗi câu cho cả hai không? Đề xuất: có (học được thêm).
