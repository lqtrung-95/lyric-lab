import { Fragment } from "react";

/**
 * Hiển thị văn bản AI trả về có chữ **in đậm** kiểu markdown (chỉ hỗ trợ đúng cú pháp này, không dựng HTML từ nội dung nên an toàn);
 * dấu `*` lẻ không ghép cặp được thì bỏ đi để không hiện ký hiệu thừa. Xuống dòng do nơi dùng giữ bằng `whitespace-pre-line`.
 */
export function InlineBoldText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*\n]+\*\*)/g).map((part, i) =>
        /^\*\*[^*\n]+\*\*$/.test(part)
          ? <strong key={i} className="font-semibold text-on-surface">{part.slice(2, -2)}</strong>
          : <Fragment key={i}>{part.replace(/\*+/g, "")}</Fragment>)}
    </>
  );
}
