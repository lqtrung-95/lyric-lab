/**
 * Chạy lần lượt các model, nhưng nếu model hiện tại chưa trả lời sau `hedgeMs` thì khởi động thêm model kế TRONG KHI vẫn chờ model trước: lấy kết quả hợp lệ đầu tiên.
 * Model lỗi (ném lỗi) thì khởi động model kế ngay. Chỉ ném lỗi khi mọi model đều lỗi. Chậm là do model chậm/treo chứ không do lỗi nên đợi tuần tự sẽ cộng dồn thời gian chờ;
 * đua song song giữ độ trễ ở mức của model nhanh nhất, chỉ tốn thêm lượt gọi trong những lần chậm. Tối đa `maxInFlight` lượt chạy cùng lúc.
 */
export function hedged<T>(models: readonly string[], attempt: (model: string) => Promise<T>, hedgeMs: number, maxInFlight = 2): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let next = 0, inFlight = 0, done = false;
    let lastError: unknown = new Error("không có model");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const launch = () => {
      if (done || next >= models.length || inFlight >= maxInFlight) return;
      const model = models[next++];
      inFlight++;
      clearTimeout(timer);
      timer = setTimeout(launch, hedgeMs);
      attempt(model).then(
        (value) => { if (!done) { done = true; clearTimeout(timer); resolve(value); } },
        (error) => {
          lastError = error;
          inFlight--;
          if (done) return;
          if (next < models.length) launch();
          else if (inFlight === 0) { done = true; clearTimeout(timer); reject(lastError); }
        },
      );
    };
    if (models.length === 0) { reject(lastError); return; }
    launch();
  });
}
