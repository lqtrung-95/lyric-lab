# Giai đoạn 4: Phát hành 3 kho (cỡ M)

## Việc phải có trước khi nộp
- Trang chính sách riêng tư công khai trên songhanzi.com (dữ liệu thu thập: mã video, dòng phụ đề gửi để chú giải, thẻ đã lưu, phiên đăng nhập; không bán dữ liệu; cách xóa tài khoản).
- Mô tả "mục đích đơn nhất" (học tiếng Trung trên YouTube) và lý do từng quyền (`youtube.com`, `songhanzi.com`, `storage`).
- Biểu tượng (16/32/48/128), 3-5 ảnh chụp 1280x800, đoạn mô tả tiếng Việt và tiếng Anh.
- Kiểm tra điều khoản YouTube về tiện ích sửa giao diện/đọc dữ liệu player (đọc lại ở thời điểm nộp).

## Từng kho
- Chrome Web Store: tài khoản nhà phát triển (~5 USD một lần), khai báo quyền riêng tư (data usage), duyệt vài ngày. Gói: `wxt zip -b chrome`.
- Edge Add-ons: miễn phí; có thể dùng gói Chrome.
- Mozilla AMO: miễn phí; gói `wxt zip -b firefox` + nộp kèm mã nguồn; cần `browser_specific_settings.gecko.id`.
- Cập nhật: số phiên bản tăng theo từng lần; ghi quy trình vào `operations-runbook`.

## Thành công khi
Cả ba kho duyệt xong và cài được từ cửa hàng; trang chủ web có nút "Cài tiện ích" (nhận biết trình duyệt, dẫn tới kho tương ứng); có cách báo lỗi (liên kết góp ý đã có).

## Theo dõi sau phát hành
Đếm lượt cài (kho), số tài khoản đăng nhập từ tiện ích, tỉ lệ lấy phụ đề thành công (ghi ẩn danh từng nguồn: kho/player/server), lỗi của người dùng. Kiểm tra định kỳ hằng tuần trên 10 video mẫu để phát hiện YouTube đổi trang.

## Rủi ro
Bị từ chối vì quyền/mô tả: nộp bản có quyền hẹp nhất; Firefox có thể chậm hơn vì duyệt thủ công mã nguồn.
