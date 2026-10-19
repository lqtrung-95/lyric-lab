# SongHanzi — các luồng (flow) của ứng dụng, dùng để thiết kế UI

Tài liệu chỉ mô tả **luồng và nội dung từng màn hình**, không quy định phong cách hình ảnh (màu, font, minh họa do công cụ thiết kế đề xuất). Phong cách mong muốn: *hiện đại, trẻ trung, kiểu game; chữ Hán luôn dễ đọc nhất.* Ngôn ngữ giao diện: **tiếng Việt**. Tên sản phẩm: **SongHanzi**. Chưa có linh vật; chưa có tiền ảo (chỉ XP và huy hiệu). Dữ liệu mẫu chỉ dùng nội dung hư cấu.

## 0. Quy ước chung

**Sản phẩm:** web app giúp người Việt học tiếng Trung qua bài hát và video thật (lời chạy theo giờ, pinyin, âm Hán Việt, nghĩa tiếng Việt), kèm lộ trình HSK, ôn thẻ, luyện nói và thi đấu. Dùng được ngay không cần đăng ký (tài khoản ẩn danh); đăng nhập Google để đồng bộ.

**Thiết bị:** thiết kế **3 bố cục riêng**: mobile (390 px), tablet (820 px), desktop (1440 px). Màn nhiều thông tin (Nghe, Hôm nay, Lộ trình, Ôn thẻ, Thi đấu) khác nhau thật sự giữa các thiết bị, không chỉ co giãn. Có chế độ sáng và tối.

**Điều hướng chính (5 mục):** **Hôm nay** · **Học** · **Nghe** · **Ôn & Nói** · **Chơi**. Mobile: thanh tab dưới. Tablet: thanh dọc thu gọn bên trái. Desktop: thanh bên trái đầy đủ. Ảnh đại diện góc trên mở **Hồ sơ** (cấp, XP, huy hiệu, cài đặt, đăng nhập).

| Khu vực | Gồm |
|---|---|
| Hôm nay | việc tiếp theo, nhiệm vụ ngày, chuỗi ngày, XP |
| Học | lộ trình HSK (sau này: tình huống, tập viết) |
| Nghe | bài hát, video, thư viện, thêm video |
| Ôn & Nói | thẻ ôn, mini-game, luyện phát âm |
| Chơi | thi đấu 1v1, thử thách, bảng xếp hạng, chat. *(Giải đấu tuần: chỉ hiện nhãn "Sắp có".)* |

**Mọi màn cần vẽ các trạng thái:** đang tải (khung xương), rỗng, lỗi mạng (có nút thử lại), hết lượt AI (xem mục 0.2), chưa đăng nhập / ẩn danh / đã đăng nhập Google.

### 0.1 Thẻ từ (thành phần dùng ở nhiều nơi)
Chữ Hán **lớn nhất** · pinyin · **âm Hán Việt** (ví dụ 离开 · lí kāi · ly khai) · chip cấp HSK · nghĩa tiếng Việt · nút nghe · nút Lưu (bật/tắt) · nút "Đã biết".

### 0.2 Trạng thái "hết lượt AI" (một kiểu thống nhất)
Khi một tính năng AI hết hạn mức trong ngày: nói rõ **tính năng nào**, **khi nào có lại** (sau 24 giờ), **lựa chọn thay thế** (làm phần không cần AI, hoặc đăng nhập Google để có thêm lượt nếu đang ẩn danh).

### 0.3 Game hóa (xuất hiện xuyên suốt)
**XP** (nhận khi học thật, luôn nói rõ lý do: "+10 XP vì lưu 3 từ"), **cấp độ**, **huy hiệu** (3-4 bậc), **chuỗi ngày** (có thể được đóng băng), **nhiệm vụ ngày/tuần** kèm rương thưởng. Không đếm ngược gây áp lực, không phạt nặng khi nghỉ. Khi đang phát nhạc/video: chỉ hiện chỉ báo XP nhỏ, phần thưởng lớn chỉ ở cuối.

---

## Flow 1. Người dùng mới (phiên đầu tiên)
Mục tiêu: từ lúc vào app đến hoạt động học đầu tiên ≤ 60 giây. **Điểm vào mặc định là bài hát/video**, không phải lộ trình.

1. **1.1 Chào mừng + chọn level.** Lời chào ngắn. Chọn một: HSK1 · HSK2 · HSK3 · HSK4 · HSK5 · "Mình mới bắt đầu" · "Chưa chắc". Nút chính "Bắt đầu". Có "Bỏ qua". Không yêu cầu đăng ký.
2. **1.2 Chọn bài mẫu.** 3-5 thẻ bài hát/video hợp level (bìa lớn, tên, độ dài, độ khó, nhãn chủ đề). Có ô "Dán link YouTube của bạn". Chạm một thẻ → vào Flow 3 màn 3.4 (Nghe) với bài đó.
3. **1.3 Học bài** = màn Nghe (Flow 3, màn 3.4). Chỉ báo mục tiêu nhỏ kín đáo: "Lưu 3 từ".
4. **1.4 Màn thưởng đầu tiên** (khi hết bài hoặc đạt mục tiêu): xem Flow 9, màn 9.4. Nội dung riêng cho lần đầu: "+XP", huy hiệu "Khởi đầu", **chuỗi ngày bắt đầu: 1**.
5. **1.5 Giới thiệu lộ trình.** Thẻ "Học có hệ thống với Lộ trình HSK 1" (xem trước vài chặng) · nút "Xem lộ trình" / "Để sau".
6. **1.6 Mời lưu tiến độ.** "Đăng nhập Google để không mất tiến độ và đặt nhắc học" · nút "Đăng nhập với Google" / "Để sau".
7. → **Hôm nay** (Flow 2).

## Flow 2. Vòng hằng ngày
1. **2.1 Hôm nay (trang chủ).** Từ trên xuống:
   - **Việc nổi bật duy nhất** (một thẻ lớn, một nút): tùy trạng thái là "Ôn 14 thẻ đến hạn" / "Tiếp tục bài đang nghe: 〈tên bài〉 (62%)" / "Tiếp tục chặng 3: Số đếm" / "Học bài hôm nay".
   - **Nhiệm vụ ngày** (3 nhiệm vụ, thanh tiến độ, rương): ví dụ "Ôn 10 thẻ", "Nghe 1 bài", "Đọc to 1 câu".
   - **Chuỗi ngày + XP + cấp** (thanh XP tới cấp kế).
   - **Gợi ý hôm nay:** vài video/bài hợp level. Ô "Dán link bài hát".
   - **Trạng thái:** người mới (chưa có gì: ưu tiên "Học bài đầu tiên") · đang học · **đã xong mọi việc hôm nay** ("Bạn đã hoàn thành hôm nay! Muốn học thêm?" + gợi ý) · chuỗi sắp mất (nhắc nhẹ, không hù dọa) · chưa đăng nhập (banner mời lưu tiến độ).
2. Chạm việc nổi bật → vào hoạt động tương ứng (Flow 3/5/6) → khi xong → **màn thưởng (9.4)** → quay về **Hôm nay** với tiến độ nhiệm vụ cập nhật.
3. **2.2 Nhiệm vụ & rương.** Danh sách nhiệm vụ ngày và tuần; mỗi nhiệm vụ: biểu tượng, mô tả, tiến độ (2/3), phần thưởng (XP, đóng băng chuỗi). Trạng thái: đang làm · xong chưa nhận (nút "Nhận") · đã nhận. Chạm nhiệm vụ → đi tới hoạt động tương ứng.

## Flow 3. Bài hát: dán link → học
1. **3.1 Dán link.** Ô nhập "Dán link YouTube của bài hát…" (nút "Dán" từ clipboard trên mobile), nút "Phân tích". Lỗi định dạng hiện ngay dưới ô. Bên dưới: bài đã phân tích gần đây, lối vào Thư viện.
2. **3.2 Đang phân tích.** Ảnh bìa + tên bài hiện ngay; 3 bước có trạng thái (Lấy lời → Phân tích từ vựng → Chuẩn bị bài học); nút "Hủy"; chờ 5-25 giây: nội dung xuất hiện dần (khung xương → thẻ thật). Bài đã có sẵn thì bỏ qua màn này.
   - **3.2a Lỗi:** video không có lời (gợi ý tìm bản "lyrics video") · không phải tiếng Trung · không cho nhúng · hết lượt phân tích hôm nay (xem 0.2) · lỗi mạng. Mỗi lỗi: 1 câu giải thích, 1 hành động.
3. **3.3 Xem trước.** Ảnh bìa, tên bài (chữ Hán + pinyin + tên Việt), tóm tắt 2-3 câu, nhãn cảm xúc, thời lượng, **"Bạn hiểu x% bài này"**. Nút chính "Bắt đầu nghe" (dính đáy trên mobile). Thanh lọc level + "Đã ẩn 3 mục dưới level của bạn · Hoàn tác". Hai nhóm: **Từ vựng** (8-12 thẻ, mỗi thẻ: thẻ từ + nút nghe đoạn "0:05 · 2 lần") và **Ngữ pháp** (3-5 thẻ: công thức, giải thích, ví dụ, "Người Việt hay sai"). Mỗi thẻ: Lưu, Đã biết (có Hoàn tác), menu ⋯ (Báo sai).
4. **3.4 Nghe (màn quan trọng nhất).** Gồm: trình phát video nhúng · thanh tiến độ · hàng điều khiển (Phát/Dừng, **tốc độ** 0,5-2×, **Lặp câu**, bật/tắt **Pinyin**, bật/tắt **Dịch**) · **danh sách lời**: mỗi dòng có mốc giờ (chạm để nhảy), pinyin phía trên, chữ Hán, nghĩa Việt phía dưới; **dòng đang hát** to hơn và nổi, tự cuộn vào giữa (có thể tắt tự cuộn); từ vựng đã xem trước được tô, ngữ pháp được gạch chân; **mọi từ chạm được** để tra · khu **"Từ trong bài / Đang hát"**.
   - Mobile: video ghim trên, lời ở giữa, **bottom sheet** dưới cùng (chip các mục của câu đang hát, kéo lên xem hết). Tablet: video + lời hai cột. Desktop: **ba vùng** (video + điều khiển | lời | từ trong bài) + phím tắt.
   - Thao tác phụ trên mỗi dòng: Hỏi AI về câu · Giải thích cả câu · Luyện nói câu · Chia sẻ câu thành ảnh · Gợi ý sửa dịch · Báo sai. Chỉnh lệch lời (nếu lời lệch nhạc).
   - **Trạng thái:** đang phát · tạm dừng · đang lặp câu · hết bài · mất kết nối video · hết lượt AI (khi hỏi AI).
5. **3.5 Tra từ** (popover desktop / bottom sheet mobile) mở khi chạm từ: chữ Hán, pinyin, **Hán Việt**, cấp HSK, nghĩa trong câu này, nghĩa từ điển, ví dụ, nút nghe, **Lưu**, **Đã biết**. Chữ + pinyin hiện trước, phần nghĩa là khung xương khi đang tải. Nhạc không tự dừng (tùy chọn).
6. **3.6 Luyện nói một câu** (từ dòng lời): nút ghi âm, nghe giọng mẫu, nhận xét AI (điểm, chữ cần sửa, gợi ý), nghe lại giọng mình.
7. **3.7 Tổng kết bài.** "Bạn vừa học xong 〈tên bài〉": số từ đã lưu, số mục đã biết, vòng tròn "Hiểu 78% từ vựng", XP nhận. Nút chính "Ôn ngay 6 thẻ"; phụ "Nghe lại" · "Bài mới". → màn thưởng 9.4.

## Flow 4. Video luyện nghe
1. **4.1 Danh sách video.** Lưới thẻ video (hình, tên, kênh, độ dài, cấp HSK trung bình, tim yêu thích). **Bộ lọc:** cấp HSK · thẻ chủ đề (Hoạt hình, Vlog, Đời sống, Du lịch, Hài, Thiếu nhi, Phim ngắn, Podcast, Bài học tiếng Trung) · Yêu thích · tìm kiếm · công tắc "Nhóm theo kênh". Chạm kênh → **4.2 Trang kênh** (danh sách video của kênh). Nút "Thêm video".
2. **4.3 Xem video (3 tab dùng chung một trình phát):**
   - **Tab Phụ đề:** danh sách lời chạy theo giờ như màn Nghe (3.4): pinyin ruby trên chữ Hán, nghĩa Việt, chạm từ để tra (3.5), Hỏi AI về câu, báo bản dịch sai ("AI sẽ dịch lại câu này").
   - **Tab Nghe – chép:** phát một câu rồi dừng; ô gõ (pinyin hoặc chữ Hán); nút Gợi ý; **Kiểm tra** → chấm từng chữ/âm tiết (đúng/sai/thiếu); lưới tiến độ nhảy tới câu bất kỳ; tổng kết cuối. Trạng thái: chưa làm · đúng · sai · bỏ qua.
   - **Tab Luyện nói:** chọn câu → nghe mẫu → ghi âm → **nhận xét AI** (điểm, lỗi, gợi ý) và nghe lại giọng mình; lịch sử các lần thử của câu.
3. **4.4 Thêm video.** Hai cách: (a) dán link + dán phụ đề tiếng Trung; (b) **"Nhờ AI nghe"** khi video không có phụ đề (chỉ tài khoản Google; hiện tiến độ từng đoạn "Đã nghe 5/14", có thể thử lại). Lỗi: video không nhúng được · quá dài/quá ngắn · hết lượt · đã có trong kho (mở luôn). Thành công → mở video.

## Flow 5. Lộ trình HSK (khu "Học")
1. **5.1 Bản đồ lộ trình.** Tiêu đề "Lộ trình HSK 1"; **tiến độ** ("12/36 chặng", thanh %); nút chính "Tiếp tục chặng 13: 〈tên〉"; **danh sách/đường đi các chặng** (36 chặng, theo chủ đề: Đại từ cơ bản, Hỏi và đáp, Số đếm, Gia đình, Thời gian, Ăn uống, Phương hướng, Địa điểm, Đi lại, Học tập, Hành động, Tính từ, Cơ thể và thời tiết, Đồ vật…). Mỗi chặng: số thứ tự/✓, tên, "17 từ: 我 · 你 · 他…", trạng thái (đã xong + điểm · đang học · chưa học). **Không khóa cứng**: vào chặng nào cũng được. Chọn khóa/cấp khi có nhiều (HSK 1-6; sau này: Tình huống, Tập viết).
2. **5.2 Một chặng — 3 bước** (thanh bước 1-2-3):
   - **Bước 1 – Làm quen.** Mỗi từ một thẻ (chữ Hán, pinyin, Hán Việt, nghĩa Việt, nghe). Nút **"Lưu cả nhóm vào bộ ôn"** (đổi thành "Đã lưu cả nhóm"). Nút "Nghe trong câu thật".
   - **Bước 2 – Nghe trong câu thật.** Mỗi từ kèm một câu thật từ video: câu Hán (từ đích tô đậm), pinyin, nghĩa Việt, nút nghe, liên kết "Xem trong video". Nút "Làm bài kiểm tra".
   - **Bước 3 – Kiểm tra (10 câu).** Ba kiểu xoay vòng: *chữ Hán → chọn nghĩa* · *nghĩa → chọn chữ Hán* · *nghe → chọn chữ Hán*. 4 lựa chọn; chọn xong hiện đúng/sai ngay + đáp án; "Câu tiếp".
3. **5.3 Kết quả chặng.** Phần trăm, "Hoàn thành chặng!" (≥ 70%) hoặc "Chưa đạt 70%, ôn lại rồi thử nữa"; XP nhận. Nút: "Chặng tiếp theo" · "Học lại chặng" · "Về lộ trình". → màn thưởng 9.4 nếu hoàn thành.
4. *(Về sau, cùng khung này)* **Bài tình huống** (10 tình huống: chào hỏi, giới thiệu, gọi món, mua sắm, hỏi đường, taxi, khách sạn, bệnh viện, điện thoại, đi làm): nghe hội thoại → xem từng câu → đọc theo vai (chấm từng chữ) → ôn nhanh. **Tập viết chữ Hán**: xem thứ tự nét → vẽ theo gợi ý → vẽ tự do (chấm nét). **Kiểm tra xếp lớp**: 12 câu → gợi ý level.

## Flow 6. Ôn tập (khu "Ôn & Nói")
1. **6.1 Ôn thẻ.** Hiện số thẻ đến hạn. **Mặt trước:** chữ Hán lớn, nút nghe đoạn gốc (hoặc giọng đọc), tên bài nhỏ. **Mặt sau** (chạm để lật): pinyin, Hán Việt, nghĩa, ghi chú ngữ cảnh, ví dụ. **4 nút chấm:** Quên · Khó · Được · Dễ, mỗi nút ghi lần ôn tiếp theo ("1 ngày", "3 ngày"…). Thanh tiến độ phiên "8/14". Hoàn tác lần chấm cuối. Thẻ ngữ pháp: mặt trước là câu ví dụ bị khuyết cấu trúc; mặt sau là công thức + giải thích.
   - **Kết thúc phiên:** số thẻ đã ôn, XP, chuỗi ngày; nút "Học thêm thẻ mới" / "Chơi mini-game". **Trạng thái rỗng:** chưa có thẻ ("Lưu từ khi nghe bài hát hoặc học chặng") · hôm nay đã ôn xong.
2. **6.2 Chọn chế độ trò chơi** (dải tab): *Ôn thẻ · Gõ pinyin · Điền lời · Ghép cặp · Nghe và chọn · Karaoke · Đọc to · Xếp hạng*. Mỗi chế độ là một phiên ngắn có tổng kết (điểm, đúng/sai, XP):
   - **Gõ pinyin:** hiện chữ Hán + nghe → gõ pinyin (chấp nhận có dấu hoặc số thanh; báo "đúng âm, thiếu thanh").
   - **Điền lời:** dòng lời bị khuyết từ → chọn từ đúng.
   - **Ghép cặp:** ghép 6 cặp chữ Hán ↔ nghĩa.
   - **Nghe và chọn:** nghe → chọn chữ hoặc nghĩa đúng.
   - **Karaoke điền lời:** nhạc chạy, dừng ở chỗ trống, điền rồi hát tiếp.
   - **Đọc to:** chọn từ đã lưu → nghe mẫu → ghi âm → điểm từng chữ.
3. **6.3 Bảng xếp hạng.** Theo chế độ và khoảng thời gian (tuần/tháng/mọi lúc); hàng của mình được tô; yêu cầu đặt biệt danh + ảnh đại diện lần đầu.

## Flow 7. Luyện phát âm (khu "Ôn & Nói")
1. **7.1 Hub phát âm.** Thẻ vào: *Bài 5 phút mỗi ngày · Lộ trình phát âm 6 bước · Bảng pinyin · Luyện thanh điệu · Đọc to chấm điểm · Nghe đoán thanh · Thử thách 绕口令*.
2. **7.2 Bảng pinyin.** Tab *Phụ âm đầu · Vần · Lỗi hay gặp*; mỗi âm một thẻ (ký hiệu, mẹo phát âm so với tiếng Việt, hai ví dụ bấm để nghe).
3. **7.3 Luyện thanh điệu.** Chọn thanh 1-4; hiện chữ mẫu + pinyin; "Nghe mẫu"; **ghi âm**; kết quả: **biểu đồ đường cao độ** (nét đứt = mẫu, nét liền = giọng bạn) + lời khuyên ("Giọng bạn đang đi lên, thanh 4 phải xuống mạnh"); "Chữ khác". Trạng thái: chưa cho phép micro · đang ghi · không nghe rõ.
4. **7.4 Đọc to chấm điểm.** Chọn một câu mẫu hoặc tự nhập (≤ 40 chữ Hán) → nghe mẫu → ghi âm → **điểm chung /100** + **từng chữ** (màu + nhãn "tốt/tạm được/cần luyện" + điểm; chữ bị bỏ sót ghi "thiếu") + tối đa 3 gợi ý sửa. Lỗi: không nghe thấy giọng · hết lượt (0.2).
5. **7.5 Nghe đoán thanh.** 8 câu: nghe một âm tiết → chọn thanh 1-4 → đúng/sai + đáp án → kết quả cuối (x/8) + "Chơi lại".
6. **7.6 Thử thách 绕口令.** Danh sách câu theo độ khó (kèm điểm cao nhất của mình) → đọc/ghi âm → chấm từng chữ → **thẻ chia sẻ ảnh** ("Tôi đọc được 88 điểm") → "Chia sẻ điểm".
7. **7.7 Bài 5 phút mỗi ngày.** 3 bước: nghe đoán 4 thanh → đọc một câu → đọc một 绕口令; xong hiện chuỗi ngày + XP.

## Flow 8. Thi đấu (khu "Chơi")
1. **8.1 Hub thi đấu.** Tạo phòng · Nhập mã phòng · Tạo thử thách · Lịch sử ván · (Giải đấu tuần: thẻ nhãn **"Sắp có"**).
2. **8.2 Tạo phòng.** Chọn bài/video, tùy chọn hiện nghĩa dòng lời; → mã phòng 6 số + liên kết mời (sao chép/chia sẻ).
3. **8.3 Phòng chờ.** Danh sách người chơi (biệt danh + ảnh đại diện), mã/link, nút "Bắt đầu" (chủ phòng), trạng thái chờ đối thủ.
4. **8.4 Ván chơi (10 câu).** Mỗi câu: lời bị khuyết từ + (đoạn nghe) + 4 lựa chọn; đồng hồ; **bảng điểm hai người** cập nhật; phản hồi đúng/sai ngay.
5. **8.5 Kết quả.** Thắng/thua/hòa, điểm hai bên, từng câu (xem lại), XP; nút **"Lưu các từ trả lời sai"**, "Đấu lại", "Về hub".
6. **8.6 Lịch sử.** 50 ván gần nhất → chạm để xem lại từng câu.
7. **8.7 Thử thách qua link.** Người tạo chọn bộ câu → nhận link; người nhận mở link → (đặt biệt danh nếu chưa) → chơi → **bảng điểm** của mọi người đã chơi; nút chia sẻ.

## Flow 9. Game hóa và hồ sơ
1. **9.1 Hồ sơ người chơi.** Ảnh đại diện + biệt danh, **cấp + thanh XP**, chuỗi ngày hiện tại/dài nhất, số liệu (từ đã học, bài đã nghe, chặng đã xong), huy hiệu nổi bật, lối tới Cài đặt/Đăng nhập.
2. **9.2 Bộ sưu tập huy hiệu.** Lưới huy hiệu theo nhóm (Học · Chuỗi ngày · Nghe · Nói · Thi đấu); trạng thái **đã mở / chưa mở (mờ + gợi ý cách mở) / hiếm / ẩn**; chạm → chi tiết (cách đạt, ngày mở, bậc).
3. **9.3 Chuỗi ngày.** Lịch tuần/tháng đánh dấu ngày đã học; cột mốc (3/7/30/100 ngày); **đóng băng chuỗi** (số lượng đang có, cách kiếm bằng nhiệm vụ); nút chia sẻ chuỗi (thẻ ảnh).
4. **9.4 Màn thưởng** (hiện sau khi xong một hoạt động; **ngắn, có thể bỏ qua**). Biến thể: *hoàn thành bài/chặng* (XP + lý do) · *lên cấp* · *huy hiệu mới* · *chuỗi ngày mốc mới* · *lần đầu tiên (Flow 1.4)*. Mỗi biến thể: tiêu đề vui, phần thưởng, thanh XP chạy, nút "Tiếp tục" và (tùy) "Chia sẻ".
5. **9.5 Giải đấu tuần.** *Chưa làm bây giờ*: chỉ thiết kế thẻ nhãn "Sắp có" trong Hub thi đấu và Hôm nay.

## Flow 10. Thư viện và tìm kiếm (khu "Nghe")
1. **10.1 Thư viện** — hai tab: **Bài hát** (lưới bìa + tiến độ; lọc cấp HSK, cảm xúc, Yêu thích; tìm kiếm; xóa bài của mình) và **Từ đã lưu** (danh sách thẻ từ: tìm kiếm, lọc cấp/loại/bài; chạm thẻ → chi tiết + nghe lại đoạn gốc; xóa thẻ).
2. **10.2 Khám phá.** Gợi ý bài/video theo cảm xúc hoặc chủ đề; bài mới.
3. **Trạng thái rỗng:** chưa có bài ("Dán link bài hát đầu tiên") · chưa có từ ("Lưu từ khi nghe bài hát hoặc học chặng").

## Flow 11. Tài khoản và cài đặt
1. **11.1 Đăng nhập Google** (từ lời mời, hồ sơ hoặc khi dùng tính năng cần tài khoản). Giải thích lợi ích ("đồng bộ giữa thiết bị, nhận thêm lượt AI"). Nếu đang có dữ liệu ẩn danh: **11.2 Gộp tài khoản** — xác nhận "Gộp dữ liệu hiện tại vào tài khoản Google" (thẻ, tiến độ, điểm) → thành công/lỗi.
2. **11.3 Cài đặt**, nhóm: **Học** (level HSK, số thẻ mới mỗi ngày, mục tiêu ngày 5/10/20/30) · **Nghe** (mặc định pinyin/dịch/tự cuộn, cỡ khung video) · **Giọng đọc** (giọng AI hay giọng thiết bị) · **Nhắc học** (thông báo đẩy, email, giờ nhắc) · **Hồ sơ** (biệt danh, ảnh đại diện) · **Tài khoản** (đăng nhập/đăng xuất) · **Xóa toàn bộ dữ liệu** (xác nhận 2 bước).
3. **11.4 Cài app lên điện thoại.** Hướng dẫn từng bước (iPhone/Safari; Android/Chrome; nút cài một chạm), cảnh báo khi mở trong trình duyệt của Zalo/Facebook ("Mở bằng Safari/Chrome để cài").

## Flow 12. Cộng đồng
1. **12.1 Chat cộng đồng.** Luồng tin nhắn (biệt danh, ảnh, nội dung, giờ), ô soạn, báo cáo/chặn người dùng, thông báo của quản trị. Yêu cầu đăng nhập Google để gửi. Chuông thông báo ở thanh trên.
2. **12.2 Góp ý.** Gửi góp ý + xem tường góp ý.

## Flow 13. Chia sẻ
Các **thẻ ảnh chia sẻ** (tạo ngay trên thiết bị): *chuỗi ngày* · *câu hát/dòng lời* (chữ Hán, pinyin, nghĩa Việt, tên bài) · *điểm 绕口令* · *huy hiệu/cấp mới*. Mỗi thẻ có màn xem trước + nút "Chia sẻ" (mở bảng chia sẻ của điện thoại; máy tính: tải ảnh / sao chép liên kết / nút mạng xã hội). **Nhận chia sẻ:** mở link từ YouTube/hệ điều hành → app nhận link và vào Flow 3.1.

## Flow 14. Trang công khai (không cần đăng nhập)
1. **14.1 Trang giới thiệu:** hero (dán link dùng thử ngay), cách hoạt động 4 bước, tính năng, so sánh trước/sau, FAQ, kêu gọi "Bắt đầu miễn phí".
2. **14.2 Công cụ miễn phí:** *Chữ Hán → pinyin + Hán Việt* (dán văn bản, bật/tắt từng lớp, sao chép) · *Từ vựng HSK 1-6* (bảng theo cấp, tìm kiếm không dấu, tải CSV) · các công cụ phát âm (Flow 7, bản công khai).

---

## Phụ lục: sơ đồ luồng tổng

```
Người mới → 1.1 Level → 1.2 Chọn bài mẫu → 3.4 Nghe → 9.4 Thưởng → 1.5 Lộ trình? → 1.6 Đăng nhập? → 2.1 Hôm nay
Hôm nay → [Ôn thẻ 6.1] [Tiếp chặng 5.2] [Tiếp bài 3.4] [Nhiệm vụ 2.2] → 9.4 Thưởng → Hôm nay
Nghe: 3.1 Dán link → 3.2 Phân tích → 3.3 Xem trước → 3.4 Nghe ⇄ 3.5 Tra từ / 3.6 Luyện nói → 3.7 Tổng kết → 6.1 Ôn
Video: 4.1 Danh sách → 4.3 [Phụ đề | Nghe-chép | Luyện nói]; 4.4 Thêm video → 4.3
Học: 5.1 Bản đồ → 5.2 Chặng (3 bước) → 5.3 Kết quả → 5.1
Ôn & Nói: 6.1 Ôn thẻ ⇄ 6.2 Trò chơi → 6.3 Xếp hạng; 7.1 Phát âm → 7.2…7.7
Chơi: 8.1 Hub → 8.2 Tạo phòng → 8.3 Chờ → 8.4 Ván → 8.5 Kết quả → 8.6 Lịch sử; 8.7 Thử thách (link)
Hồ sơ: 9.1 ⇄ 9.2 Huy hiệu ⇄ 9.3 Chuỗi ngày; 11.3 Cài đặt
```

## Dữ liệu mẫu để vẽ
- **Người dùng:** biệt danh "Linh", cấp 7, 340 XP/400, chuỗi 5 ngày, HSK 3, 14 thẻ đến hạn, nhiệm vụ ngày 1/3 xong.
- **Bài hát hư cấu:** 夜车 (Yèchē · Chuyến tàu đêm), 6 câu: 窗外的城市慢慢睡了 · 我从来没想过会离开 · 你的笑比星光还亮 · 就算路再远我也不怕 · 把回忆放进口袋里 · 等天亮了我们再出发. Từ vựng: 城市 (thành thị), 从来 (tòng lai), 离开 (ly khai), 星光 (tinh quang), 回忆 (hồi ức), 口袋 (khẩu đại), 天亮 (thiên lượng), 出发 (xuất phát).
- **Chặng HSK 1 mẫu:** "Đại từ cơ bản" — 我 (tôi) · 你 (bạn) · 他 (anh ấy) · 她 (cô ấy) · 我们 (chúng tôi) · 你们 (các bạn) · 这 (này) · 那 (kia).
- **Video mẫu:** "Cuộc trò chuyện mẫu" (kênh thử, 1:30, cấp HSK 1,5), 3 câu: 你好，朋友。· 今天天气很好。· 我们去公园吧。
- Không dùng lời bài hát thật hay ảnh nghệ sĩ thật.
