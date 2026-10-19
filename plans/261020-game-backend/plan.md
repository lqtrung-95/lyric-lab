# Backend game hóa (GM-01..05, GM-10)

Phạm vi: backend + thư viện + API, chưa có giao diện. Không tiền ảo, không giải đấu tuần.

## Quyết định thiết kế
- **XP suy ra từ bảng sự kiện có sẵn, không có sổ XP riêng.** Mỗi (ngày theo múi giờ người dùng × nguồn) cho ra một khoản XP = hàm thuần của số liệu ngày đó, có trần. Sổ cái trả cho UI ("+30 XP vì ôn 15 thẻ") sinh từ các khoản này, nên giải thích được từng khoản mà không phải sửa chỗ ghi nào ở client. Thưởng nhiệm vụ là khoản duy nhất lưu thật (`user_quest_claims`).
- Cấp, huy hiệu, nhiệm vụ, đóng băng chuỗi đều là hàm thuần trên cùng một nhóm số liệu ngày (`DayActivity`) → test không cần DB.
- Ghi khi đọc (settle): GET summary tự cấp huy hiệu mới và tự dùng đóng băng; cả hai idempotent nhờ khóa chính. Bảng mới thiếu (migration chưa chạy) thì bỏ qua ghi, vẫn trả kết quả tính được.

## Bảng mới (`20261020000001_game_system.sql`, chạy lại được, vào `merge_user_data`)
| Bảng | Khóa | Nội dung |
|---|---|---|
| `user_badges` | (user_id, badge_id, tier) | earned_at; mỗi bậc một hàng |
| `user_quest_claims` | (user_id, quest_id) | kind, reward_xp, freeze_granted, claimed_at |
| `user_streak_freezes` | (user_id, day) | ngày đã được đóng băng chuỗi tự động, used_at |
Tất cả RLS: chủ sở hữu chỉ đọc; ghi qua service role (client không tự cấp thưởng).

## Công thức XP (mỗi nguồn, mỗi ngày; trần ở `lib/game/xp-rules.ts`)
| Nguồn | Công thức | Trần/ngày |
|---|---|---|
| Ôn thẻ (`review_logs`) | 2/lượt chấm | 100 |
| Luyện tập (`practice_scores` mode pinyin/cloze/listen/match/karaoke) | mỗi lượt: 2×đúng, +5 nếu đúng hết và ≥5 câu | 80 |
| Chép chính tả video (`dictation`) | 3/câu đạt (`correct`) | 45 |
| Luyện nói video (`shadowing`) | 4/câu đạt | 60 |
| Nghe hết bài (`user_song_progress.completed`) | 20/bài | 60 |
| Hoàn thành chặng (`user_unit_progress`) | 30, +10 nếu điểm ≥ 80 | 120 |
| Thi đấu (`room_players`+`rooms` đã kết thúc, đúng ≥ 1 câu) | 10, +15 nếu thắng | 50 |
| Thưởng nhiệm vụ | theo nhiệm vụ | không (mỗi nhiệm vụ nhận 1 lần) |
Kết quả không chấm được (correct = 0 ở chép/nói, lượt 0 đúng) = 0 XP. Điểm `points` của client KHÔNG dùng để tính XP.
Cấp: tổng XP để đạt cấp n = 30·(n−1)² + 20·(n−1), tối đa cấp 50.

## Nhiệm vụ
Sinh xác định theo (user, ngày) / (user, tuần ISO thứ Hai→CN theo múi giờ) bằng xáo trộn có hạt giống từ hash(userId+kỳ). Hằng ngày 3 nhiệm vụ trong danh mục 6; hằng tuần 3 (luôn có "học 5 ngày", thưởng 1 đóng băng). Id nhiệm vụ = `daily:2026-10-20:review10`. Claim chỉ chấp nhận id nằm trong tập nhiệm vụ HIỆN TẠI của người dùng và đã đủ tiến độ.

## Đóng băng chuỗi
Kiếm bằng nhiệm vụ tuần (không mua), giữ tối đa 2. Tự dùng cho một ngày lỡ đơn lẻ D khi D−1 còn trong chuỗi và D+1 đã học (hoặc là hôm nay); quét 14 ngày gần nhất. Ngày đóng băng giữ chuỗi nhưng không tính là ngày học (không tăng số, không tô tuần). `computeStreak` giữ nguyên; thêm `computeStreakWithFreezes` (rỗng đóng băng ⇒ kết quả giống hệt). `/api/streak` cũ không đổi hành vi; chuỗi nâng cấp chỉ ở `/api/game/summary`.

## Hợp đồng API (cần phiên; ẩn danh được; 401 `auth_required` nếu chưa có phiên)
- `GET /api/game/summary` → `{xp:{total,today,todayCap,todaySources:[{source,label,xp,cap}]}, level:{n,name,progressXp,nextXp,maxed}, streak:{current,longest,freezes,studiedToday,week,frozenDays}, quests:[{id,kind,title,progress,target,rewardXp,rewardFreeze,claimable,claimed}], badges:{earned:[{id,tier,earnedAt}],recent:[{id,tier,earnedAt}]}, ledger:[{day,xp,source,reason}]}`
- `POST /api/game/quests/[id]/claim` (id URL-encode) → 200 `{claimed:true|false(đã nhận trước), summary}`; 404 `quest_not_found`; 409 `not_complete`; 503 `unavailable` (migration chưa chạy).
- `GET /api/game/badges` → `{badges:[{id,group,title,hint,hidden,unlocked,tier,nextTier,progress,nextTarget,tiers:[{tier,threshold,earned}]}]}`; huy hiệu ẩn chưa mở trả title/hint "???".

## Chống gian lận (GM-10) và giới hạn
Tính ở server; trần theo nguồn/ngày chặn mức tối đa ≈515 XP/ngày + nhiệm vụ; nguồn đã có giới hạn gửi (`/api/practice/score`, `/practice/video`). KHÔNG chống được người cố ý: `review_logs`, `user_song_progress`, `user_unit_progress` do client ghi qua RLS nên có thể giả; trần là lưới an toàn, không phải bảo đảm. XP tổng tính từ tối đa 20 000 dòng gần nhất mỗi bảng (đủ nhiều tháng; sau đó cần sổ XP lũy kế).

## Rủi ro
- Bài nghe xong tính theo `updated_at`, nghe lại làm XP dịch sang ngày khác (tổng không đổi trừ khi chạm trần). Chấp nhận.
- Gộp tài khoản: ba bảng mới vào `merge_user_data` (bản đầy đủ mới nhất + phần mới) và danh sách "merged" của test canh gác.
