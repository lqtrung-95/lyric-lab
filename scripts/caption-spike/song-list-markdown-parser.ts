// Đọc danh sách bài từ file markdown đề xuất (bảng `| # | Bài | Nghệ sĩ | ... |` dưới các mục `## Nhóm N — Tên (số bài)`).
export interface SampleSong {
  id: number;
  title: string;
  artist: string;
  group: string;
}

export function parseSongListMarkdown(markdown: string): SampleSong[] {
  const songs: SampleSong[] = [];
  let group = "";
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^## Nhóm \d+ — (.+?)(?: \(\d+\))?$/);
    if (heading) {
      group = heading[1].trim();
      continue;
    }
    const row = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (row && group) {
      songs.push({ id: Number(row[1]), title: row[2], artist: row[3], group });
    }
  }
  return songs;
}
