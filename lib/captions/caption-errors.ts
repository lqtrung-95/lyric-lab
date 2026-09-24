// Lỗi có kiểu để spike thống kê được nguyên nhân thất bại và UI hiển thị đúng thông báo (IN-05).
export type CaptionErrorType = "no_caption" | "blocked" | "parse" | "network";

export class CaptionError extends Error {
  constructor(
    public readonly type: CaptionErrorType,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "CaptionError";
  }
}
