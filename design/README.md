# design/

Đặt file export từ Google Stitch vào đây. Claude Code dùng thư mục này làm chuẩn cho UI.

## Quy ước đặt tên

Theo ID màn hình trong `docs/design-brief.md`:

```
S1-home-mobile.png
S1-home-mobile.html
S1-home-desktop.png
S1-home-desktop.html
S4-preview-mobile.png
S4-preview-desktop.png
S4-preview-desktop-dark.png
S5-listen-mobile.png
S5-listen-desktop.png
...
components/                 # ảnh thư viện component, nếu có
tokens.md                   # màu, font, spacing chốt từ design
```

## Ghi chú

- Mỗi màn nên có cả **ảnh** (để đối chiếu nhìn) và **HTML** (để lấy màu, spacing, class Tailwind).
- HTML từ Stitch chỉ là tham chiếu. Khi code, tách thành component trong `components/` theo mục 5 của design brief, không copy nguyên khối.
- Nếu Stitch đổi màu hoặc font so với brief, ghi giá trị chốt vào `tokens.md`.
