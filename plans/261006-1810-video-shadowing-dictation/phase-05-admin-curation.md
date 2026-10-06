# Giai đoạn 5: Quản trị nguồn và dọn dẹp

## Context
- [plan.md](plan.md). Mẫu: `app/api/admin/songs` (ẩn/xóa bài, `revalidatePath`) và các trang `/admin`.

## Tổng quan
Chưa làm. Admin duyệt video `draft`, chuyển `listed`, ẩn hoặc xóa khi có yêu cầu gỡ; xem và ghi chú nguồn.

## Yêu cầu
- Trang `/admin/videos`: danh sách theo trạng thái, xem trước bản chép và bản dịch, duyệt/ẩn/xóa, sửa dòng dịch sai.
- Quản lý `video_sources` (ghi chú giấy phép, cờ phụ đề do người làm).
- Xóa video xóa cả dòng liên quan và làm mới cache danh sách.

## Todo
- [x] API admin
- [x] Trang admin (danh sách, rà bản dịch, duyệt/ẩn/xóa)
- [x] Cập nhật bốn tài liệu bàn giao
- [ ] Quản lý `video_sources` (ghi chú giấy phép): hoãn, script nạp tự tạo bản ghi nguồn

## Tiêu chí hoàn thành
Admin duyệt và gỡ được video mà không cần SQL tay.
