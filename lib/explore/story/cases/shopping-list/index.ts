import type { StoryDef } from "../../story-types";
import { BANK_STORY } from "./scene-bank";
import { MARKET_STORY } from "./scene-market";
import { CLOTHING_STORE_STORY } from "./scene-clothing-store";
import { HOTEL_STORY } from "./scene-hotel";
import { SUPERMARKET_STORY } from "./scene-supermarket";
import { CLUES, OBJECTIVES, SPEAKERS, SUSPECTS } from "./meta";

/**
 * Vụ án khó (đọc hiểu số và lượng từ): danh sách của kẻ trộm là "三瓶牛奶、两斤苹果、一条鱼". Túi Mèo mua 果汁 (nước ép), túi Chó mua 三盒 (hộp thay vì chai), túi Vịt mua 两条鱼 (hai con cá), chỉ túi Heo khớp hoàn toàn.
 * Manh mối chỉ có chữ Hán (pinyin và nghĩa mặc định tắt). Heo chỉ đổi lời khi được đưa đúng túi đồ của anh. Cần 4 trong 5 manh mối then chốt.
 */
export const SHOPPING_LIST_CASE: StoryDef = {
  id: "shopping-list",
  title: "Vụ án danh sách mua sắm",
  difficulty: "hard",
  blurb: "Kẻ trộm tiền đánh rơi một danh sách mua sắm chỉ có chữ Hán. Số lượng và lượng từ chỉ khớp một túi đồ.",
  intro: "Cô Cáo ở ngân hàng mất một phong bì tiền. Kẻ trộm dùng tiền đi chợ rồi đánh rơi danh sách mua sắm, nhưng chữ chỉ viết bằng tiếng Trung. Pinyin và nghĩa tiếng Việt đang tắt sẵn để bạn thử tự đọc trước, cần thì bấm nút gợi ý. Hãy đọc số lượng và lượng từ, rồi so với túi đồ của từng người: chỉ cần sai một chữ là không phải.",
  speakers: SPEAKERS,
  clues: CLUES,
  suspects: SUSPECTS,
  objectives: OBJECTIVES,
  scenes: { bank: BANK_STORY, market: MARKET_STORY, "clothing-store": CLOTHING_STORE_STORY, hotel: HOTEL_STORY, supermarket: SUPERMARKET_STORY },
  solution: { suspectId: "pig", keyClues: ["d_cat", "d_dog", "d_duck", "d_pig", "pig_slip"], needed: 4 },
  freeRoam: true,
  readingFirst: true,
  questions: ["Danh sách mua sắm của kẻ trộm gồm những gì?", "Túi đồ của ai khớp từng chữ?", "Mỗi người còn lại sai ở chi tiết nào?"],
  solvedFlag: "case:solved",
  accuseWhen: { all: ["met:cat", "met:dog", "met:duck", "met:pig", "clue:pig_slip"] },
  startScene: "bank",
  accuseScene: "bank",
  epilogueNode: "o_epi1",
};
