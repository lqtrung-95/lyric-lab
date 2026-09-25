---
title: M3 — Ôn tập FSRS + tài khoản ẩn danh/Google + giới hạn theo tài khoản
status: draft — chờ user duyệt
created: 2026-09-25
refs: docs/PRD.md §6.4 (RV-01..03), §6.5 (AC-01..04), §7 (rate limit), §8.2 (bảng user_*); design/S2-*, S7-*, settings-*; CLAUDE.md quy tắc 4, 6, 8, 9
---

# M3 — Ôn tập + tài khoản

Mục tiêu (PRD §10): toàn bộ P0 của 6.4–6.5 đạt. Đồng thời đóng rủi ro "URL công khai chưa có giới hạn theo tài khoản" (PRD §7: 10 bài mới/ngày ẩn danh, 30 đã đăng nhập).

## Thiết kế đã có / còn thiếu
Đã tải vào `design/`: S2 Onboarding, S7 Ôn tập (desktop + mobile), Cài đặt. **Chưa có thiết kế:** S8 Tổng kết bài, S9 Thư viện, trang tài khoản/xóa dữ liệu → tự thiết kế cùng hệ token, user duyệt khi xem.

## Khác biệt thiết kế ↔ PRD (đề xuất, cần user chốt)
| Thiết kế có | PRD / thực tế | Đề xuất |
|---|---|---|
| S2: chọn "sở thích giai điệu" (ballad, OST, cổ phong…) | Không dùng vào thuật toán nào | **Bỏ** (YAGNI); giữ chọn level + mục tiêu thẻ mới/ngày |
| S2: mục tiêu "15 phút/ngày" | RV-02: tối đa 20 thẻ mới/ngày, chỉnh được | Đổi thành số thẻ mới/ngày (5/10/20/30), mặc định 20 |
| S2: "Hơn 1.200 bài tuyển chọn" | Không có kho bài tuyển chọn | Bỏ dòng này (sai sự thật) |
| Cài đặt: nhắc học 20:30, xuất CSV Anki, sao lưu Google Drive, cỡ chữ phụ đề, hạ âm lượng khi tra từ | Nhắc/xuất Anki/Drive không thuộc MVP (RV-06 là P2) | Bỏ ở M3; giữ: level, thẻ mới/ngày, pinyin/Hán Việt/dịch, tốc độ mặc định, giao diện sáng/tối, tài khoản & xóa dữ liệu |
| S7: nhãn khoảng thời gian trên 4 nút (10 phút/1 ngày/3 ngày/7 ngày) | FSRS tính khoảng theo từng thẻ | Hiện khoảng thật do FSRS tính, không cố định |
| "Đã tự động sao lưu" ở Cài đặt | Dữ liệu ở Supabase | Hiện trạng thái đồng bộ thật |
| Streak | v1.1 | Ẩn |

## Kiến trúc
- **Auth:** Supabase Anonymous Sign-in ngay lần đầu vào app (AC-01); session cookie qua `@supabase/ssr` (proxy đã có). Server lấy user từ `supabase.auth.getUser()`.
- **Google (AC-02):** `linkIdentity('google')` nâng cấp chính user ẩn danh lên tài khoản thật → **giữ nguyên `user_id`, không cần gộp dữ liệu**. Trường hợp Google đó đã có tài khoản khác (link thất bại): đăng nhập vào tài khoản đó rồi **gộp dữ liệu ẩn danh** bằng hàm SQL `merge_user_data(from, to)` (chỉ service role gọi), xác thực quyền sở hữu bằng mã một lần cấp trước khi chuyển hướng.
- **Dữ liệu (RLS theo `auth.uid()`, mọi bảng):** `user_profiles` (level, thẻ mới/ngày, timezone, onboarded), `user_known_terms`, `user_cards` (khóa `item_key`, ảnh chụp tối thiểu: term, pinyin, Hán Việt, cấp, nghĩa; **không lưu lời bài hát** — lời lấy từ cache toàn cục khi ôn, nên gỡ bài theo DMCA thì thẻ không còn lời), cột FSRS (due, stability, difficulty, state, reps, lapses, last_review), `review_logs`, `user_song_progress`.
- **FSRS:** thư viện `ts-fsrs` 5.4 (MIT); tính lịch phía client rồi ghi thẻ + log qua supabase-js (RLS bảo vệ). Hàng đợi: thẻ đến hạn (cũ nhất trước) + thẻ mới tới hạn mức/ngày, ranh giới ngày theo timezone của người dùng.
- **Hook `useLearnerState` giữ nguyên API**, đổi nền sang Supabase (cache localStorage cho lần vẽ đầu); nhập dữ liệu localStorage cũ (level, đã biết, đã lưu) một lần khi có session.
- **Giới hạn tần suất theo tài khoản:** đếm bài mới phân tích trong 24 giờ theo `user_id` trong `/api/analyze` (10 ẩn danh / 30 đã đăng nhập) + giữ trần theo IP; `/api/explain` tương tự. Rủi ro: tạo hàng loạt tài khoản ẩn danh để lách → bật **captcha (Cloudflare Turnstile) cho anonymous sign-in** trước khi công khai.

## Phases
| # | Phase | Nội dung | Ước lượng |
|---|---|---|---|
| 1 | Nền tài khoản + giới hạn | Migration 5 (bảng `user_*` + RLS + hàm gộp), đăng nhập ẩn danh tự động, `getCurrentUser` server, đếm/giới hạn theo `user_id` ở `/api/analyze` và `/api/explain`, test RLS thật bằng 2 user (A không đọc/sửa được dữ liệu B) | 1,5 ngày |
| 2 | Lớp dữ liệu người dùng | Repo `lib/user-data/*`, `useLearnerState` chạy trên Supabase (đã biết/lưu/level), nhập localStorage cũ, "Lưu" tạo thẻ FSRS trạng thái New | 1,5 ngày |
| 3 | FSRS + hàng đợi | Bọc `ts-fsrs` (`lib/srs/`), dựng hàng đợi (đến hạn + mới theo hạn mức, timezone), ghi log, hoàn tác thẻ vừa chấm; test kỹ (biên ngày, tràn hạn mức, thẻ mới/học lại) | 1 ngày |
| 4 | Màn Ôn tập S7 (RV-01, RV-02) | Thẻ mặt trước/sau, 4 nút Quên/Khó/Được/Dễ (phím 1–4, Space lật), khoảng thời gian thật, nghe lại đúng câu (khung video hiển thị như S4), lời câu lấy từ cache, hết thẻ, số thẻ đến hạn ở nav + thẻ "Hôm nay" ở trang chủ | 2 ngày |
| 5 | Onboarding + Cài đặt + Google + xóa dữ liệu (AC-02, AC-04) | S2 rút gọn, trang cài đặt, đăng nhập Google (link + gộp khi trùng), đăng xuất, "Xóa toàn bộ dữ liệu" (xóa hàng của user + tài khoản) | 2 ngày |
| 6 | Thư viện + tổng kết + E2E (AC-03, RV-03) | S9 lịch sử bài + danh sách từ đã lưu, S8 tổng kết sau khi nghe hết bài, tiến độ bài (`user_song_progress`), E2E/a11y cho màn mới | 1,5 ngày |

Phụ thuộc: 1 → 2 → 3 → 4; 5 song song sau 2; 6 sau 4.

## Việc user phải làm (mình không làm thay được)
1. **Supabase → Authentication → Providers:** bật **Anonymous sign-ins** (trước phase 1).
2. **Google OAuth** (trước phase 5): tạo OAuth client trong Google Cloud Console (màn hình đồng ý + Web client), dán Client ID/Secret vào Supabase → Providers → Google; thêm URL callback của Supabase vào Google, và **Site URL + Redirect URLs** (`https://lyric-lab-indol.vercel.app`, `http://localhost:3000`) trong Supabase → Authentication → URL Configuration.
3. Chạy migration 5 (và 6 nếu có) trong SQL Editor như các lần trước.
4. (Trước khi công khai) Bật captcha Turnstile cho anonymous sign-in: cần site key/secret từ Cloudflare.

## Rủi ro
- Người dùng xóa cookie/dùng ẩn danh mới → mất thẻ (ẩn danh không khôi phục được): nhắc "Đăng nhập Google để giữ thẻ" ở lần lưu thẻ đầu tiên và trong Cài đặt.
- Nhiều bài mới cùng lúc vẫn nghẽn ở Groq gói miễn phí (~1 bài/phút): nâng gói trước khi công khai (ngoài phạm vi M3).
- Đăng nhập Google chỉ chạy đúng trên domain đã khai báo; test local dùng `localhost` riêng.
- FSRS mặc định (tham số chuẩn, retention 0,9); chưa tối ưu tham số theo người dùng (cần đủ log, để sau).

## Ngoài phạm vi M3 (đã cắt có chủ đích)
Nhắc học/thông báo, xuất Anki (RV-06), luyện điền từ (RV-04), shadowing (RV-05), streak, đồng bộ Google Drive, cỡ chữ phụ đề, chấm level bằng bài kiểm tra 2 phút.

## Câu hỏi cần user chốt
1. Đồng ý **bỏ "sở thích giai điệu"** và các mục cài đặt ngoài MVP như bảng trên?
2. Mục tiêu thẻ mới/ngày mặc định **20** (PRD) hay **15** (thiết kế)?
3. Đăng nhập Google khi tài khoản Google đó đã có dữ liệu: **gộp** dữ liệu ẩn danh vào (đúng AC-02, phức tạp hơn) hay chỉ **đăng nhập và bỏ** dữ liệu ẩn danh?
4. Bật **captcha Turnstile** cho đăng nhập ẩn danh (khuyến nghị trước khi công khai)?
5. "Lưu" một từ **tạo thẻ ôn ngay** (vào hàng đợi theo hạn mức thẻ mới/ngày), đúng không?
