# Design Brief v2 — thiết kế lại SongHanzi

Cập nhật: 2026-10-19 · Thay thế `design-brief.md` (v1, 2026-09-24, giữ làm lịch sử) · Nguồn yêu cầu: [`PRD-v2.md`](PRD-v2.md) (đọc mục 0 trước) · Dành cho designer (người hoặc AI như Stitch/Figma). Dữ liệu mẫu hư cấu dùng lại từ `design-brief.md` mục 6 (bài 夜车); **không dùng lời bài hát thật**.

## 1. Bối cảnh trong một trang

SongHanzi giúp **người Việt học tiếng Trung qua bài hát và video thật**: có lời chạy theo giờ, pinyin, âm Hán Việt, nghĩa Việt; bấm từ để tra, lưu thành thẻ ôn; luyện nghe-chép, luyện nói, thi đấu; và có **lộ trình HSK** dẫn dắt từng chặng. Sản phẩm đã chạy thật nhưng giao diện tích lũy dần theo từng tính năng nên rối: nhiều cửa vào, hai kiểu học song song, trang chủ dày.

**Đợt này thiết kế lại toàn bộ trải nghiệm** để: (1) người mới hiểu và vào học trong ≤ 60 giây; (2) người đang dùng có vòng lặp hằng ngày hấp dẫn và phần thưởng có chiều sâu; (3) nhận diện **hiện đại, trẻ trung, phong cách game**, nhưng nội dung học (chữ Hán, lời bài hát) luôn là trung tâm.

**Quyết định đã chốt:** cả người mới và người dùng lâu; làm lại thương hiệu kiểu game; người mới vào bằng **bài hát/video** (lộ trình giới thiệu sau hoạt động đầu); bố cục **riêng cho mobile, tablet, desktop**; game hóa **mạnh**; chưa có tiếng Anh nhưng phải **sẵn sàng đa ngôn ngữ**. Rất ít người dùng hiện tại nên thiết kế phải qua **kiểm thử với 5-8 người** trước khi dựng.

## 2. Người dùng (rút gọn)

| Persona | Cần gì từ giao diện |
|---|---|
| Linh, sinh viên, HSK3, nghe C-pop mỗi tối | Thấy level từng từ, lưu từ nhanh, cảm giác tiến bộ |
| Minh, nhân viên văn phòng, HSK4, 15-20 phút/ngày trên điện thoại | Phiên ngắn, một tay, nhiệm vụ rõ ràng |
| Trang, mê phim Hoa ngữ, HSK1-2 | Dễ hiểu, không ngợp, vui |
| Hà, người mới hoàn toàn | Biết bắt đầu từ đâu, phát âm đúng, thắng nhỏ liên tục |

Điểm riêng cần **nhìn thấy trên mọi thẻ từ:** âm **Hán Việt** cạnh pinyin (离开 = ly khai).

## 3. Hướng thương hiệu và visual

### 3.1 Cảm giác tổng thể
**"Sân chơi âm nhạc để học tiếng Trung."** Năng động, thân thiện, có thưởng ngay, nhưng không trẻ con và không lòe loẹt. Học bằng âm nhạc là nhân vật chính; game hóa là gia vị khiến người ta quay lại.

Tham chiếu về *cảm giác* (không sao chép): app học ngôn ngữ dạng game (nút to có độ nổi, thưởng sau mỗi bước, nhân vật dẫn dắt), app nhạc hiện đại (bìa lớn, chuyển động mượt). Designer **được đề xuất 2-3 hướng thay thế** (xem mục 11); dưới đây là hướng mặc định.

### 3.2 Hướng mặc định
| Yếu tố | Đề xuất (được phép thay nếu có hướng tốt hơn) |
|---|---|
| Bảng màu | Một **màu thương hiệu chủ đạo** sống động (gợi ý: tím-xanh điện hoặc cam-đỏ ấm; tránh neon gắt) + **màu phụ tương phản** + bộ **màu ngữ nghĩa** cố định: đúng (xanh lá), sai (đỏ), XP (vàng), chuỗi ngày (cam lửa), cảnh báo (hổ phách). Nền sáng sạch (không kem ngà cũ) và nền tối đậm có chiều sâu |
| Hình dạng | Bo góc lớn (thẻ 16-20 px), nút viên thuốc **dày, có "đáy" tạo cảm giác nhấn xuống** (kiểu nút 3D phẳng), chip tròn, huy hiệu dạng khiên/huy chương |
| Chữ Latin/Việt | Sans tròn hoặc hình học **hỗ trợ đầy đủ dấu tiếng Việt** (ứng viên: Be Vietnam Pro, Nunito, Baloo 2, Lexend). Tiêu đề đậm, cá tính; thân chữ dễ đọc |
| Chữ Hán | **Rõ và lớn nhất trên thẻ.** Ưu tiên sans hoặc serif dễ đọc (Noto Sans SC/Noto Serif SC); lời bài hát có thể dùng serif để giữ tính "chữ", UI game dùng sans. Không dùng font trang trí cho chữ Hán |
| Minh họa | **Nhân vật đồng hành** (linh vật) có vài trạng thái (vui, cổ vũ, ngạc nhiên, buồn nhẹ, ăn mừng), dùng ở nhập môn, màn thưởng, trạng thái rỗng. Phong cách vector phẳng. Không dùng emoji làm minh họa chính, không ảnh nghệ sĩ thật |
| Chuyển động | Phản hồi ngắn, đàn hồi nhẹ (nút nhấn, thẻ lật, XP bay lên, huy hiệu bật ra). Mọi thứ có phương án **giảm chuyển động** |
| Âm thanh | Tùy chọn, mặc định **tắt hoặc rất nhỏ**; có bộ tiếng ngắn cho đúng/sai/lên cấp. Không bao giờ phát đè lên bài hát đang nghe |
| Dark mode | Bắt buộc, thiết kế đồng thời; màu nhấn tăng sáng để đủ tương phản |

### 3.3 Điều cần tránh
Neon/gradient gắt làm khó đọc chữ Hán; trang trí che lời bài hát; hiệu ứng liên tục gây phân tâm khi đang nghe; cơ chế gây lo âu (đếm ngược ép buộc, phạt nặng khi nghỉ, thông báo dọa mất chuỗi); minh họa kiểu trẻ con khiến người lớn ngại dùng.

## 4. Nguyên tắc trải nghiệm

1. **Một hành động chính mỗi màn.** Việc tiếp theo luôn rõ (nút lớn, một màu).
2. **Chữ Hán là trung tâm.** Thứ bậc: chữ Hán → pinyin → Hán Việt → nghĩa.
3. **Thưởng đúng lúc, đúng mức.** Phần thưởng gắn với học thật; màn thưởng ngắn, có thể bỏ qua; giải thích "vì sao tôi nhận".
4. **Không làm gián đoạn khi đang nghe nhạc.** Khi phát: không popup tự mở, không âm thanh game, không thông báo.
5. **Nghe được ở mọi nơi.** Mọi thẻ có nút nghe (giọng đọc hoặc đoạn hát/video gốc).
6. **Tiến bộ nhìn thấy được.** Thanh XP, chuỗi ngày, bản đồ lộ trình, bộ sưu tập huy hiệu luôn gần tay.
7. **Mobile-first nhưng không hy sinh tablet/desktop:** mỗi thiết bị có bố cục riêng tận dụng không gian (mục 6).
8. **Truy cập được cho mọi người:** WCAG 2.2 AA, vùng bấm ≥ 44 px, không chỉ dựa vào màu, giảm chuyển động, bàn phím đầy đủ.

## 5. Kiến trúc thông tin và điều hướng

Năm khu vực (đề xuất; designer xác nhận hoặc chỉnh, **tối đa 5 mục điều hướng chính trên mobile**):

| Khu vực | Nội dung | Câu hỏi người học |
|---|---|---|
| **Hôm nay** | Việc tiếp theo, nhiệm vụ ngày, chuỗi ngày, XP, gợi ý | "Hôm nay làm gì?" |
| **Học** | Lộ trình HSK, bài tình huống, tập viết, kiểm tra xếp lớp | "Học có hệ thống" |
| **Nghe** | Bài hát, video, thư viện, kênh, thêm video | "Học từ thứ tôi thích" |
| **Ôn & Nói** | Thẻ ôn, mini-game, luyện phát âm | "Nhớ lâu, nói đúng" |
| **Chơi** | Thi đấu 1v1, thử thách, giải đấu tuần, bảng xếp hạng, chat | "Học cùng người khác" |

Hồ sơ người chơi (cấp, XP, huy hiệu, cài đặt, đăng nhập) mở từ góc trên (ảnh đại diện), không chiếm tab. **Điểm vào mặc định của người mới là Nghe** (bài/video mẫu), không phải Học.

| Thiết bị | Điều hướng |
|---|---|
| Mobile (≤ 600) | Tab bar dưới 5 mục; hành động nổi (dán link/bắt đầu) khi cần |
| Tablet (600-1024) | Thanh điều hướng dọc bên trái thu gọn (icon + nhãn nhỏ); nội dung 1-2 cột |
| Desktop (≥ 1024) | Thanh bên trái đầy đủ; cột phải tùy ngữ cảnh (từ trong bài, nhiệm vụ, bảng xếp hạng); phím tắt |

## 6. Bố cục theo thiết bị (yêu cầu riêng)

Các màn có nhiều thông tin phải có bố cục khác nhau, không chỉ co giãn:

| Màn | Mobile | Tablet | Desktop |
|---|---|---|---|
| Nghe bài hát/video | Video ghim trên, lời giữa, **bottom sheet** các mục; một tay | Video + lời hai cột, sheet bên cạnh | **Ba vùng:** video + điều khiển (trái), lời (giữa), "Từ trong bài / đang hát" (phải); phím tắt |
| Hôm nay | Cuộn dọc: việc chính → nhiệm vụ → chuỗi/XP | Hai cột (việc chính | nhiệm vụ & tiến độ) | Ba cột: việc chính, nhiệm vụ, bảng thành tích/giải đấu |
| Lộ trình | Đường đi dọc cuộn, chặng hiện tại nổi bật | Đường đi + chi tiết chặng bên cạnh | Bản đồ rộng + panel chi tiết chặng + tiến độ |
| Chặng học | Từng bước toàn màn hình | Bước ở giữa, tiến độ bên cạnh | Bước ở giữa, danh sách từ/tiến độ bên phải |
| Ôn thẻ | Thẻ giữa, nút chấm dưới tầm ngón cái | Thẻ lớn, thống kê bên cạnh | Thẻ + phím tắt (1-4) + thống kê bên cạnh |
| Thi đấu | Một câu mỗi màn, bảng điểm thu gọn | Câu + bảng điểm cạnh nhau | Câu + bảng điểm + chat/emoji |
| Thư viện/danh sách | Lưới 2 cột + bộ lọc dạng sheet | Lưới 3-4 cột + bộ lọc bên trái | Lưới 4-6 cột + bộ lọc cố định |

Lưới: mobile 4 cột/16 px lề; tablet 8 cột; desktop 12 cột, nội dung tối đa ~1280 px (màn nghe được rộng hơn). Thiết kế ở **390, 820, 1440 px**.

## 7. Màn hình ưu tiên và đặc tả

Mỗi màn: mục đích, nội dung, hành động chính, trạng thái cần vẽ. Ưu tiên **P0 = luồng người mới + vòng hằng ngày** (làm trước và kiểm thử), P1 = màn học cốt lõi còn lại, P2 = phần còn lại (làm sau khi P0/P1 được duyệt, theo cùng hệ thống).

### P0 — Luồng phiên đầu và vòng lặp hằng ngày

**G1. Chào mừng và chọn level (≤ 2 màn).** Câu chào ngắn + nhân vật; chọn level (HSK1-5 hoặc "Mình mới bắt đầu"/"Chưa chắc"); không bắt đăng ký. Nút chính "Bắt đầu". Trạng thái: chọn/chưa chọn, bỏ qua được.

**G2. Chọn bài mẫu đầu tiên.** Hiện 3-5 bài/video mẫu hợp level (bìa lớn, tên, độ dài, độ khó, nhãn cảm xúc/chủ đề). Có "Dán link của bạn". Hành động chính: chọn một bài và vào học ngay. Mobile: danh sách thẻ lớn; desktop: lưới.

**G3. Học bài (màn Nghe).** *Màn quan trọng nhất.* Trình phát + lời chạy theo giờ (chữ Hán lớn, pinyin ruby, nghĩa Việt, câu đang hát nổi), bấm từ để tra, lưu thẻ, lặp câu, tốc độ, bật/tắt pinyin/dịch. Cần thể hiện: từ đã lưu, từ mới, "đang hát", lặp câu, hết bài. Game hóa **nhẹ nhàng, không gián đoạn:** biểu tượng XP nhỏ nhảy khi lưu từ, mục tiêu "lưu 3 từ" hiện kín đáo; phần thưởng lớn chỉ khi kết thúc bài. Ba bố cục theo mục 6.

**G4. Tra từ (popover/sheet).** Chữ Hán, pinyin, **Hán Việt**, cấp HSK, nghĩa trong câu + nghĩa từ điển, ví dụ, nút nghe, Lưu, Đã biết. Trạng thái: đang tải (chữ + pinyin hiện trước), lỗi, hết lượt AI, đã lưu.

**G5. Màn thưởng đầu tiên (kết thúc hoạt động).** Nhân vật ăn mừng, XP nhận (giải thích nguồn: "+10 vì lưu 3 từ"), huy hiệu "Khởi đầu", mở **chuỗi ngày 1**, thanh XP lên. Hành động: "Tiếp tục" (việc kế), "Xem huy hiệu". Có thể bỏ qua nhanh. Biến thể: lên cấp, huy hiệu mới, hoàn thành chặng.

**G6. Giới thiệu lộ trình + mời lưu tiến độ.** Sau G5: thẻ "Học có hệ thống với Lộ trình HSK" (xem trước bản đồ) và "Đăng nhập Google để lưu tiến độ/đặt nhắc học"; cả hai bỏ qua được.

**G7. Hôm nay (trang chủ).** Một **việc nổi bật** (tiếp tục bài đang nghe / ôn n thẻ / tiếp chặng), **nhiệm vụ ngày** (3 nhiệm vụ, thanh tiến độ, rương), **chuỗi ngày + XP + cấp**, gợi ý bài/video, lối "Dán link". Trạng thái: người mới (chưa có gì), đang học, hết việc hôm nay ("bạn đã hoàn thành!", gợi ý học thêm), chuỗi sắp mất, chưa đăng nhập. Ba bố cục.

**G8. Nhiệm vụ & rương.** Danh sách nhiệm vụ ngày/tuần, tiến độ, phần thưởng (XP, đóng băng chuỗi, vật phẩm), làm mới theo giờ. Trạng thái: đang làm, đã xong chưa nhận, đã nhận.

### P1 — Học cốt lõi

**G9. Bản đồ lộ trình.** Đường đi các chặng (36 chặng HSK 1; sau là các cấp khác), chặng hiện tại nổi bật, đã xong (✓ + điểm), đang dở, chưa học (không khóa cứng). Tiến độ cấp, nút "Tiếp tục". Chọn cấp/khóa (HSK 1-6, tình huống, tập viết) khi có nhiều.

**G10. Một chặng.** Stepper 3 bước: *Làm quen* (thẻ từ: chữ, pinyin, Hán Việt, nghĩa Việt, nghe; "Lưu cả nhóm vào bộ ôn") → *Nghe câu thật* (câu từ video, từ đích tô đậm, nghe, xem video) → *Kiểm tra* 10 câu (chữ→nghĩa, nghĩa→chữ, nghe→chữ; đúng/sai hiện ngay). Kết quả: %, XP, đạt/chưa đạt, "Chặng tiếp theo". Trạng thái: câu đúng/sai, hết bài, chưa đủ từ.

**G11. Ôn thẻ (FSRS).** Mặt trước chữ lớn + nghe; mặt sau pinyin/Hán Việt/nghĩa/ngữ cảnh; 4 nút Quên/Khó/Được/Dễ ghi rõ lần ôn kế; tiến độ phiên; màn kết thúc có thưởng ngắn. Chuyển sang các chế độ trò chơi (gõ pinyin, điền lời, ghép cặp, nghe và chọn, karaoke, đọc to).

**G12. Xem trước bài hát và thư viện.** Xem trước: bìa, tóm tắt, thẻ từ vựng/ngữ pháp, "bạn hiểu x% bài này", lọc level. Thư viện: lưới bài hát/video, bộ lọc (cấp HSK, chủ đề, cảm xúc, yêu thích), tab "Từ đã lưu".

**G13. Video 3 tab (Phụ đề / Nghe-chép / Luyện nói).** Dùng chung một khung với G3; tab Nghe-chép (ô gõ, chấm từng chữ/âm), Luyện nói (ghi âm, nhận xét AI, so giọng mẫu).

**G14. Hồ sơ người chơi và bộ sưu tập.** Ảnh đại diện/nhân vật, cấp + XP, chuỗi, thống kê (từ đã học, giờ học), **bộ sưu tập huy hiệu** (đã mở, chưa mở với gợi ý cách mở, hiếm), tùy biến nhân vật/ảnh. Cài đặt, đăng nhập, xóa dữ liệu.

**G15. Thi đấu và giải đấu tuần.** Hub (tạo phòng, nhập mã, thử thách, giải tuần), phòng chờ, ván chơi (câu hỏi + đồng hồ + bảng điểm), kết quả (thắng/thua, XP, lưu từ sai, tái đấu), bảng giải tuần (nhóm, thứ hạng, lên/xuống hạng; trạng thái "chưa đủ người").

### P2 — Làm sau theo cùng hệ thống
Luyện phát âm (bảng pinyin, thanh điệu có đường cao độ, đọc to chấm từng chữ, nghe đoán thanh, 绕口令, bài hằng ngày); bài học theo tình huống (hội thoại, đọc theo vai); tập viết chữ Hán; kiểm tra xếp lớp; chat cộng đồng và góp ý; thêm video; công cụ công khai và trang giới thiệu (SEO); thẻ chia sẻ (chuỗi ngày, câu hát, 绕口令, thành tích); hướng dẫn cài app; quản trị (không cần thiết kế game).

## 8. Hệ thống game hóa (thông số hình ảnh và hành vi)

| Thành phần | Yêu cầu thiết kế |
|---|---|
| **XP và cấp** | Thanh XP (tiến độ tới cấp kế), số XP bay lên khi nhận (đóng góp nguồn), tên cấp + biểu tượng cấp; cấp tăng có màn thưởng |
| **Chuỗi ngày** | Biểu tượng lửa/ngọn nến có trạng thái: chưa học hôm nay, đã học, sắp mất (nhẹ nhàng), đang được **đóng băng**; cột mốc 3/7/30/100 ngày |
| **Huy hiệu** | Khiên/huy chương có 3-4 bậc (đồng/bạc/vàng/kim cương), trạng thái đã mở/khóa (hình mờ + gợi ý)/hiếm/ẩn; thẻ chi tiết (cách đạt, ngày mở); bộ sưu tập theo nhóm (học, chuỗi, nghe, nói, thi đấu) |
| **Nhiệm vụ** | Thẻ nhiệm vụ (biểu tượng, mô tả, thanh tiến độ, phần thưởng); rương mở khi xong nhiệm vụ ngày |
| **Giải đấu tuần** | Bảng hạng nhóm 20-30 người, vùng lên/xuống hạng, thời gian còn lại, trạng thái chưa đủ người |
| **Nhân vật** | 5+ biểu cảm; trạng thái theo ngữ cảnh (chào, cổ vũ, ăn mừng, nhắc nhẹ); tùy biến (mũ, phụ kiện) mở bằng thành tích |
| **Phản hồi** | Đúng: rung nhẹ + màu + (tùy chọn) âm; sai: chuyển động nhẹ, không phạt; lên cấp/huy hiệu: hiệu ứng ngắn ≤ 2 giây, nhấn để bỏ qua |
| **Ràng buộc** | Không đếm ngược gây áp lực; không phạt nặng khi nghỉ; mọi phần thưởng giải thích được; hiệu ứng tắt được (giảm chuyển động, tắt âm) |

## 9. Thư viện thành phần

Thiết kế dạng component dùng lại, đủ trạng thái (mặc định, hover/focus, nhấn, vô hiệu, đang tải, lỗi, tối/sáng):

Nút (chính, phụ, nguy hiểm; dạng "đáy"), nút nghe, chip level HSK, chip trạng thái, **thẻ từ** (chữ Hán + pinyin + Hán Việt + nghĩa + hành động), **thẻ ngữ pháp**, **dòng lời** (đang hát/đã qua/sắp tới/lặp), token trong lời (thường, từ mới, đã lưu, đang mở, đã biết), popup tra từ (sheet/popover), thanh phát (tiến độ, tốc độ, lặp), **stepper bước học**, thẻ ôn (hai mặt, lật), nút chấm 4 mức, **thanh XP**, **huy hiệu** (các bậc/trạng thái), **thẻ nhiệm vụ**, **chuỗi ngày**, thẻ chặng lộ trình, bảng hạng, thẻ kết quả chấm (màu + chữ + điểm), thanh tiến độ, ô chọn/bộ lọc, toast (kèm hoàn tác), **trạng thái hết lượt AI** (một kiểu thống nhất: nói rõ nguyên nhân, khi nào có lại, lựa chọn thay thế), trạng thái rỗng/lỗi (nhân vật + 1 câu + 1 nút), thẻ chia sẻ, điều hướng (tab bar/thanh bên).

## 10. Nội dung chữ (microcopy) và đa ngôn ngữ

- **Giọng văn:** thân thiện, trẻ trung, ngắn; xưng "bạn", tự xưng "mình" khi cần; không sến, không lên mặt; khen có lý do ("+10 XP vì lưu 3 từ"). Lỗi nói rõ và có đường thoát.
- **Tiếng Việt là mặc định.** Chuỗi có thể dài hơn 30-40% khi đổi ngôn ngữ: không cố định chiều rộng nút/nhãn, không đưa chữ vào hình (huy hiệu, nhân vật: chữ là lớp riêng).
- **Dữ liệu mẫu:** bài hư cấu 夜车 và danh sách từ trong `design-brief.md` mục 6; thêm từ HSK 1 đại từ/số đếm cho màn chặng (我、你、他、这、那、一、二…); người dùng mẫu: cấp 7, 340 XP, chuỗi 5 ngày, 14 thẻ đến hạn, 3 nhiệm vụ (1 xong).

## 11. Quy trình và sản phẩm bàn giao

**Giai đoạn A — Khám phá hướng (ngắn):** 2-3 hướng thương hiệu (màu, chữ, nhân vật, nút, huy hiệu) áp dụng lên **3 màn: G3 Nghe, G7 Hôm nay, G5 Màn thưởng** (mobile). Chọn một hướng.
**Giai đoạn B — Thiết kế P0:** toàn bộ G1-G8 ở 390/820/1440, sáng + tối, đủ trạng thái; hệ thống thành phần + token.
**Giai đoạn C — Prototype bấm được và kiểm thử:** luồng người mới G1→G2→G3→G4→G5→G6→G7 và vòng ngày G7→G10→G11. **Kiểm thử 5-8 người học thật** (thử thành công nhiệm vụ: "Học 3 từ từ một bài", "Tìm chặng tiếp theo", "Nhận nhiệm vụ ngày", "Hiểu mình nhận XP từ đâu"); ghi lại chỗ vấp.
**Giai đoạn D — Thiết kế P1** theo hệ thống đã duyệt; **P2** sau.

**Bàn giao:** (1) trang hướng thương hiệu (màu light/dark, chữ, nút, bo góc, icon, nhân vật, huy hiệu, chuyển động); (2) thư viện thành phần đủ trạng thái; (3) các màn P0/P1 ở 3 kích thước; (4) prototype; (5) token thiết kế xuất được (màu, chữ, khoảng cách, bo góc, bóng, thời lượng chuyển động) để đối chiếu với Tailwind hiện tại; (6) ghi chú quyết định, đặc biệt: bố cục ba vùng của màn nghe trên desktop, bottom sheet trên mobile, quy tắc màn thưởng; (7) bộ tài sản (nhân vật, huy hiệu, icon) dạng vector.

**Tiêu chí duyệt:** người mới trong kiểm thử vào được hoạt động học đầu tiên ≤ 60 giây không cần hướng dẫn; chữ Hán đọc rõ ở mọi bề mặt (AA); mọi màn P0 có đủ trạng thái; ba bố cục khác nhau thật sự; không còn điều hướng quá 5 mục chính trên mobile.

## 12. Gợi ý lệnh cho công cụ thiết kế AI (Stitch/Figma AI)

> *Prompt khám phá hướng (G3):* "Mobile screen 390x844 for a Vietnamese learner studying Chinese through songs. Top: YouTube video player pinned. Middle: synced lyrics list, current line large with Chinese characters, pinyin above, Vietnamese translation below; previously saved words highlighted. Bottom sheet: 'words in this line' chips with Han Viet reading. Playful modern game-like style: bold rounded sans (Vietnamese diacritics supported), vivid brand color, chunky buttons with a pressed-down edge, small XP indicator top-right, dark and light variants. Chinese characters must stay the most legible element."
>
> *Prompt Hôm nay (G7):* "Home dashboard for a language-learning app: one prominent 'next task' card, three daily quests with progress and a chest, streak flame, XP/level bar, recommended song cards. Game-like, youthful, high contrast. Mobile 390, tablet 820 (two columns), desktop 1440 (three columns)."
>
> *Prompt Màn thưởng (G5):* "Reward screen after the learner's first activity: friendly mascot celebrating, '+10 XP because you saved 3 words', first badge unlocked, streak starts at day 1, XP bar fills. Skippable, short, joyful but not childish."

Luôn thêm: "Use only fictional sample lyrics; no real song lyrics or artist photos."

## 13. Ngoài phạm vi đợt này
Trang giới thiệu marketing và SEO, trang quản trị, thanh toán/gói trả phí, logo chính thức (dùng wordmark tạm "SongHanzi" cho tới khi chốt tên), giao diện tiếng Anh (chỉ chừa chỗ).

## 14. Quyết định đã chốt thêm (2026-10-19) và câu hỏi còn mở
Đã chốt: giữ tên **SongHanzi**; **chưa có linh vật** (bỏ phần nhân vật ở mục 3.2 và 8 cho tới khi bổ sung; thay bằng minh họa/biểu tượng); **chưa có tiền ảo**; **giải đấu tuần làm sau** (chỉ nhãn "Sắp có"); công cụ thiết kế **Stitch**, **dựng giao diện một lần** sau khi duyệt toàn bộ thiết kế; **giữ đường dẫn cũ**. Còn mở: tìm 5-8 người kiểm thử. Bản mô tả luồng dùng trực tiếp cho Stitch: [`app-flows-for-stitch.md`](app-flows-for-stitch.md).
