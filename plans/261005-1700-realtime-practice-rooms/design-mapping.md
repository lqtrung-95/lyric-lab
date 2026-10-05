# Đối chiếu thiết kế Stitch với kế hoạch

Nguồn: 4 thư mục mới trong `design/` (mỗi thư mục có `screen.png` và `code.html`) và `design/warm_literary_paper/DESIGN.md`.

## Các màn

| Thiết kế | Màn trong app | Giai đoạn |
|---|---|---|
| Sảnh thi đấu 1v1 (desktop) | `/room` (hub) | 1 phần: thẻ **Mời bạn** + **Nhập mã**; 2: Ghép ngẫu nhiên, Lời mời, Bạn luyện cùng gần đây |
| Phòng chờ / tạo phòng (điện thoại) | `/room/[code]` trạng thái `waiting` | 1 |
| Màn chơi (desktop) | `/room/[code]` trạng thái `playing` | 1 |
| Màn chơi (điện thoại) | cùng route, responsive | 1 |

## Khớp với kế hoạch, không cần sửa
Mã 6 số + sao chép mã/link; chọn bài và "Đổi bài" / đối bài ngẫu nhiên; chế độ Điền lời 10 câu; hai ô người chơi và nút sẵn sàng/Bắt đầu; đồng hồ đếm ngược của phòng chờ; điểm hai bên hiện trực tiếp, đáp án đã khóa; nút Bỏ cuộc/Rời phòng; kết nối theo tài khoản (nút "Đăng nhập Google" để lưu lịch sử).

## Đã chỉnh kế hoạch theo thiết kế
- **Thưởng tốc độ 0–30** mỗi câu đúng (kế hoạch cũ: 0–10), người thắng xác định theo số câu đúng trước, điểm sau (phase-02).
- Phòng chờ hết hạn sau **10 phút** (kế hoạch cũ: 30).
- Nút **Gửi Zalo / Link** (Web Share API), thêm vào phase-01 và phase-04.
- Nội dung mỗi câu: pinyin có ô trống, nghĩa tiếng Việt, gợi ý Hán-Việt, đáp án có pinyin + Hán-Việt + nghĩa, nút nghe đoạn, ghi chú ngữ pháp (phase-02, phase-04).
- Thêm mục "Luyện tập 1v1" vào menu chính (phase-04).

## Thuộc giai đoạn 2 của dự án (ngoài phạm vi giai đoạn 1)
Ghép ngẫu nhiên (hàng đợi + "bóng ma"); Lời mời đang chờ (Chấp nhận/Từ chối); Bạn luyện cùng gần đây, thành tích đối đầu ("Thắng 8–6"), Lịch sử đấu, "Mời tái đấu"/"Nhắn tin"; phản ứng emoji sau ván; "Chuỗi đúng" (combo) hiện trong ván; huy hiệu "Đã kết bạn".

## Cần bỏ hoặc sửa khi dựng
- Thương hiệu "Lyric Lab" và footer trong thiết kế: dùng SongHanzi và khung hiện có.
- Số "142 người đang ghép đôi": chỉ hiện số thật từ presence, ẩn khi quá ít (hiện app chỉ có vài người, số giả sẽ làm mất lòng tin).
- Nút "Giả lập bạn vào" trong thiết kế chỉ là chỗ thử của bản vẽ, không làm.
- Chip "Phòng trực tiếp" và "HSK 3 · 1.420 đ" trên thẻ người chơi: "đ" (điểm HSK cá nhân) chưa tồn tại trong app; chỉ hiện cấp HSK, bỏ điểm tích lũy trừ khi quyết định làm hệ thống điểm riêng.

## Các quyết định đã chốt (2026-10-05)
1. **Quy tắc thắng:** số câu đúng trước, điểm (có thưởng tốc độ) sau. Đồng ý.
2. **Nghe đoạn trong câu hỏi:** đưa vào **giai đoạn 1**, với khung video **luôn hiển thị** theo điều khoản YouTube (dùng `SnippetPlayer`, khung nhỏ nổi ở góc/đáy, không phải thanh chỉ có âm thanh). Màn chơi vì vậy có khung video nhỏ mà bản vẽ không có. Mỗi câu nghe tối đa 2 lần (nhãn "Còn N lượt nghe"). Mỗi người nghe trên máy của mình nên không cần đồng bộ giữa hai máy.
3. **Hán-Việt và ghi chú ngữ pháp:** giữ cả hai ở giai đoạn 1 (ghi chú ngữ pháp chỉ hiện khi dòng có mục ngữ pháp trong phân tích).
