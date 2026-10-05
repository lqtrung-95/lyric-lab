# Giai đoạn 4: Giao diện phòng

## Context
- [plan.md](plan.md). Quy tắc UI: `CLAUDE.md` (phần tử bấm là `<button>`/`<a>`, vùng bấm ≥ 44px, accessibility WCAG 2.2 AA), `docs/design-brief.md`, thư mục `design/`.
- Mẫu: `components/practice/*` (khung `practice-frame.tsx`, `practice-summary.tsx`), `components/library/song-card.tsx`, `components/ui/*`.
- Tham khảo luồng app khác: hai thẻ "Tìm bạn luyện cùng" / "Mời bạn", hộp "Phòng luyện tập trực tuyến" có tab Nhập mã / Tạo phòng.

## Thiết kế Stitch (nguồn chính, thư mục `design/`)
- `s_nh_thi_u_1v1_t_o_ch_ph_ng`: điện thoại, phòng chờ (tab Tạo phòng mới / Vào bằng mã, mã 6 số, nút Sao chép mã + Gửi Zalo/Link, thẻ bài + "Đổi bài", chế độ Cloze 10 câu, hai ô người chơi, Bắt đầu thi đấu).
- `desktop_ph_ng_luy_n_t_p_thi_u_1v1_s_nh_ch`: desktop, sảnh Thi đấu (Mời bạn luyện cùng, Ghép ngẫu nhiên, Nhập mã, Lời mời, Bạn luyện cùng gần đây, quy tắc điểm).
- `desktop_thi_u_1v1_th_i_gian_th_c_in_game_battle` và `thi_u_1v1_th_i_gian_th_c_i_kh_ng_tr_c_ti_p`: màn chơi desktop và điện thoại.
- Đối chiếu chi tiết và phần ngoài giai đoạn 1: [design-mapping.md](design-mapping.md). Thiết kế vẽ tên thương hiệu cũ ("Lyric Lab") và menu riêng; dùng thương hiệu và khung điều hướng hiện có của app (SongHanzi).

## Tổng quan
Ưu tiên trung bình. Chưa làm. Các màn: hub Thi đấu, hộp tạo/nhập mã, phòng chờ, màn chơi, kết quả.

## Điểm then chốt
- **Giai đoạn 1 chỉ có thẻ "Mời bạn"**; thẻ "Tìm bạn luyện cùng" và danh sách bạn gần đây để dành cho giai đoạn 2 (có thể hiện thẻ "Sắp có", hoặc ẩn).
- Màn chơi chỉ hiển thị khi phòng `playing`; mọi trạng thái đến từ `useRoom`.

## Yêu cầu
- Tạo phòng: chọn bài (tìm trong thư viện/bài đã phân tích) hoặc "Ngẫu nhiên"; hiện mã 6 số, nút sao chép mã và link mời.
- Vào phòng: nhập mã hoặc dán link; người chưa có phiên tự được tạo phiên ẩn danh; chưa có tên thì hỏi tên hiển thị trước (`validateNickname`).
- Phòng chờ: thấy hai người, nút sẵn sàng, chủ phòng có nút Bắt đầu khi đủ điều kiện, nút rời phòng.
- Màn chơi: nút nghe đoạn của câu (kèm nhãn "Còn N lượt nghe"), đồng hồ 15 giây, ô lời có chỗ trống, 4 đáp án, gợi ý (bản dịch), trạng thái "đối thủ đã trả lời", đúng/sai sau mỗi câu kèm đáp án đúng.
- Kết quả: điểm hai bên, người thắng, tốc độ từng câu; nút Chơi lại (tạo phòng mới cùng bài) và Về trang chủ.
- Truy cập: phím 1–4 chọn đáp án như game Điền lời hiện có; trình đọc màn hình báo thời gian còn lại ở các mốc (không đọc từng giây).

## Player YouTube trong màn chơi (theo điều khoản YouTube)
- Câu hỏi có nghe đoạn nên màn chơi nhúng player qua `SnippetPlayer` (`components/player/snippet-player.tsx`, dùng `useYouTubePlayer`). Player **luôn hiển thị** khi phát: khung nhỏ nổi ở góc dưới phải trên desktop (356px rộng) và thanh đáy trên điện thoại; không có chế độ chỉ âm thanh và không ẩn video. Khung tự ẩn sau khi đoạn phát xong (hành vi hiện có), nút "Nghe lại" bấm lại thì hiện lại.
- `SnippetPlayer` là panel cố định ở đáy/góc (`fixed`, z-40) nên có thể che các đáp án trên điện thoại: màn chơi phải chừa khoảng trống phía dưới khi panel đang hiện, và kiểm tra bằng e2e trên màn hẹp.
- Đếm lượt nghe ở client; đoạn bắt đầu/kết thúc lấy từ câu hỏi (`clipStart`/`clipEnd`). Khi video không phát được (chủ video tắt nhúng, lỗi mạng) hiện thông báo và cho phép trả lời không cần nghe; bài đã phân tích đều đã qua kiểm tra nhúng được lúc phân tích (phase-02), nên đây chỉ là trường hợp hiếm.
- Hai người nghe độc lập trên máy của mình, không đồng bộ giữa hai máy.

## Kiến trúc
- Route: `app/(main)/room/page.tsx` (hub), `app/(main)/room/[code]/page.tsx` (phòng), đều `noindex`. Link mời dạng `/room/123456`.
- Thành phần: `room-hub.tsx`, `room-clip-button.tsx` (nghe đoạn + đếm lượt, dùng `SnippetPlayer`), `create-room-dialog.tsx`, `join-room-form.tsx`, `room-lobby.tsx`, `room-play.tsx`, `room-result.tsx`, `use-room.ts` (giai đoạn 3).
- Điều hướng: thêm mục "Luyện tập 1v1" vào menu chính (`components/layout/nav-links.ts`, `mobile-tab-bar.tsx`) như thiết kế (Trang chủ, Luyện tập 1v1, Ôn tập, Thư viện); tab điện thoại có sẵn 3 mục nên cần xem lại chỗ cho mục thứ 4.

## Các file liên quan
- Tạo: các file trên trong `components/room/` và `app/(main)/room/`.
- Sửa: thanh điều hướng (`components/layout/*`), `docs/design-brief.md` (thêm màn mới).

## Các bước
1. Dựng trang hub và hộp tạo/nhập mã (chưa có dữ liệu thật, dùng API giai đoạn 1).
2. Phòng chờ nối với `useRoom`.
3. Màn chơi: tái dùng kiểu ô trống/đáp án của game Điền lời; khác biệt chính là dữ liệu đến từ server.
4. Màn kết quả và Chơi lại.
5. Responsive (điện thoại là ưu tiên), trạng thái lỗi/hết hạn/phòng đầy, kiểm tra axe và vùng bấm.

## Danh sách việc
- [x] Hub + tạo/nhập mã
- [x] Phòng chờ
- [x] Màn chơi
- [x] Kết quả + Chơi lại
- [x] Responsive + axe + trạng thái lỗi

## Tiêu chí hoàn thành
Hai người trên hai thiết bị đi hết luồng từ tạo phòng đến kết quả mà không cần hướng dẫn; đạt kiểm tra axe; dùng được trên điện thoại.

## Rủi ro
- Thiết kế dùng token màu/kiểu chữ "Warm Literary Paper" (`design/warm_literary_paper/DESIGN.md`); cần khớp với token Tailwind hiện có của app, không thêm hệ màu mới.
- Màn hình điện thoại hẹp: đồng hồ + 4 đáp án + gợi ý + khung video nhỏ phải gọn, không chồng lên nhau.
- Autoplay của trình duyệt: phát đoạn phải bắt đầu từ lần bấm của người dùng (đã đúng với thiết kế: có nút nghe), không tự phát khi câu mở.

## Bảo mật
Không in mã phòng ở nơi công khai ngoài link mời; link mời không chứa thông tin cá nhân.

## Bước tiếp theo
Giai đoạn 5.

## Câu hỏi còn mở
- Thiết kế đã có; câu hỏi còn lại là các chỗ lệch giữa thiết kế và kế hoạch, liệt kê ở [design-mapping.md](design-mapping.md).
