# Linh vật đồng hành (Pet) — bản thử nhỏ

Trạng thái: ĐÃ DUYỆT, "làm hết" (2026-10-29). Xong: logic, lưu trữ, 5 loài × 3 giai đoạn × 3 tâm trạng có hoạt ảnh, nhận nuôi, thẻ trang chủ. Còn lại: xem mục "Việc còn lại". Mục tiêu: thêm lý do quay lại mỗi ngày + cảm giác sở hữu, KHÔNG thêm game mới. Bản thử chỉ 1 pet, 3 giai đoạn, nối vào XP/chuỗi ngày có sẵn. Xem rồi mới quyết định mở rộng.

## Nguyên tắc
- Không đếm XP hai lần: "thức ăn" của pet = XP đã có trong sổ cái (`lib/game`, suy ra từ bảng sự kiện). Pet chỉ đọc, không ghi XP.
- Tiến hóa dựa trên tổng XP + chuỗi ngày (đã có), không phạt nặng: pet không chết, chỉ "ngủ" khi bỏ vài ngày (tôn trọng chế độ bù chuỗi `streak-freeze`).
- Phần thưởng chỉ là mở khóa nhìn (hình dạng, phụ kiện), không pay-to-win, không ngẫu nhiên kiểu cờ bạc.
- Hình là SVG tự vẽ như sprite cảnh/vụ án hiện có. Không đụng giao diện chung (bài học từ lần restyle trước: giữ nhỏ).

## Bản thử (MVP)
1. Nhận nuôi: chọn 1 trong 5 loài (rồng con, mèo, cún, gấu trúc, cú), đặt tên. Lưu 1 lần.
2. Ba giai đoạn: Trứng/con non → thiếu niên → trưởng thành. Ngưỡng theo tổng XP (đề xuất 0 / 300 / 1500), xem lại sau khi so với đường cong cấp `levels.ts`.
3. Trạng thái trong ngày: "đói / no / vui" theo tiến độ mục tiêu ngày (`daily-goal`). Đạt mục tiêu = pet no + câu nói ngắn (tiếng Trung + nghĩa Việt, từ bộ từ đã học).
4. Thẻ ở trang chủ (cạnh vòng mục tiêu ngày) bấm vào xem pet; có tiếng thưởng khi tiến hóa (dùng `reward-sound`).
5. Phụ kiện: 3 món mở khóa bằng mốc có sẵn (huy hiệu, mốc chuỗi `milestones`). Chỉ hiển thị.

Ngoài phạm vi: bạn bè ghé thăm, trang trí nhà, nhiều pet, thông báo đẩy, gắn pet với bài hát cụ thể, cửa hàng.

## Dữ liệu
- Bảng mới `user_pet` (user_id PK, species, name, adopted_at, updated_at; phụ kiện tính từ chuỗi dài nhất nên không lưu), RLS chủ sở hữu, giống `user_explore_state`. Migration người dùng chạy tay.
- Chưa đăng nhập/chưa chạy migration: lưu localStorage, đồng bộ khi có tài khoản (mẫu `explore-state-repo.ts`).
- Giai đoạn, trạng thái ngày KHÔNG lưu: tính từ XP + `daily-goal` mỗi lần mở.

## Phần code (dự kiến)
- `lib/pet/pet-logic.ts` (+ test): ngưỡng giai đoạn, trạng thái đói/no/ngủ, mở khóa phụ kiện. TS thuần.
- `lib/pet/pet-repo.ts`: đọc/ghi Supabase + localStorage.
- `components/pet/pet-sprite.tsx`, `adopt-pet.tsx`, `pet-card.tsx`; gắn vào `components/home/`.
- Cập nhật 4 tài liệu bàn giao + migration + `docs/operations-runbook.md`.

## Giai đoạn
1. Logic + test + repo (không UI). Dừng.
2. Sprite SVG: một loài × 3 giai đoạn trước, duyệt rồi mới vẽ 4 loài còn lại + màn nhận nuôi + thẻ trang chủ. Dừng, bạn xem trên 3210.
3. Phụ kiện + tiếng + tài liệu. Chỉ làm nếu bản 2 được.

## Cách đo "có đáng không"
Chưa có dữ liệu thật, nên dùng chỉ số đã có: tỉ lệ người dùng hoàn thành mục tiêu ngày và số ngày hoạt động liên tiếp, so trước/sau khi bật pet (nếu `lib/analytics` đủ sự kiện).

## Rủi ro
- Hình pet xấu/thiếu hồn: làm sprite thử 1 loài trước, bạn duyệt rồi mới vẽ thêm.
- Pet "ngủ" gây áp lực: giữ giọng nhẹ, không dùng chữ "chết/đói khổ", có bù chuỗi.
- Thêm một thẻ vào trang chủ vốn đã đông: đặt thay vì thêm, hoặc gộp vào cạnh vòng mục tiêu.

## Đã chốt
- Loài: rồng, mèo, cún, gấu trúc, cú (con vật dễ thương nào cũng được).
- Ngưỡng 300/1500 XP: ước lượng 15 phút/ngày ≈ 40–60 XP → giai đoạn 2 sau ~1 tuần, giai đoạn 3 sau ~1 tháng.
- Pet "thích" bài hát: để sau bản thử.

## Việc còn lại (làm tiếp, theo thứ tự; mỗi mục commit riêng, kiểm tra trong trình duyệt trước khi sang mục sau)
Gợi ý dùng lại: `components/layout/use-game-summary.ts` (XP/cấp/chuỗi), `components/streak/use-streak.ts` (todayItems, dailyGoal, week), `components/review/use-review-summary.ts` + `lib/user-data/review-repo.ts` (`loadReviewSession`: hàng đợi thẻ có `term, pinyin, meaning`), `lib/feedback/sfx-notes.ts` + `lib/game/reward-sound.ts` (tiếng thưởng), `lib/games/arcade-sfx.ts` (`sfx.pop`, `sfx.levelUp`, `SoundToggle`), `playChinese` (phát âm TTS có cache).

1. **(XONG 2026-10-29) Tiến hóa + phụ kiện (bước 3).** Nhớ giai đoạn đã thấy ở localStorage; lên giai đoạn mới thì phát tiếng (`levelup`) và hiện chữ "tiến hóa!" một lần. Vẽ phụ kiện lên hình: khăn (chuỗi 7), mũ thư sinh (30), vương miện (100; vương miện thay mũ). Mọi loài dùng chung `headY = giai đoạn 1 ? 62 : 52`, đầu cao ~28, nên một bộ phụ kiện chung neo theo `headY` là đủ. Mở rộng `PetSprite` thêm prop `accessories`, truyền `unlockedAccessories(streak.longest)`.
2. **(XONG 2026-10-29) Chạm vào pet (A).** Bấm hình: nảy (thêm lớp `pet-tap` trong `PET_CSS`), `sfx.pop`, bóng thoại ngắn tiếng Việt theo tâm trạng/dịp. Giới hạn số lần nói mỗi ngày; công tắc tắt tiếng; hình là `<button>` thật, vùng bấm ≥ 44 px (CLAUDE.md quy tắc 9), có nhãn cho trình đọc màn hình.
3. **(XONG 2026-10-29) Bóng thoại mang một từ cần ôn (A).** Mở rộng `ReviewSummary` (`use-review-summary.ts`) kèm vài thẻ đầu hàng đợi (`term, pinyin, meaning`) để không gọi Supabase lần hai. Bấm vào thì phát âm. Pinyin lấy từ thẻ đã lưu (nguồn từ điển).
4. **(XONG 2026-10-29, trừ "đúng liên tiếp") Phản ứng theo sự kiện (A).** Dùng `rewardSoundFor` / thay đổi `GameSummary` để pet reo khi lên cấp, tăng chuỗi, đạt mục tiêu; buồn nhẹ khi mất chuỗi (có bù chuỗi, không dùng chữ nặng nề).
5. **(XONG 2026-10-29) Cho pet ăn thẻ (B).** Mini ôn ngay trong thẻ pet (1–3 thẻ đến hạn), dùng chính `useReviewSession` / `saveGrade` để XP và lịch FSRS vẫn tính như ôn thường; pet "ăn" và nhai khi ôn xong. Không tạo nguồn XP mới.
6. **(XONG 2026-10-29) Pet bắt chước phát âm (B).** Dùng phần chấm phát âm có sẵn (`app/api/pronunciation-assess`, `lib/pronunciation`, `lib/speaking`); pet phát âm mẫu bằng TTS rồi phản ứng theo điểm. Cần micro, có đường lui khi bị từ chối quyền.
7. **(XONG 2026-10-29, quà là một từ, không phải cả câu) Quà từ bài hát (B).** Nghe hết một bài (sự kiện `songsCompleted` trong `lib/game/aggregate-activity.ts`) thì pet đưa một câu/từ trong bài đó (lời chỉ lấy từ nguồn có sẵn, không để LLM viết lời; không đưa lời bài hát có thật vào repo hay fixture).
8. **(XONG 2026-10-29, chờ người bản ngữ rà) Nói chuyện với pet (C).** Dùng engine nhập vai (`lib/roleplay`: `scenarios.ts`, `build-turn-prompt.ts`, `roleplay-turn.ts`, `app/api/roleplay`): thêm kịch bản "pet" nói tiếng Trung đơn giản theo HSK của người dùng, sửa lỗi nhẹ bằng tiếng Việt. Bắt buộc: giới hạn lượt mỗi ngày (tốn hạn mức AI), lọc nội dung, pinyin từ từ điển, không đưa key AI xuống client (quy tắc 4), rà câu tiếng Trung bởi người bản ngữ trước khi ra mắt rộng. Làm sau cùng, chỉ khi các mục trên được dùng thật.

Mỗi mục xong: thêm test cho phần logic thuần, chạy `npx vitest run`, `npx tsc --noEmit` (bỏ qua lỗi types tự sinh cũ của Next), `npx eslint`, cập nhật `docs/handoff-and-status.md` (+ 3 tài liệu còn lại nếu đổi kiến trúc, biến môi trường, quy ước), rồi commit kiểu Conventional Commits.

9. **(XONG 2026-10-29) Dạy pet, phiêu lưu, thẻ khoe.** Dạy pet chọn nghĩa đúng, pet nhớ/quên theo mức; phiêu lưu một chuyến mỗi ngày mang 3 từ cảnh Khám phá; thẻ khoe hologram lưu PNG/chia sẻ. Chi tiết ở `docs/handoff-and-status.md`. Còn lại (ý tưởng): nhiệm vụ pet hằng ngày, karaoke với pet, đồng bộ sổ từ lên tài khoản.
10. **(XONG 2026-10-29) Game cùng pet.** Đấu với pet (`/review/pet-duel`) và pet cổ vũ ở Đập chữ. Còn lại (ý tưởng): pet làm nhân vật trong Bắn chữ/Nhạc rơi.
11. **(XONG 2026-10-29) Pet thăm nhà bạn bè (bản không cần DB).** Link mời mang ảnh chụp pet, khách chơi cùng; còn lại: bảng `pet_visits` để chủ pet nhận quà khách để lại.
