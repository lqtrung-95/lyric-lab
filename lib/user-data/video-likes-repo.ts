import { createLikesRepo } from "./likes-repo";

const repo = createLikesRepo("user_video_likes");

/** Danh sách videoId video luyện nghe người dùng hiện tại đã thích. Trả rỗng nếu chưa có phiên. */
export const listLikedLessonIds = repo.listLikedIds;

/** Bật/tắt thích một video; trả trạng thái thật sau khi làm (xem `createLikesRepo`). */
export const toggleVideoLike = repo.toggleLike;
