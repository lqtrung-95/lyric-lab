import { createLikesRepo } from "./likes-repo";

const repo = createLikesRepo("user_song_likes");

/** Danh sách videoId bài hát người dùng hiện tại đã thích. Trả rỗng nếu chưa có phiên. */
export const listLikedVideoIds = repo.listLikedIds;

/** Bật/tắt thích một bài hát; trả trạng thái thật sau khi làm (xem `createLikesRepo`). */
export const toggleSongLike = repo.toggleLike;
