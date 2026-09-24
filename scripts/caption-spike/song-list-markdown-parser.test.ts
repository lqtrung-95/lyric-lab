import { describe, expect, it } from "vitest";
import { parseSongListMarkdown } from "./song-list-markdown-parser";

const MD = `# Tiêu đề
## Nhóm 1 — Mandopop Đại lục (2)

| # | Bài | Nghệ sĩ |
|---|---|---|
| 1 | 夜车 | 歌手甲 |
| 2 | 雨天 | 歌手乙 |

## Nhóm 3 — OST phim (1)

| # | Bài | Nghệ sĩ | Phim |
|---|---|---|---|
| 25 | 海边 | 歌手丙 | 某剧 |

## Ghi chú
- không phải bài
`;

describe("parseSongListMarkdown", () => {
  it("đọc bài theo nhóm, bỏ dòng tiêu đề bảng và ghi chú", () => {
    expect(parseSongListMarkdown(MD)).toEqual([
      { id: 1, title: "夜车", artist: "歌手甲", group: "Mandopop Đại lục" },
      { id: 2, title: "雨天", artist: "歌手乙", group: "Mandopop Đại lục" },
      { id: 25, title: "海边", artist: "歌手丙", group: "OST phim" },
    ]);
  });
});
