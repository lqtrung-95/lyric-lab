# Revamp giao diện theo thiết kế Stitch

Trạng thái: CHỜ DUYỆT, chưa code. Ngày: 2026-10-20. Nguồn thiết kế: dự án Stitch `projects/5421078878758074124` ("SongHanzi UI Flow App", 14 màn hình đã sinh) + hệ thống thiết kế "Cozy Fantasy Hanzi Quest" (asset `783db6f8e90a426a9a07fa33b64d6fe0`). Yêu cầu: [PRD-v2](../../docs/PRD-v2.md), [design-brief-v2](../../docs/design-brief-v2.md), [luồng](../../docs/app-flows-for-stitch.md). Quyết định chủ sản phẩm: giữ tên và đường dẫn cũ, chưa tiền ảo, chưa linh vật, giải đấu tuần để sau, **dựng giao diện một lần**.

## Hiện trạng thiết kế (đã xem)
- Phong cách Stitch đề xuất: **"Cozy Fantasy RPG"**: nền giấy da ấm (`#FEF9ED`), cam hổ phách `#E67E22` (chính), xanh rêu `#4E7D42` (đúng/hoàn thành), xanh dương `#2980B9` (âm thanh/phát âm), viền nâu đậm `#4A2E1B` 2,5-3,5 px, **nút 3D dày** (đáy 4-6 px, nhấn xuống 4 px), font **Plus Jakarta Sans** (có dấu tiếng Việt) + **Noto Sans** cho chữ Hán, bo góc 8/16/24 px.
- 14 màn đã có: Tân thủ nhập môn; Hôm nay (mobile); Nghe & luyện hát (mobile); Tổng kết/phần thưởng (desktop); Lộ trình HSK (desktop + bản đồ mobile); Thư viện & khám phá (desktop); Ôn thẻ SRS & mini game (desktop + mobile); Luyện phát âm AI & thanh điệu (desktop); Đấu trường 1v1 (desktop); Hồ sơ & huy hiệu (desktop); bản "Game-Style UI" tổng.
- **Chưa có:** tablet (toàn bộ), dark mode, phần lớn màn mobile (thi đấu, thư viện, hồ sơ, phát âm, tổng kết), video 3 tab, thêm video, đọc to chấm điểm, chặng học 3 bước, thanh toán/cài đặt/đăng nhập, chat, trạng thái rỗng/lỗi/hết lượt AI.

## Vấn đề cần giải quyết trước khi dựng
1. **Hướng thẩm mỹ:** brief yêu cầu "hiện đại, trẻ trung, kiểu game"; Stitch ra hướng **fantasy/RPG ấm áp có nhiều chữ nghĩa hóa** (tên chặng "Cổng Rừng", "Phù thủy ngôn ngữ AI"). Cần chốt giữ hướng này (và giọng chữ RPG) hay chỉnh về hiện đại hơn.
2. **Tương phản (WCAG AA):** chữ trắng trên cam `#E67E22` chỉ đạt ~3:1, không đạt 4,5:1 cho chữ thường. Thiết kế phải dùng chữ nâu đậm trên cam hoặc cam đậm hơn (`#944A00` đạt) cho nút.
3. **Khóa chặng:** mockup hiển thị chặng 4-5 bị khóa (🔒) trái với quyết định "không khóa cứng". Cần chốt.
4. **Tính năng chưa có backend:** XP, cấp, nhiệm vụ ngày, đóng băng chuỗi, huy hiệu, "Online: 412 dũng giả", Phù thủy AI (chat). Chỉ hiện ở giao diện khi dữ liệu thật tồn tại; không dựng số giả.
5. **Lỗi trình bày trong mockup cần sửa khi dựng:** chữ Hán 离开 bị xếp dọc đè lên khu thẻ từ (màn nghe mobile), dòng lời bị bẻ xấu ở chữ Hán lớn, chữ nền mờ che nút.

## Chiến lược dựng ("một lần", nhưng theo lát cắt)
Giữ nguyên đường dẫn và cấu trúc thư mục. Vì toàn bộ giao diện dùng chung token Tailwind (`bg-surface-*`, `text-on-*`, `primary`…), **đổi giá trị token và thành phần nền trước sẽ làm đổi diện mạo cả ứng dụng cùng lúc**, rồi mới sửa bố cục từng màn. Nhờ vậy không có giai đoạn "nửa cũ nửa mới" kéo dài và không cần cờ tính năng.

| # | Giai đoạn | Cỡ | Nội dung |
|---|---|---|---|
| 0 | Chốt thiết kế | S | Quyết định 1-4 ở trên; sinh thêm màn còn thiếu trong Stitch (mobile/tablet/dark/trạng thái); xuất token |
| 1 | Token và thành phần nền | M | Màu sáng/tối, font, bo góc, bóng 3D; nút/thẻ/chip/thanh tiến độ/ô nhập/huy hiệu/toast/khung trạng thái; Plus Jakarta Sans + Noto Sans SC; kiểm tra AA toàn bộ |
| 2 | Khung ứng dụng | M | Thanh HUD trên (chuỗi, thẻ cần ôn, ảnh đại diện), tab bar 5 mục (mobile), thanh dọc (tablet), thanh bên (desktop); giữ đường dẫn |
| 3 | Hôm nay + người mới | M | Trang chủ, thiết lập, chọn bài mẫu, màn thưởng (chỉ phần có dữ liệu thật) |
| 4 | Nghe bài hát/video | L | Ba bố cục (mobile sheet, tablet 2 cột, desktop 3 vùng), lời, thẻ từ, tra từ, điều khiển; sửa lỗi bẻ chữ Hán |
| 5 | Học: lộ trình + chặng | M | Bản đồ, chặng 3 bước, kết quả |
| 6 | Ôn & Nói | M | Ôn thẻ, trò chơi, bảng xếp hạng, phát âm (7 công cụ) |
| 7 | Chơi + thư viện + hồ sơ + cài đặt | L | Thi đấu, thử thách, thư viện, hồ sơ, cài đặt, chat, góp ý |
| 8 | Trang công khai | M | Giới thiệu, công cụ miễn phí (SEO giữ nguyên) |
| 9 | Hệ thống game thật (kế hoạch riêng) | L | XP, cấp, huy hiệu, nhiệm vụ, đóng băng chuỗi: backend + migration + chống gian lận; **giao diện giai đoạn 3-7 chỉ hiện các phần này khi giai đoạn 9 xong** |

Thứ tự đề xuất: 0 → 1 → 2 → 4 (màn quan trọng nhất, rủi ro cao) → 3 → 5 → 6 → 7 → 8; giai đoạn 9 song song từ sau giai đoạn 2.

## Kiểm thử và chất lượng
Mỗi giai đoạn: `tsc`, `eslint`, vitest, e2e hiện có (sửa chỗ chọn phần tử bị đổi), **axe cho mọi trang chính ở sáng + tối**, ảnh chụp 390/820/1440, kiểm tra không tràn ngang, hiệu năng (font, ảnh). Cập nhật 4 tài liệu bàn giao. Kiểm thử khả dụng 5-8 người trước khi công bố (chưa có danh sách người).

## Rủi ro
- Đổi token toàn cục làm hỏng chỗ đang dùng token theo cách riêng (màu cứng, ảnh thẻ chia sẻ vẽ bằng canvas với màu cũ): rà soát và đổi cùng đợt.
- Font mới (Plus Jakarta Sans, Noto Sans SC) ảnh hưởng tải trang và layout chữ Hán trong thẻ chia sẻ canvas.
- Thiết kế mới đòi dữ liệu chưa có (XP, nhiệm vụ, trực tuyến): không dựng số giả.
- Khối lượng lớn: cần dừng sau mỗi giai đoạn để duyệt trên bản chạy thật.

## Câu hỏi cần chốt (người dùng)
1. Giữ hướng "Cozy Fantasy RPG" của Stitch (kể cả giọng chữ RPG) hay muốn hiện đại hơn, bớt fantasy?
2. Chặng lộ trình: **không khóa** (như đã quyết) hay có khóa mềm?
3. Dựng backend game (XP, nhiệm vụ, huy hiệu) **trước** để giao diện có dữ liệu thật, hay làm giao diện trước và ẩn các phần chưa có?
4. Có muốn tôi sinh thêm các màn còn thiếu (mobile, tablet, dark, trạng thái) trong Stitch ngay bây giờ?
