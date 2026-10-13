import { ModeTabs } from "@/components/review/mode-tabs";
import { RestaurantGame } from "./restaurant-game";

/** Trang trò chơi Quán ăn: dùng từ vựng thực đơn có sẵn nên không cần thẻ đã lưu. */
export function RestaurantPractice() {
  return (
    <>
      <ModeTabs />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Quán ăn</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Luyện nghe số đếm, lượng từ và tên món ăn sáng. Chế độ này chỉ để luyện thêm, không đổi lịch ôn.</p>
        <div className="mt-space-md"><RestaurantGame /></div>
      </div>
    </>
  );
}
