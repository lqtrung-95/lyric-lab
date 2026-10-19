# PRD v2 — SongHanzi: học tiếng Trung cho người Việt

Cập nhật: 2026-10-19 · Trạng thái: bản hiện hành (thay thế `PRD.md` v1 làm tài liệu yêu cầu sản phẩm; v1 giữ lại làm lịch sử) · Mục đích chính của bản này: **làm đầu vào để thiết kế lại giao diện toàn bộ ứng dụng.**

Cách đọc: mục 1-4 là bối cảnh và nguyên tắc (không đổi khi thiết kế lại); mục 5-6 là cấu trúc thông tin và hành trình; mục 7 là yêu cầu theo module kèm trạng thái; mục 8 là danh sách màn hình cần thiết kế; mục 9-12 là dữ liệu, phi chức năng, hiện trạng thiết kế và vấn đề đã biết; mục 13-14 là lộ trình và câu hỏi mở. Trạng thái mỗi yêu cầu: **Đã có**, **Một phần**, **Kế hoạch** (đã có kế hoạch được duyệt), **Backlog** (cân nhắc, chưa duyệt).

## 0. Quyết định đã chốt cho đợt thiết kế lại (chủ sản phẩm, 2026-10-19)

| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | Ưu tiên người mới hay người đang dùng | **Cả hai**: nhập môn mượt cho người mới, đồng thời đủ chiều sâu và phần thưởng cho người dùng lâu |
| 2 | Thương hiệu | **Làm lại**: hiện đại, trẻ trung, **phong cách game**; không còn bắt buộc giữ nhận diện "thi ca/thư pháp" (tên sản phẩm giữ hay đổi: thiết kế được đề xuất, xem mục 14) |
| 3 | Điểm vào mặc định của người mới | **Bài hát/video** (không phải lộ trình); lộ trình vẫn là trụ cột nhưng được giới thiệu sau hoạt động đầu tiên |
| 4 | Bố cục tablet/desktop | **Cần bố cục riêng** (không chỉ co giãn từ mobile) |
| 5 | Số liệu sử dụng | **Rất ít người dùng**: thiết kế dựa trên nguyên tắc và kiểm thử nhỏ, không dựa số liệu; phải bổ sung đo lường (mục 10) |
| 6 | Mức gamification | **Mạnh hơn hiện tại**: mô-đun game hóa riêng (mục 7.P) |
| 8 | Tên sản phẩm | **Giữ "SongHanzi"** |
| 9 | Linh vật | **Chưa có** (tạm thời, có thể bổ sung sau) |
| 10 | Kinh tế game | **Chưa có tiền ảo**; chỉ XP, cấp, huy hiệu, nhiệm vụ, chuỗi ngày |
| 11 | Giải đấu tuần | **Làm sau** (khi đủ người dùng); trước mắt chỉ có nhãn "Sắp có" |
| 12 | Công cụ thiết kế / cách dựng | **Stitch**, dựng giao diện **một lần** sau khi thiết kế xong |
| 13 | Đường dẫn cũ | **Giữ nguyên** các đường dẫn hiện có khi đổi điều hướng |
| 14 | Người kiểm thử | Chưa có danh sách 5-8 người (cần tìm) |
| 7 | Giao diện tiếng Anh | **Chưa làm bây giờ, có thể có sau**: thiết kế và code phải **sẵn sàng đa ngôn ngữ** (không nhúng chữ vào hình, chừa chỗ cho chuỗi dài hơn) |

## 1. Tổng quan sản phẩm

**SongHanzi** giúp người Việt học tiếng Trung bằng nội dung thật: bài hát C-pop và video đời sống trên YouTube. Người học thấy lời có mốc thời gian, pinyin, âm Hán Việt, nghĩa tiếng Việt; bấm từ để tra; lưu từ thành thẻ ôn (FSRS); luyện nghe-chép, luyện nói, thi đấu; và nay có **lộ trình HSK** dẫn dắt từng bước.

**Điểm khác biệt (vì sao người dùng chọn SongHanzi):**
1. Âm **Hán Việt** và bản dịch **tiếng Việt tự nhiên** (một cặp xưng hô thống nhất cho cả bài), thứ app quốc tế không có.
2. Học bằng **câu thật từ bài hát/video** thay vì câu ví dụ do máy viết: mỗi từ HSK 1-3 có ≥ 1 câu thật cho 84-95% số từ.
3. **Không bịa lời**: lời chỉ lấy từ phụ đề/nguồn có sẵn; AI chỉ phân tích và giải thích. Pinyin, cấp HSK, Hán Việt luôn từ từ điển.
4. Dùng ngay không cần đăng ký (tài khoản ẩn danh), đăng nhập Google để đồng bộ.
5. Luyện **phát âm có phản hồi** (thanh điệu, chấm từng chữ) và mini-game/thi đấu để giữ động lực.

**Giai đoạn hiện tại:** đã deploy production (Vercel + Supabase), một nhóm người dùng thử, chưa quảng bá rộng. Đang chuyển từ "kho nội dung + công cụ" sang "có đường học rõ ràng" (lộ trình HSK). Thiết kế hiện tại tích lũy dần theo từng tính năng, nên nhu cầu thiết kế lại là **thống nhất toàn bộ trải nghiệm quanh hành trình học**, không chỉ làm đẹp.

### Mục tiêu của đợt thiết kế lại
- **Phục vụ cả người mới (kích hoạt) và người đang dùng (giữ chân)**: nhập môn nhanh, vòng lặp hằng ngày hấp dẫn, phần thưởng có chiều sâu.
- **Nhận diện mới, trẻ trung, kiểu game**, nhưng chữ Hán và nội dung học vẫn là trung tâm, dễ đọc, không bị trang trí át mất.
- Người mới hiểu app dùng để làm gì và biết **bước tiếp theo** trong ≤ 10 giây.
- Một **mô hình tư duy duy nhất**: Học (lộ trình) – Nghe (nội dung thật) – Ôn (thẻ, trò chơi) – Nói (phát âm) – Chơi (thi đấu, cộng đồng).
- Thống nhất thành phần giao diện (thẻ từ, danh sách lời, bước học, popup tra từ) giữa bài hát, video, lộ trình và ôn tập.
- Mobile-first (đa số người học Việt dùng điện thoại), tablet/desktop được tối ưu chứ không chỉ co giãn.
- Dùng được lâu dài: nhẹ mắt, tối/sáng, chữ Hán rõ, không rối khi nhiều tính năng.

## 2. Mục tiêu kinh doanh và chỉ số

**North Star (đề xuất cập nhật):** số **ngày học tích cực mỗi tuần** của mỗi người dùng hoạt động (≥ 1 mục học hoàn thành: một chặng, một phiên ôn, một bài nghe, một ván chơi). Bản v1 dùng "bài hát học xong mỗi tuần"; v2 mở rộng vì sản phẩm không chỉ có bài hát.

| Nhóm | Chỉ số | Mục tiêu đề xuất (chốt sau khi đo baseline) |
|---|---|---|
| Kích hoạt | Người mới hoàn thành một hoạt động học trong phiên đầu | ≥ 50% |
| Kích hoạt | Thời gian từ vào app đến hoạt động học đầu tiên | ≤ 60 giây |
| Giữ chân | Retention D1 / D7 / D30 | 35% / 20% / 10% |
| Thói quen | Ngày học trung bình mỗi tuần (người hoạt động) | ≥ 3 |
| Lộ trình | Tỉ lệ hoàn thành chặng đầu / hoàn thành 5 chặng | ≥ 60% / ≥ 25% |
| Ôn tập | Tỉ lệ hoàn thành phiên ôn đã bắt đầu | ≥ 60% |
| Chất lượng nội dung | Tỉ lệ nội dung bị báo sai | ≤ 3% |
| Chi phí | Chi phí AI mỗi người dùng hoạt động mỗi tháng | đặt trần sau khi có số liệu (xem mục 7.O) |

Ghi chú: dự án có sự kiện phân tích (`lib/analytics/track`) nhưng chưa có bảng điều khiển chỉ số tổng hợp; xem câu hỏi mở.

## 3. Người dùng

Đối tượng: **người Việt học tiếng Trung từ HSK 1 đến HSK 5**, giao diện và giải thích tiếng Việt.

| Persona | Mô tả | Nhu cầu | Khó khăn |
|---|---|---|---|
| Linh, sinh viên, HSK3 | Nghe C-pop mỗi tối, ôn thi HSK4 | Biến nghe nhạc thành ôn thi | Tra từ mất thời gian |
| Minh, nhân viên văn phòng, HSK4 | 15-20 phút/ngày, làm việc với đối tác Trung | Bài ngắn, có cấu trúc, trên điện thoại | Giáo trình nhàm, khó duy trì |
| Trang, mê phim Hoa ngữ, HSK1-2 | Muốn hiểu lời OST, mới học | Bắt đầu từ cơ bản mà vẫn vui | Không biết bắt đầu từ đâu, dễ bỏ |
| Hà, người mới hoàn toàn (HSK0) | Chưa biết gì, tò mò | Phát âm đúng, 100 từ đầu tiên | Thanh điệu, bảng pinyin |

**Jobs to be done:** (1) "Khi nghe một bài/video tiếng Trung, tôi muốn hiểu nhanh các từ quan trọng mà không phải tra từng từ." (2) "Tôi muốn có người chỉ đường: hôm nay học gì để tiến bộ." (3) "Tôi muốn nói đúng, nhất là thanh điệu." (4) "Tôi muốn học vui, có bạn cùng chơi, thấy mình tiến bộ."

## 4. Nguyên tắc sản phẩm (ràng buộc cứng, giữ nguyên khi thiết kế lại)

1. **Không để AI viết hay đoán lời bài hát.** Lời chỉ từ phụ đề YouTube → LRCLIB → NetEase (video: phụ đề của người làm hoặc bản chép nhận dạng giọng nói có gắn nhãn "tự động").
2. **Pinyin, cấp HSK, âm Hán Việt lấy từ từ điển** (CC-CEDICT, danh sách HSK 3.0, Unihan), không từ AI. Nghĩa tiếng Việt và bản dịch do AI sinh, có cơ chế báo sai và sửa.
3. **Không tải hay lưu audio/video YouTube** trên máy chủ; nghe lại bằng trình phát nhúng tại mốc thời gian.
4. **Không có trang công khai có thể được lập chỉ mục chứa lời bài hát**: trang bài học `noindex`; các trang công khai chỉ gồm công cụ và nội dung tự soạn.
5. **Khóa API chỉ ở máy chủ.** Âm thanh ghi âm chỉ chuyển tiếp để chấm, không lưu.
6. **Dùng được ngay không cần đăng ký** (tài khoản ẩn danh), đăng nhập Google để đồng bộ; dữ liệu ẩn danh được gộp khi đăng nhập.
7. **Accessibility WCAG 2.2 AA**: phần tử bấm là nút/liên kết thật, vùng bấm ≥ 44 px, không chỉ dựa vào màu, điều hướng bàn phím, nhãn tiếng Việt, tôn trọng giảm chuyển động.
8. **Dữ liệu mẫu và fixture chỉ dùng bài hát hư cấu**; không đưa lời bài hát thật vào kho mã.
9. **Tiếng Việt là ngôn ngữ giao diện mặc định**; mọi nhận xét/giải thích do AI viết bằng tiếng Việt.
10. **Trung thực về độ tin cậy**: kết quả chấm phát âm, nhận dạng giọng nói, nghĩa do AI sinh đều có ghi chú giới hạn và cách báo sai.

## 5. Kiến trúc thông tin

### 5.1 Hiện trạng (sitemap)
- **Công khai (index được):** `/` giới thiệu; `/cong-cu` (mục lục công cụ); `/chu-han-sang-pinyin`; `/tu-vung-hsk` và `/tu-vung-hsk/[cấp]`; `/phat-am` (+ bảng pinyin, luyện thanh điệu, đọc to chấm điểm, nghe đoán thanh, 绕口令, luyện 5 phút mỗi ngày, lộ trình phát âm).
- **Ứng dụng (cần phiên, `noindex`):** `/app` trang chủ · `/hoc` lộ trình, `/hoc/[khóa]/[chặng]` · `/library` thư viện (bài hát, từ đã lưu, khám phá) · `/video`, `/video/kenh/[kênh]`, `/video/add`, `/video/[id]` (3 tab: Phụ đề, Nghe-chép, Luyện nói) · `/learn/[id]` xem trước, `/learn/[id]/listen`, `/learn/[id]/summary` · `/review` (ôn thẻ) và `/review/{pinyin,cloze,match,listen,karaoke,doc-to,leaderboard}` · `/room`, `/room/[mã]`, `/room/history` thi đấu 1v1 · `/challenge/[mã]` thử thách · `/chat` cộng đồng · `/settings`, `/settings/merge` · `/feedback` · `/welcome` thiết lập ban đầu · `/cai-app` hướng dẫn cài app.
- **Khác:** `/watch` và `/share-target` (nhận link chia sẻ từ YouTube/hệ điều hành), `/share/streak/[token]` (thẻ chia sẻ chuỗi ngày), `/unsubscribe/[token]`, `/admin/*` (quản trị).

### 5.2 Điều hướng hiện tại
Thanh dưới (mobile) và thanh trên (desktop) có 6 mục: **Trang chủ, Học, Thi đấu, Video, Ôn tập, Thư viện**. Tiêu đề có thêm chuông chat, menu ⋯ (cài app, cài đặt, góp ý, quản trị). Thiết kế tab 6 mục vừa khít ở 375 px.

### 5.3 Đề xuất khung cho thiết kế lại (để thiết kế xác nhận hoặc thay thế)
Năm trụ cột theo vòng học, mỗi trụ cột là một khu vực điều hướng:

| Trụ cột | Gồm | Câu hỏi người học |
|---|---|---|
| **Hôm nay** | Việc tiếp theo, mục tiêu ngày, chuỗi ngày, gợi ý | "Hôm nay học gì?" |
| **Học** | Lộ trình HSK, bài tình huống, tập viết, kiểm tra xếp lớp | "Học có hệ thống" |
| **Nghe** | Bài hát, video (khám phá, thư viện, kênh), thêm video | "Học qua nội dung tôi thích" |
| **Ôn & Nói** | Thẻ ôn FSRS, mini-game, luyện phát âm | "Nhớ lâu và nói đúng" |
| **Chơi** | Thi đấu, thử thách, bảng xếp hạng, chat | "Học cùng người khác" |

Điểm vào mặc định của người mới là **Nghe** (bài hát/video): màn đầu tiên cho chọn ngay một bài hoặc video mẫu hợp level để học trong ≤ 60 giây; lộ trình và phần thưởng được giới thiệu SAU hoạt động đầu tiên (xem mục 6). Gợi ý: gộp "Học" và "Hôm nay" thành điểm vào thống nhất; đưa "Thư viện" vào "Nghe"; đưa công cụ phát âm công khai vào "Ôn & Nói" để người đã đăng nhập dùng không rời app. Quyết định cuối thuộc về thiết kế, nhưng phải giữ **tối đa 5 mục điều hướng chính** trên mobile.

## 6. Hành trình người dùng chính

1. **Người mới (phiên đầu):** vào `/` hoặc `/app` → chọn nhanh level (hoặc bỏ qua) → **chọn một bài hát/video mẫu hợp level và học ngay** (nghe, tra vài từ, lưu thẻ đầu tiên) → màn thưởng đầu tiên (XP, huy hiệu "Khởi đầu", mở chuỗi ngày) → giới thiệu lộ trình ("Học có hệ thống?") → được mời lưu tiến độ (Google) và đặt nhắc học.
2. **Vòng học hằng ngày:** mở app → "Hôm nay" cho một việc nổi bật (ôn thẻ đến hạn / tiếp chặng / bài nghe dở) → làm → thấy chuỗi ngày và mục tiêu cập nhật → chia sẻ (tùy chọn).
3. **Bài hát:** dán link hoặc chọn từ thư viện → đang phân tích (tiến trình) → xem trước (từ vựng, ngữ pháp, "bạn hiểu x%") → nghe (lời chạy theo nhạc, tra từ, lặp, tốc độ, sửa lệch lời) → tổng kết → ôn/nghe lại.
4. **Video luyện nghe:** chọn video (lọc theo cấp, chủ đề, kênh, yêu thích) → tab Phụ đề (xem, tra từ) → Nghe-chép (gõ pinyin/chữ Hán từng câu) → Luyện nói (ghi âm, nhận xét). Video không có phụ đề: nhờ AI nghe (cần đăng nhập Google).
5. **Lộ trình:** bản đồ chặng → một chặng: làm quen từ → nghe câu thật → kiểm tra → kết quả → chặng kế.
6. **Ôn tập:** hàng đợi FSRS (Lại/Khó/Được/Dễ) → chế độ trò chơi tùy chọn.
7. **Phát âm:** bảng pinyin → luyện thanh điệu (ghi âm, đường cao độ) → đọc to chấm từng chữ → 绕口令/bài hằng ngày.
8. **Thi đấu:** tạo phòng/nhập mã → chờ → ván 10 câu → kết quả, lưu từ sai; hoặc thử thách chia sẻ qua link.

## 7. Yêu cầu chức năng theo module

### A. Tài khoản, hồ sơ, thiết lập
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| AC-01 | Phiên ẩn danh tự tạo khi cần (chống lạm dụng bằng Turnstile ở production) | Đã có |
| AC-02 | Đăng nhập Google; gộp dữ liệu tài khoản ẩn danh vào tài khoản Google (thẻ, tiến độ, điểm, thích, hồ sơ, tiến độ lộ trình) | Đã có |
| AC-03 | Thiết lập ban đầu (`/welcome`): level HSK, mục tiêu ngày, thẻ mới mỗi ngày | Đã có |
| AC-04 | Hồ sơ công khai nhẹ: biệt danh + ảnh đại diện dùng chung cho thi đấu và bảng xếp hạng; lọc từ tục | Đã có |
| AC-05 | Cài đặt: học (level, thẻ mới/ngày, mục tiêu ngày), nghe (mặc định pinyin/dịch/cuộn), giọng đọc (đám mây hay thiết bị), nhắc học, tài khoản, xóa dữ liệu | Đã có |
| AC-06 | Bài kiểm tra xếp lớp 12 câu để đề xuất level | Kế hoạch |

### B. Trang chủ / "Hôm nay"
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| HM-01 | Ô dán link bài hát YouTube (mọi dạng link) + tìm bài + khám phá | Đã có |
| HM-02 | Bảng "việc tiếp theo": tiếp tục bài đang nghe, số thẻ cần ôn, vòng mục tiêu ngày, chuỗi ngày | Đã có |
| HM-03 | Gợi ý học hôm nay (video hoặc bài hát hợp level, đổi theo ngày) | Đã có |
| HM-04 | Bài gần đây, bài đề xuất, các bước cho người mới, biểu ngữ mời cài app (điện thoại) | Đã có |
| HM-05 | "Việc tiếp theo" thông minh gộp lộ trình, tình huống, thẻ đến hạn; đúng một việc nổi bật trong mọi trạng thái | Kế hoạch |

### C. Khám phá và thư viện
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| LB-01 | Thư viện bài hát đã phân tích: lọc theo level, cảm xúc (mood), yêu thích, tìm kiếm; xóa bài của mình | Đã có |
| LB-02 | Tab "Từ đã lưu" (thẻ) và "Khám phá" bài mới | Đã có |
| LB-03 | Danh sách video: lọc theo cấp HSK, thẻ chủ đề (9 thẻ), nhóm theo kênh, yêu thích, tìm kiếm; trang kênh | Đã có |
| LB-04 | Thích bài hát/video (cả tài khoản ẩn danh); đồng bộ | Đã có |
| LB-05 | Gợi ý bài theo từ vừa học/sắp quên | Backlog |

### D. Bài hát (dán link → xem trước → nghe → tổng kết)
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| SG-01 | Nhập link, kiểm tra nhúng được, lấy lời có mốc giờ (nhiều nguồn), phân tích AI (SSE có tiến trình), cache toàn cục | Đã có |
| SG-02 | Màn xem trước: tóm tắt, thẻ từ vựng và ngữ pháp, lọc level, "Đã biết", "bạn hiểu x% bài này", báo sai bài/mục | Đã có |
| SG-03 | Màn nghe: trình phát nhúng, lời chạy theo nhạc (tô câu đang hát, tự cuộn có thể tắt), bật/tắt pinyin/dịch, bấm từ để tra (nghĩa từ điển + nghĩa theo ngữ cảnh), lưu thẻ, lặp câu, tốc độ, phím tắt, hỏi AI về câu, giải thích cả câu, gợi ý sửa dịch, chia sẻ câu thành ảnh | Đã có |
| SG-04 | Chỉnh độ lệch lời (cá nhân và mặc định do admin), bảng đồng bộ | Đã có |
| SG-05 | Luyện nói từng câu (ghi âm, AI nhận xét) trong màn nghe | Đã có |
| SG-06 | Tổng kết bài (từ đã học, nút ôn ngay/nghe lại), hướng dẫn lần đầu (tour) | Đã có |
| SG-07 | Từ điển cá nhân: từ đã lưu hiện lại các câu hát chứa nó | Backlog |

### E. Video luyện nghe
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| VD-01 | Kho video do admin duyệt, ~430 video đã duyệt, gắn cấp HSK trung bình (từ từ điển) | Đã có |
| VD-02 | Màn xem video với 3 tab dùng chung một trình phát: Phụ đề (chạy theo giờ, tra từ), Nghe-chép (gõ pinyin/chữ Hán từng chữ, chấm từng âm tiết), Luyện nói (ghi âm, nhận xét AI, so giọng mẫu) | Đã có |
| VD-03 | Người dùng tự thêm video: dán link + phụ đề, hoặc nhờ AI nghe video không có phụ đề (chỉ tài khoản Google, có hạn mức) | Đã có |
| VD-04 | Dịch tiếng Việt tự động khi thiếu, báo bản dịch sai → AI dịch lại một dòng | Đã có |
| VD-05 | Tiến độ chép/nói theo câu, lưới nhảy tới câu bất kỳ, tổng kết | Đã có |
| VD-06 | Bản chép do AI nghe được gắn nhãn "tự động"; admin rà và sửa | Đã có |

### F. Lộ trình học (trụ cột mới)
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| PT-01 | Khung khóa học → chặng → tiến độ người dùng; chỉ mục từ→câu thật (20 nghìn câu, chấm chất lượng) | Đã có |
| PT-02 | Lộ trình HSK 1: 36 chặng/506 từ theo 19 chủ đề; bản đồ chặng với tiến độ, nút tiếp tục, không khóa cứng | Đã có |
| PT-03 | Một chặng: làm quen từ (nghe, pinyin, Hán Việt, nghĩa Việt, lưu thẻ cả nhóm) → nghe trong câu thật → kiểm tra 10 câu (≥ 70% hoàn thành) | Đã có |
| PT-04 | Lộ trình HSK 2-6 bằng cùng cơ chế (HSK 4-6 thiếu câu thật dần: 77%/64%/56% từ có ≥ 1 câu) | Kế hoạch |
| PT-05 | Bài học theo 10 tình huống đời sống (chào hỏi, giới thiệu, gọi món, mua sắm, hỏi đường, taxi, khách sạn, bệnh viện, điện thoại/WeChat, đi làm): hội thoại, đọc theo vai có chấm, ôn nhanh; nội dung do người dùng duyệt | Kế hoạch |
| PT-06 | Tập viết chữ Hán (thứ tự nét, chấm nét), bắt đầu HSK 1-3; cần xác nhận giấy phép dữ liệu nét | Kế hoạch |
| PT-07 | Trò chơi mới gắn vào chặng và vào Ôn tập: xếp từ thành câu, đoán từ qua Hán Việt, nghe và chép từ | Kế hoạch |
| PT-08 | Kiểm tra xếp lớp; XP và huy hiệu do mô-đun game hóa (7.P) cung cấp | Kế hoạch |

### G. Ôn tập
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| RV-01 | Thẻ FSRS (từ vựng, ngữ pháp) kèm nghe lại đúng đoạn; hàng đợi theo hạn mức thẻ mới/ngày; hoàn tác; "học thêm" | Đã có |
| RV-02 | Chế độ trò chơi: gõ pinyin, điền lời, ghép cặp, nghe và chọn, karaoke; điểm tính vào bảng xếp hạng; câu đúng cập nhật lịch thẻ | Đã có |
| RV-03 | Đọc to từ đã lưu có chấm từng chữ | Đã có |
| RV-04 | Bảng xếp hạng theo chế độ và thời gian, hồ sơ nickname/avatar | Đã có |
| RV-05 | Xuất thẻ cho Anki (CSV) | Backlog |

### H. Luyện phát âm
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| PR-01 | Bảng pinyin có giọng chuẩn, mẹo so với tiếng Việt, lỗi hay gặp | Đã có (nội dung nháp, cần chuyên gia rà) |
| PR-02 | Luyện thanh điệu: ghi âm, dò cao độ ngay trên máy, so với đường mẫu, lời khuyên | Đã có (đã kiểm chứng trên giọng máy, chưa trên người thật) |
| PR-03 | Đọc to chấm từng chữ (Azure Pronunciation Assessment) + mẹo sửa lấy từ bảng pinyin | Đã có |
| PR-04 | Nghe đoán thanh, 绕口令 có thẻ chia sẻ ảnh, bài 5 phút mỗi ngày, lộ trình 6 bước (tiến độ lưu trên thiết bị) | Đã có |
| PR-05 | Gộp chuỗi ngày/tiến độ phát âm vào hệ thống chính (hiện lưu cục bộ) | Kế hoạch |

### I. Thi đấu và thử thách
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| CP-01 | Phòng 1v1 theo mã/link: ván 10 câu thời gian thực, chấm ở máy chủ, kết quả, lưu từ trả lời sai, lịch sử 50 ván | Đã có |
| CP-02 | Thử thách chia sẻ qua link (một bộ câu, nhiều người chơi, bảng điểm) | Đã có |
| CP-03 | Ghép ngẫu nhiên, lời mời, thêm chế độ chơi, chặn người chơi | Backlog |

### J. Cộng đồng
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| CM-01 | Chat cộng đồng (tài khoản Google), thông báo, báo cáo/chặn, thông báo của quản trị | Đã có |
| CM-02 | Tường góp ý, báo sai nội dung | Đã có |

### K. Động lực và nhắc học
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| MT-01 | Chuỗi ngày học, mục tiêu ngày (5/10/20/30 mục), cột mốc, tính cả thẻ, trò chơi, bài nghe, video | Đã có |
| MT-02 | Thẻ chia sẻ chuỗi ngày (ảnh + trang chia sẻ), thẻ chia sẻ câu hát, thẻ 绕口令 | Đã có |
| MT-03 | Nhắc học bằng thông báo đẩy và email (múi giờ người dùng), hủy đăng ký | Đã có |
| MT-04 | Hệ thống game hóa đầy đủ (xem 7.P) thay thế mục này | Kế hoạch |

### P. Game hóa (mô-đun mới, mức "mạnh")
Mục tiêu: biến học thành vòng lặp có phần thưởng thấy được, nhưng **XP và phần thưởng chỉ gắn với học thật** (không lặp một bài để cày, không thưởng cho thao tác rỗng).

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| GM-01 | **XP** cho mọi hoạt động học thật (hoàn thành chặng, phiên ôn, bài nghe, chép, luyện nói, ván thi đấu), công thức minh bạch, trần mỗi hoạt động mỗi ngày để chống cày | Kế hoạch |
| GM-02 | **Cấp độ người chơi** (từ XP tích lũy) với tên cấp và mốc thưởng; hiện thanh XP ở "Hôm nay" và hồ sơ | Kế hoạch |
| GM-03 | **Huy hiệu/thành tích** (mốc đầu tiên, chuỗi ngày, số từ đã học, độ chính xác, hoàn thành chặng/khóa, thi đấu, phát âm); có huy hiệu ẩn; màn bộ sưu tập | Kế hoạch |
| GM-04 | **Nhiệm vụ hằng ngày và hằng tuần** (ví dụ ôn 10 thẻ, nghe 1 bài, đọc 1 câu) với rương/thưởng; làm mới theo múi giờ | Kế hoạch |
| GM-05 | **Chuỗi ngày nâng cấp**: đóng băng chuỗi (kiếm được bằng nhiệm vụ, không mua), cảnh báo sắp mất, khôi phục có điều kiện | Kế hoạch |
| GM-06 | **Giải đấu tuần theo nhóm trình độ** (đóng mùa, lên/xuống hạng), tái dùng bảng xếp hạng và thi đấu hiện có | Kế hoạch |
| GM-07 | **Tùy biến nhân vật/ảnh đại diện** và vật phẩm mở khóa bằng thành tích (chỉ trang trí, không ảnh hưởng nội dung học) | Kế hoạch |
| GM-08 | **Phản hồi giác quan**: hiệu ứng, chuyển động và (tùy chọn) âm thanh khi đúng/sai/lên cấp; **tôn trọng giảm chuyển động** và có nút tắt âm | Kế hoạch |
| GM-09 | Chia sẻ thành tích (thẻ ảnh) cho cấp mới, huy hiệu, chuỗi ngày | Một phần (đã có thẻ chuỗi ngày) |
| GM-10 | Chống gian lận: tính XP ở máy chủ, giới hạn tần suất, không thưởng cho kết quả không chấm được | Kế hoạch |

Ràng buộc thiết kế cho game hóa: không dùng cơ chế gây lo âu/ép buộc (không phạt nặng khi nghỉ, không đếm ngược gây áp lực quá mức); phần thưởng phải giải thích được "vì sao tôi nhận". Cần quyết định về kinh tế vật phẩm (có tiền tệ ảo hay không) ở mục 14.

### L. Công khai và SEO
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| PB-01 | Trang giới thiệu (hero, cách hoạt động, tính năng, FAQ, dùng thử trực tiếp), JSON-LD, OG | Đã có |
| PB-02 | Công cụ miễn phí: chữ Hán → pinyin + Hán Việt; từ vựng HSK 1-6 có tải CSV; các công cụ phát âm | Đã có |
| PB-03 | Mục lục công cụ, sitemap, footer liên kết | Đã có |

### M. PWA và kênh chia sẻ
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| PW-01 | Cài app (PWA), hướng dẫn cài iPhone/Android, nút cài một chạm, cảnh báo trình duyệt trong Zalo/Facebook | Đã có |
| PW-02 | Nhận link chia sẻ từ YouTube/hệ điều hành (`share-target`), bookmarklet | Đã có |
| PW-03 | Tiện ích trình duyệt (phụ đề pinyin/Hán Việt trên YouTube) | Backlog (có kế hoạch sẵn) |

### N. Quản trị
| ID | Yêu cầu | Trạng thái |
|---|---|---|
| AD-01 | Duyệt video (draft/listed/hidden), xem và sửa từng dòng/bản dịch, khôi phục bản cũ | Đã có |
| AD-02 | Báo cáo bài/video/người chơi, góp ý, gợi ý dịch, sửa lời bài hát | Đã có |
| AD-03 | Bảng chỉ số tổng hợp (kích hoạt, giữ chân, chi phí AI) | Backlog |

### O. AI và hạn mức (ảnh hưởng thiết kế trạng thái "hết lượt")
Mọi tính năng dùng AI đều có hạn mức trong 24 giờ theo tài khoản và hiện trạng thái rõ ràng khi hết lượt:

| Loại | Khách (ẩn danh) | Thành viên Google | Dùng cho |
|---|---|---|---|
| Phân tích bài mới | 10 | 30 | Dán link bài mới |
| Giải nghĩa từ/câu theo ngữ cảnh | 60 | 200 | Bấm từ, giải thích câu |
| Hỏi AI về câu | 60 | 300 | Tab phụ đề, màn nghe |
| Nhận xét giọng (AI nghe) | 30 | 150 | Luyện nói, đọc to chấm điểm |
| Dịch phụ đề video | 20 | 60 | Thêm video |
| AI nghe video không phụ đề (mỗi đoạn 2 phút = 1 lượt) | 0 | 90 | Thêm video |
| Giọng đọc mới (file đã lưu không tính) | 80 | 250 | Phát âm |
| Chat | 20/giờ | 60/giờ | Cộng đồng |

Mô hình AI: DeepSeek chính cho phân tích; Gemini (chuỗi model có dự phòng) cho giải nghĩa, nghe giọng, dịch video, nghe video; Azure Speech cho giọng đọc và chấm phát âm; hạn mức Gemini miễn phí là điểm nghẽn đã biết (xem `handoff-and-status.md`).

## 8. Danh sách màn hình cần thiết kế

Mỗi màn cần đủ trạng thái: tải, rỗng, lỗi, hết hạn mức, chưa đăng nhập, ẩn danh, đã đăng nhập Google, offline (PWA), tối/sáng, mobile (375), tablet (768), desktop (≥ 1280).

| Nhóm | Màn hình |
|---|---|
| Công khai | Trang giới thiệu; mục lục công cụ; chữ Hán → pinyin; từ vựng HSK (mục lục, bảng theo cấp); hub phát âm và 7 công cụ phát âm |
| Vào app | Thiết lập ban đầu; đăng nhập/liên kết Google; gộp tài khoản |
| Hôm nay | Trang chủ ("Hôm nay") cho người mới / đang học / hết việc |
| Học | Bản đồ lộ trình; một chặng (3 bước + kết quả); danh sách khóa (khi có nhiều); bài tình huống; tập viết; kiểm tra xếp lớp; XP và huy hiệu |
| Nghe: bài hát | Dán link; đang phân tích; lỗi phân tích; xem trước; nghe (desktop hai cột, mobile một cột + bottom sheet); tra từ; giải thích câu; hỏi AI; luyện nói câu; chia sẻ câu; chỉnh lệch lời; tổng kết |
| Nghe: video | Danh sách + bộ lọc; trang kênh; xem video 3 tab (Phụ đề / Nghe-chép / Luyện nói); thêm video (dán, AI nghe); tổng kết chép |
| Ôn & Nói | Ôn thẻ (mặt trước/sau, chấm); 6 chế độ trò chơi + tổng kết; bảng xếp hạng; từ đã lưu (kho thẻ) |
| Chơi | Hub thi đấu; tạo/nhập mã; phòng chờ; ván chơi; kết quả; lịch sử; thử thách (tạo, chơi, bảng điểm) |
| Cộng đồng | Chat; góp ý và tường góp ý |
| Cài đặt | Học, nghe, giọng đọc, nhắc học, tài khoản, biệt danh/ảnh, xóa dữ liệu; hướng dẫn cài app |
| Game hóa | Hồ sơ người chơi (cấp, XP, huy hiệu, chuỗi); bộ sưu tập thành tích; nhiệm vụ hằng ngày/tuần; giải đấu tuần; màn thưởng (hoàn thành chặng, lên cấp, huy hiệu mới); tùy biến nhân vật |
| Chia sẻ | Thẻ chia sẻ (chuỗi ngày, câu hát, 绕口令, thử thách); trang chia sẻ chuỗi ngày |
| Quản trị | Video (danh sách, chi tiết, dòng), báo cáo, dịch, góp ý |

**Thành phần dùng lại cần thống nhất:** thẻ từ (chữ Hán, pinyin, Hán Việt, nghĩa, nghe, lưu), dòng lời (chữ Hán + pinyin ruby + dịch, trạng thái đang phát/đã qua), popup tra từ (sheet mobile, popover desktop), thanh phát (tiến độ, tốc độ, lặp), bước học (stepper), kết quả chấm (màu + chữ + điểm), thẻ chia sẻ, trạng thái hết lượt AI, ô chọn bộ lọc, thanh tiến độ, huy hiệu.

## 9. Mô hình dữ liệu (tóm tắt để thiết kế hiểu quan hệ)

- **Nội dung công khai:** `songs`/`song_analyses` (bài hát đã phân tích, mục từ vựng và ngữ pháp có vị trí trong lời), `video_lessons` (video, dòng lời jsonb, cấp HSK, thẻ), `dict_words` (từ điển, HSK), `dict_hanzi_sino_viet`, `courses`/`course_units` (lộ trình), `term_sentences` (chỉ mục từ→câu).
- **Người dùng:** `user_profiles` (level, mục tiêu), `user_cards` (thẻ FSRS), `review_logs`, `user_known_terms`, `user_song_progress`, `user_unit_progress`, `user_*_likes`, `practice_scores`, `leaderboard_profiles`, `usage_events`.
- **Xã hội:** `rooms`, `room_players`, `room_answers`, `challenges`/`challenge_*`, `chat_messages`.
- **Vận hành:** `feedback`, các bảng báo cáo, `email_prefs`, `push_subscriptions`.
Khi gộp tài khoản, mọi bảng có `user_id` đều được hợp nhất (có test canh gác). Chi tiết: `system-architecture.md`.

## 10. Yêu cầu phi chức năng

- **Hiệu năng:** bài đã cache vào xem trước ≤ 1 giây (p50); bài mới ≤ 8 giây tới thẻ đầu; danh sách lời dài (≥ 80 dòng) dựng lười; chuyển trang không nháy.
- **Ổn định mạng yếu:** mọi lệnh gọi có trạng thái lỗi và thử lại; phần học không cần AI vẫn chạy khi AI quá tải.
- **Accessibility:** như nguyên tắc 7; kiểm tra tự động bằng axe trong e2e cho các trang chính.
- **Riêng tư:** ghi âm không lưu; có xóa toàn bộ dữ liệu; nhắc học tôn trọng múi giờ và có hủy đăng ký.
- **Bảo mật:** khóa chỉ ở server, RLS theo người dùng, chống lạm dụng theo IP và theo tài khoản, lọc từ tục biệt danh.
- **Chi phí:** hạn mức AI, cache toàn cục, giọng đọc lưu dùng chung.
- **Đo lường (bắt buộc vì ít số liệu):** gắn sự kiện cho các bước kích hoạt (vào app → chọn bài → hoạt động học đầu tiên → màn thưởng → đăng nhập), vòng lặp hằng ngày, từng bước của chặng và nhiệm vụ; bảng chỉ số tổng hợp tối thiểu (AD-03 nâng lên ưu tiên). Với ít người dùng, bổ sung **kiểm thử khả dụng nhỏ (5-8 người học thật)** trên bản thiết kế trước khi code.
- **Đa ngôn ngữ:** chưa có tiếng Anh nhưng thiết kế phải sẵn sàng: không đưa chữ vào hình, cho phép chuỗi dài hơn 30-40%, tách nội dung do AI sinh theo ngôn ngữ giải thích (đã có `explainLang` ở cache).
- **Bố cục đáp ứng:** ba bố cục riêng (mobile ≤ 600, tablet 600-1024, desktop ≥ 1024) cho các màn có nhiều thông tin (nghe, video, lộ trình, ôn tập, thi đấu); desktop tận dụng nhiều cột và phím tắt.
- **Trình duyệt:** Chrome, Safari (iOS), Edge, Firefox gần nhất; thiết bị tối thiểu 360 px chiều rộng.

## 11. Hệ thống thiết kế: hiện tại và hướng mới

**Hướng mới (đã chốt):** thương hiệu hiện đại, trẻ trung, phong cách game. Yêu cầu cho thiết kế: bảng màu sống động nhưng chữ Hán và nội dung học luôn dễ đọc (tương phản AA); hệ thống thành phần có "cá tính game" (thanh XP, huy hiệu, nút lớn bo tròn, minh họa/nhân vật) nhưng không làm rối màn học; sáng/tối; chuyển động có mục đích; tùy chọn giảm chuyển động. Cân nhắc linh vật/nhân vật đồng hành để dẫn dắt người mới và làm phần thưởng.

### Hiện tại (điểm xuất phát, được phép thay hoàn toàn)

- Nền tảng: Next.js + Tailwind v4, token ngữ nghĩa kiểu Material (`primary`, `surface-container-*`, `on-*`, `error`, `tertiary`), icon Material Symbols (danh sách icon cố định), sáng/tối.
- Chữ: **Be Vietnam Pro** (giao diện), **Lora** (tiêu đề serif), **Noto Serif SC** (chữ Hán, tải theo mảnh).
- Màu thương hiệu hiện tại: đỏ gạch `#b03a2e` (primary) và xanh lục sẫm `#2e6b5e` (secondary), nền kem ấm (`#fff8f4`); phong cách "thi ca/thư pháp" nhẹ.
- Thiết kế gốc từ Google Stitch nằm ở `design/` và `design-brief.md` (màn S1-S10 của v1); phần lớn màn sau đó (video, thi đấu, lộ trình, phát âm, chat) **chưa có thiết kế gốc**, được làm trực tiếp trong code theo token hiện có.

## 12. Vấn đề trải nghiệm đã biết (giả thuyết, cần xác nhận bằng quan sát người dùng)

Các điểm dưới đây rút ra từ cấu trúc sản phẩm và phản hồi trong quá trình phát triển, **chưa có dữ liệu đo chính thức** (hiện rất ít người dùng, nên cần kiểm thử khả dụng nhỏ để xác nhận):
1. **Quá nhiều cửa vào** (bài hát, video, lộ trình, ôn tập, thi đấu, công cụ phát âm) nhưng thiếu một câu trả lời "bắt đầu từ đâu"; trang chủ dày đặc.
2. **Hai mô hình học song song** (học theo nội dung và học theo lộ trình) chưa được kể thành một câu chuyện; người dùng có thể không biết lộ trình dùng chung thẻ với phần Ôn tập.
3. **Phát âm nằm ở khu công khai** (đăng nhập hay không đều dùng được nhưng tiến độ lưu cục bộ), tách khỏi chuỗi ngày chính.
4. **Màn nghe và màn video** gần giống nhau nhưng không cùng một khung, khiến người dùng phải học hai kiểu điều khiển.
5. **Điều hướng 6 mục mobile** đã chật; thêm tính năng sẽ phải thay đổi cấu trúc.
6. **Trạng thái hết lượt AI** chưa thống nhất (mỗi nơi báo một kiểu).
7. **Mật độ thông tin lớn** trên màn nghe (lời, pinyin, dịch, thanh điều khiển, panel từ), nhất là mobile.
8. **Cảm giác tiến bộ** còn yếu ngoài chuỗi ngày (chưa có XP, huy hiệu, bản đồ kỹ năng).

## 13. Lộ trình sản phẩm

| Giai đoạn | Nội dung | Trạng thái |
|---|---|---|
| Nền tảng | Phân tích bài hát, nghe, thẻ FSRS, tài khoản, thư viện | Xong |
| Mở rộng | Mini-game, bảng xếp hạng, thi đấu 1v1, thử thách, chat, chuỗi ngày, nhắc học, PWA | Xong |
| Video | Kho video, chép chính tả, luyện nói, thêm video, AI nghe video | Xong |
| Phát âm | Bảng pinyin, thanh điệu, đọc to chấm điểm, 绕口令, bài hằng ngày | Xong (tiến độ cục bộ) |
| Lộ trình | Khung + HSK 1 | Xong (bản đầu) |
| **Thiết kế lại** | Khung điều hướng mới, hệ thống thiết kế thống nhất, màn "Hôm nay" | **Đợt này** |
| Lộ trình tiếp | HSK 2-6, tình huống, tập viết, trò chơi mới, XP/huy hiệu, xếp lớp | Kế hoạch (`plans/261019-2035-learning-paths-and-lessons/`) |
| Tăng trưởng | Tiện ích trình duyệt, bảng chỉ số, ghép ngẫu nhiên thi đấu | Backlog |

Điều kiện kỹ thuật cần giải quyết song song: hạn mức Gemini (chuyển sang một project trả phí, bỏ cách xoay nhiều project miễn phí vì đã bị Google cảnh báo vi phạm), chi phí AI theo người dùng.

## 14. Rủi ro và câu hỏi mở

**Rủi ro:** (1) Bản quyền lời bài hát và nội dung video: giữ `noindex`, chỉ hiển thị cho người học, gỡ theo yêu cầu. (2) Chất lượng nội dung AI sinh (nghĩa Việt, hội thoại, bản dịch): bắt buộc người duyệt và đường báo sai. (3) Hạn mức/chi phí AI. (4) Phụ thuộc YouTube (nhúng, phụ đề không chính thức). (5) Độ chính xác chấm phát âm trên giọng thật chưa kiểm chứng. (6) Thiết kế lại làm gián đoạn người dùng hiện tại: giữ nguyên đường dẫn quen thuộc hoặc có chuyển hướng.

**Câu hỏi mở còn lại:** (1) Tìm 5-8 người học thật để kiểm thử trước khi dựng giao diện. (2) Linh vật có bổ sung sau không. (3) Khi nào bật giải đấu tuần (cần đủ người dùng).
