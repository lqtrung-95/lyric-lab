# Giai đoạn 4: Trò chơi mới (cỡ M)

Mỗi trò dùng dữ liệu sẵn có, nhận danh sách từ/câu đầu vào để dùng được cả trong lộ trình (phase 2) lẫn chế độ Ôn tập tự do (`/review/*`), theo cùng khuôn `PracticeFrame` + `ModeTabs`.

1. **Xếp từ thành câu**: lấy câu thật từ chỉ mục (phase 1), tách thành 4-8 mảnh theo token, người học chạm/kéo xếp đúng thứ tự (có gợi ý nghĩa Việt). Chấm theo vị trí đúng; có nghe câu sau khi xong.
2. **Đoán từ qua Hán Việt**: hiện chữ Hán, 4 lựa chọn từ Việt (một là âm Hán Việt đúng, nhưng chỉ dùng từ "Hán Việt giống nghĩa" trong danh sách đã lọc tay để tránh dạy sai: ví dụ 学生/học sinh, không dùng 工作/công tác nếu nghĩa lệch). Kết thúc hiện "bạn đã đoán được x/y nhờ Hán Việt".
3. **Nghe và chép từ** (chép pinyin hoặc chọn chữ Hán sau khi nghe): tái dùng `PinyinGame` + giọng đọc.
4. **Ghép câu với hình tình huống** (để sau, cần minh họa).

## Bước làm
1. Xếp từ thành câu (logic thuần + test, giao diện kéo/chạm, a11y bằng bàn phím).
2. Danh sách "Hán Việt giống nghĩa" (script gợi ý + duyệt tay ~300 từ HSK 1-3) rồi trò đoán.
3. Nghe và chép từ.
4. Gắn các trò vào `ModeTabs` và vào bước 3 của chặng lộ trình; điểm tính mục tiêu ngày; mode mới trong `practice_scores` (cùng migration của phase 2).
5. E2E từng trò + a11y.

## Tiêu chí xong
Ba trò chơi được từ trang Ôn tập và từ chặng lộ trình, có điểm, mục tiêu ngày tính đúng, không lỗi trên điện thoại (vùng bấm ≥ 44 px).

## Rủi ro
Kéo thả khó trên điện thoại: dùng chạm để chọn từng mảnh thay vì kéo; danh sách Hán Việt lệch nghĩa: chỉ dùng danh sách đã duyệt.
