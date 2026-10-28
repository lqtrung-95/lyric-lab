# Game nấu ăn 3D gọi món bằng tiếng Trung (tên tạm: "Quán Hán Ngữ")

Trạng thái: TẠM HOÃN, mã bản thử đã gỡ khỏi main (còn ở commit 9a6fb2f) (backlog, 2026-10-28; bản thử giai đoạn 0 đã làm xong và chạy được ở /review/kitchen, chưa có trong menu; muốn làm tiếp thì bắt đầu ở giai đoạn 1). Trước đó: ĐÃ DUYỆT (three/r3f, Hà Nội trước, có ngân sách mô hình AI). Giai đoạn 0 đã làm xong bản thử; chờ đo trên điện thoại rồi sang giai đoạn 1. Cảm hứng từ Wok Rush (saymei.app); KHÔNG dùng tên, hình, bố cục của họ.

## Ý tưởng
Người chơi làm đầu bếp kiêm phục vụ. Khách gọi món bằng tiếng Trung (nghe + đọc, bật/tắt pinyin và nghĩa), người chơi đi tới đúng bếp, nấu, mang ra bàn. Đúng và nhanh thì có tiền và sao.
Điểm độc đáo (viral): bản đồ Việt Nam, nơi khách là du khách Trung Quốc gọi phở, bánh mì, cà phê trứng bằng tiếng Trung. Hợp người Việt làm du lịch/dịch vụ. Cộng bản đồ Trung Quốc (Bắc Kinh, Thượng Hải, Quảng Châu, Thành Đô).

## Quyết định kỹ thuật đề xuất
- 3D: `three` + `@react-three/fiber` (+ `drei` nếu cần). Camera chéo cố định, di chuyển WASD/chạm-để-đi. Cần duyệt thêm 2-3 thư viện.
- Hình: mô hình low-poly CC0 (Kenney Food/Furniture Kit, Quaternius) + vật dụng tự dựng bằng hình khối; nhân vật tự dựng. Không sao chép hình của Wok Rush.
- Logic game là TS thuần, có test (đơn hàng, công thức, chấm sao); cảnh 3D chỉ hiển thị.
- Nội dung: câu gọi món tự viết (số, lượng từ, món), pinyin từ từ điển, nghĩa tiếng Việt; PHẢI có người bản ngữ rà câu tiếng Trung trước khi ra mắt.
- Giọng đọc: dùng TTS có sẵn (`playChinese`, có cache); không lưu audio YouTube.
- Điểm: thêm chế độ điểm `kitchen` (migration), tính XP, chuỗi ngày, bảng xếp hạng.

## Các giai đoạn (mỗi giai đoạn dừng chờ duyệt)
0. Thử nghiệm (spike): một quán, một đầu bếp đi được, một bếp, một khách gọi món; đo kích thước gói và FPS trên điện thoại. Cổng quyết định: 3D có chạy mượt không, hay lùi về 2D.
1. Lõi game (TS thuần + test): sinh đơn, công thức nhiều bước, bếp, hẹn giờ, chấm sao.
2. Nội dung hai bản đồ đầu: "Hà Nội: bữa sáng" (phở, cà phê trứng, bánh mì) và "Bắc Kinh: bữa sáng" (bánh bao, sữa đậu nành, bánh kếp).
3. Học tập: bật/tắt Pinyin và Nghĩa, nghe lại, sổ công thức, màn tổng kết từ sai (lưu vào thẻ ôn), chế độ chỉ-nghe cho người giỏi.
4. Bản đồ thế giới, mở khóa theo sao, thêm Sài Gòn, Hội An, Thượng Hải, Quảng Châu, Thành Đô; thẻ chia sẻ kết quả.
5. Hoàn thiện: âm thanh, nhạc, điều khiển cảm ứng, hiệu năng, trợ năng, e2e.

## Rủi ro
- Hình ảnh khó đạt mức bản gốc nếu chỉ dùng tài nguyên miễn phí; có thể cần họa sĩ 3D hoặc mô hình tạo bằng AI.
- Hiệu năng 3D trên điện thoại cũ; gói tải lần đầu (mục tiêu dưới ~1 MB nén cho game, tải lười).
- Hạn mức TTS khi nhiều khách nói liên tục (dùng cache, ghi trước các câu cố định).
- Độ chính xác tiếng Trung/văn hóa món ăn (rà bản ngữ).
- Bản quyền: giữ thiết kế, tên và hình riêng.

## Câu hỏi mở
1. Duyệt thêm thư viện three/r3f? 2. Bản đồ đầu tiên: Việt Nam hay Trung Quốc? 3. Có ngân sách cho mô hình 3D thuê/AI không?

## Việc còn lại khi mở lại
- Đo FPS trên điện thoại thật (cổng quyết định 3D hay 2D).
- Giai đoạn 1: lõi game có test (đơn nhiều món, công thức nhiều bước, hẹn giờ, sao); nội dung Hà Nội (phở, cà phê trứng, bánh mì).
- Muốn đẹp ngang Wok Rush: họa sĩ 3D hoặc mô hình AI trả phí (Tripo Pro); gói miễn phí không export được.
