export type VideoRole = "official_mv" | "lyric_video" | "official_audio" | "other";

const LYRIC = /歌词|歌詞|动态歌词|動態歌詞|lyrics?|pinyin|拼音/i;
const AUDIO = /official audio|完整版音频|audio/i;
const MV = /official (music )?video|\bmv\b|官方/i;

/** Đoán vai trò video từ tiêu đề + tên kênh. Chỉ là heuristic để thống kê theo nhóm. */
export function classifyVideoRole(title: string, channel: string, artist: string): VideoRole {
  if (LYRIC.test(title)) return "lyric_video";
  if (AUDIO.test(title)) return "official_audio";
  const isArtistChannel = channel.includes(artist) || artist.includes(channel);
  if (MV.test(title) || isArtistChannel) return "official_mv";
  return "other";
}
