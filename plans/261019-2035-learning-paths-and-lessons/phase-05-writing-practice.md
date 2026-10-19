# Giai đoạn 5: Tập viết chữ Hán (cỡ M)

## Mục tiêu
Học thứ tự nét và tập viết từng chữ bằng ngón tay hoặc chuột, có chấm nét; bắt đầu với chữ HSK 1-3.

## Cổng đầu tiên: giấy phép dữ liệu
Thư viện Hanzi Writer là MIT nhưng dữ liệu nét (Make Me a Hanzi) theo Arphic Public License. Trước khi làm: đọc `ARPHICPL.TXT`, xác nhận dùng và phân phối trong sản phẩm thương mại được, ghi công đúng chỗ (cùng cách ghi công CC-CEDICT). Không đạt → chọn nguồn dữ liệu nét khác hoặc dừng phase này.

## Thiết kế
- Dữ liệu nét tải theo từng chữ khi cần (không đóng gói tất cả), cache trình duyệt; dùng ở trang `/hoc/viet/[chu]` và như một bước trong chặng HSK (tùy chọn).
- Chế độ: xem nét (hoạt họa), vẽ theo gợi ý, vẽ tự do (chấm đúng/sai nét), có nút bỏ qua.
- Gắn với từ: mỗi từ HSK 1-3 có nút "Tập viết" cho từng chữ trong từ.
- Hoạt động ghi nhận vào mục tiêu ngày (mode `writing`).

## Các bước
1. Kiểm tra giấy phép + thử nhanh Hanzi Writer trên điện thoại (canvas/SVG, cuộn khi vẽ).
2. Thành phần `HanziPractice` (client) + trạng thái hoàn thành + a11y (thay thế mô tả cho người dùng không vẽ được).
3. Tích hợp vào chặng HSK và trang từ.
4. E2E (giả lập vẽ) + tài liệu + mục ghi công.

## Tiêu chí xong
Vẽ được 100 chữ HSK 1 trên điện thoại và máy tính, điểm nét hợp lý, nhận ra khi vẽ sai thứ tự nét.

## Rủi ro
Cuộn trang khi vẽ trên điện thoại (cần `touch-action`); dữ liệu thiếu chữ hiếm; giấy phép không phù hợp → dừng.
