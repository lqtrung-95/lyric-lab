# Linh vật đồng hành (Pet) — bản thử nhỏ

Trạng thái: ĐÃ DUYỆT (2026-10-29). Bước 1 (logic, test, repo, migration) xong; chờ duyệt để sang bước 2. Mục tiêu: thêm lý do quay lại mỗi ngày + cảm giác sở hữu, KHÔNG thêm game mới. Bản thử chỉ 1 pet, 3 giai đoạn, nối vào XP/chuỗi ngày có sẵn. Xem rồi mới quyết định mở rộng.

## Nguyên tắc
- Không đếm XP hai lần: "thức ăn" của pet = XP đã có trong sổ cái (`lib/game`, suy ra từ bảng sự kiện). Pet chỉ đọc, không ghi XP.
- Tiến hóa dựa trên tổng XP + chuỗi ngày (đã có), không phạt nặng: pet không chết, chỉ "ngủ" khi bỏ vài ngày (tôn trọng chế độ bù chuỗi `streak-freeze`).
- Phần thưởng chỉ là mở khóa nhìn (hình dạng, phụ kiện), không pay-to-win, không ngẫu nhiên kiểu cờ bạc.
- Hình là SVG tự vẽ như sprite cảnh/vụ án hiện có. Không đụng giao diện chung (bài học từ lần restyle trước: giữ nhỏ).

## Bản thử (MVP)
1. Nhận nuôi: chọn 1 trong 5 loài (rồng con, mèo, cún, gấu trúc, cú), đặt tên. Lưu 1 lần.
2. Ba giai đoạn: Trứng/con non → thiếu niên → trưởng thành. Ngưỡng theo tổng XP (đề xuất 0 / 300 / 1500), xem lại sau khi so với đường cong cấp `levels.ts`.
3. Trạng thái trong ngày: "đói / no / vui" theo tiến độ mục tiêu ngày (`daily-goal`). Đạt mục tiêu = pet no + câu nói ngắn (tiếng Trung + nghĩa Việt, từ bộ từ đã học).
4. Thẻ ở trang chủ (cạnh vòng mục tiêu ngày) bấm vào xem pet; có tiếng thưởng khi tiến hóa (dùng `reward-sound`).
5. Phụ kiện: 3 món mở khóa bằng mốc có sẵn (huy hiệu, mốc chuỗi `milestones`). Chỉ hiển thị.

Ngoài phạm vi: bạn bè ghé thăm, trang trí nhà, nhiều pet, thông báo đẩy, gắn pet với bài hát cụ thể, cửa hàng.

## Dữ liệu
- Bảng mới `user_pet` (user_id PK, species, name, adopted_at, updated_at; phụ kiện tính từ chuỗi dài nhất nên không lưu), RLS chủ sở hữu, giống `user_explore_state`. Migration người dùng chạy tay.
- Chưa đăng nhập/chưa chạy migration: lưu localStorage, đồng bộ khi có tài khoản (mẫu `explore-state-repo.ts`).
- Giai đoạn, trạng thái ngày KHÔNG lưu: tính từ XP + `daily-goal` mỗi lần mở.

## Phần code (dự kiến)
- `lib/pet/pet-logic.ts` (+ test): ngưỡng giai đoạn, trạng thái đói/no/ngủ, mở khóa phụ kiện. TS thuần.
- `lib/pet/pet-repo.ts`: đọc/ghi Supabase + localStorage.
- `components/pet/pet-sprite.tsx`, `adopt-pet.tsx`, `pet-card.tsx`; gắn vào `components/home/`.
- Cập nhật 4 tài liệu bàn giao + migration + `docs/operations-runbook.md`.

## Giai đoạn
1. Logic + test + repo (không UI). Dừng.
2. Sprite SVG: một loài × 3 giai đoạn trước, duyệt rồi mới vẽ 4 loài còn lại + màn nhận nuôi + thẻ trang chủ. Dừng, bạn xem trên 3210.
3. Phụ kiện + tiếng + tài liệu. Chỉ làm nếu bản 2 được.

## Cách đo "có đáng không"
Chưa có dữ liệu thật, nên dùng chỉ số đã có: tỉ lệ người dùng hoàn thành mục tiêu ngày và số ngày hoạt động liên tiếp, so trước/sau khi bật pet (nếu `lib/analytics` đủ sự kiện).

## Rủi ro
- Hình pet xấu/thiếu hồn: làm sprite thử 1 loài trước, bạn duyệt rồi mới vẽ thêm.
- Pet "ngủ" gây áp lực: giữ giọng nhẹ, không dùng chữ "chết/đói khổ", có bù chuỗi.
- Thêm một thẻ vào trang chủ vốn đã đông: đặt thay vì thêm, hoặc gộp vào cạnh vòng mục tiêu.

## Đã chốt
- Loài: rồng, mèo, cún, gấu trúc, cú (con vật dễ thương nào cũng được).
- Ngưỡng 300/1500 XP: ước lượng 15 phút/ngày ≈ 40–60 XP → giai đoạn 2 sau ~1 tuần, giai đoạn 3 sau ~1 tháng.
- Pet "thích" bài hát: để sau bản thử.
