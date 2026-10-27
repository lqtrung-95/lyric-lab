import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  cat: { name: "Cô Mèo chủ tiệm bánh", sprite: "cat" },
  dog: { name: "Chú Chó huấn luyện viên", sprite: "dog" },
  bird: { name: "Cô Chim giáo viên", sprite: "bird" },
  tiger: { name: "Chú Hổ thợ máy", sprite: "tiger" },
  turtle: { name: "Ông Rùa", sprite: "turtle" },
};

/** Vụ không có thủ phạm: Chó rời phòng gym để lấy chiếc bánh sinh nhật bí mật đã đặt cho Mèo; Rùa thấy Chó ôm hộp bánh. Cần đưa đúng sổ đơn cho Chó thì ông mới nói. Đáp án: không ai cả. */
export const CLUES: ClueDef[] = [
  { id: "order_book", title: "Sổ đơn của tiệm bánh", zh: "订单本:七号单,生日蛋糕,顾客要求保密,下午三点四十五分来取。", vi: "Sổ đơn: đơn số 7, bánh sinh nhật, khách dặn giữ bí mật, đến lấy lúc 3 giờ 45 chiều.", sceneId: "bakery", kind: "document" },
  { id: "empty_card", title: "Tấm thiệp trên quầy", zh: "柜台上只剩一张小卡片,上面写着“生日快乐”。", vi: "Trên quầy chỉ còn một tấm thiệp nhỏ viết “Sinh nhật vui vẻ”.", sceneId: "bakery", kind: "object" },
  { id: "dog_alibi", title: "Lời khai của Chú Chó", zh: "今天下午三点半到四点半,我一直在健身房训练。", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi, tôi tập ở phòng gym suốt.", sceneId: "gym", kind: "testimony" },
  { id: "gym_signout", title: "Sổ ký tên phòng gym", zh: "签名本:小狗三点半离开健身房,四点十五分才回来。", vi: "Sổ ký tên: Chó rời phòng gym lúc 3:30 và đến 4:15 mới quay lại.", sceneId: "gym", kind: "document" },
  { id: "dog_slip", title: "Chó đổi lời", zh: "我……我想给小猫一个惊喜!", vi: "Tôi... tôi muốn tạo bất ngờ cho Mèo!", sceneId: "gym", kind: "testimony" },
  { id: "bird_alibi", title: "Lời khai của Cô Chim", zh: "今天下午三点半到四点半,我一直在学校上课。", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi, tôi dạy ở trường suốt.", sceneId: "school", kind: "testimony" },
  { id: "class_roster", title: "Thời khóa biểu", zh: "课程表:三点半到四点半,鸟老师一直在教室里上课。", vi: "Thời khóa biểu: từ 3:30 đến 4:30, cô Chim dạy trong lớp suốt.", sceneId: "school", kind: "document" },
  { id: "party_note", title: "Ghi chú tiệc lớp", zh: "班级的联欢会用学校自己做的点心,没有订外面的蛋糕。", vi: "Tiệc lớp dùng bánh do trường tự làm, không đặt bánh bên ngoài.", sceneId: "school", kind: "document" },
  { id: "tiger_alibi", title: "Lời khai của Chú Hổ", zh: "今天下午三点半到四点半,我一直在修车店修车。", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi, tôi sửa xe ở tiệm suốt.", sceneId: "garage", kind: "testimony" },
  { id: "tiger_log", title: "Sổ sửa xe", zh: "修车记录:三点半到四点半,老虎一直在修一辆大卡车,没有离开。", vi: "Sổ sửa xe: từ 3:30 đến 4:30, Hổ sửa một chiếc xe tải lớn suốt, không rời đi.", sceneId: "garage", kind: "document" },
  { id: "witness_turtle", title: "Lời khai của Ông Rùa", zh: "三点五十分,我看见一只狗抱着一个粉色的蛋糕盒,一边走一边笑,往小猫的家走去。", vi: "3 giờ 50, tôi thấy một con chó ôm hộp bánh màu hồng, vừa đi vừa cười, đi về hướng nhà Mèo.", sceneId: "park", kind: "testimony" },
  { id: "d_order", title: "Suy luận: lấy bánh, không phải trộm", zh: "抱着蛋糕盒的人,就是三点四十五分来取蛋糕的客人。", vi: "Người ôm hộp bánh chính là khách đã đặt bánh và hẹn đến lấy lúc 3:45. Đây là việc lấy bánh, không phải trộm.", sceneId: "bakery", kind: "deduction", link: ["order_book", "witness_turtle"] },
  { id: "d_dog", title: "Suy luận: Chó nói dối vì giữ bí mật", zh: "小狗三点半离开健身房,正好赶上三点四十五分取蛋糕。", vi: "Chó rời phòng gym lúc 3:30, vừa kịp lấy bánh lúc 3:45. Lời khai tập gym là nói dối, nhưng để giữ bí mật.", sceneId: "bakery", kind: "deduction", link: ["gym_signout", "order_book"] },
  { id: "d_bird", title: "Suy luận: Cô Chim không liên quan", zh: "鸟老师一直在上课,学校也没有订外面的蛋糕。", vi: "Cô Chim dạy suốt buổi, và trường cũng không đặt bánh bên ngoài.", sceneId: "bakery", kind: "deduction", link: ["class_roster", "party_note"] },
  { id: "d_tiger", title: "Suy luận: Hổ không liên quan", zh: "老虎一直在修车,抱着蛋糕的是一只狗。", vi: "Hổ sửa xe suốt, còn người ôm hộp bánh là một con chó.", sceneId: "bakery", kind: "deduction", link: ["tiger_log", "witness_turtle"] },
];

export const SUSPECTS: Suspect[] = [
  { id: "dog", name: "Chú Chó huấn luyện viên", sprite: "dog", sceneId: "gym", metFlag: "met:dog", note: "Nói chiều nay tập gym suốt. Nhưng sổ ký tên nói ông rời đi lúc 3:30." },
  { id: "bird", name: "Cô Chim giáo viên", sprite: "bird", sceneId: "school", metFlag: "met:bird", note: "Nói chiều nay dạy học suốt. Thời khóa biểu xác nhận." },
  { id: "tiger", name: "Chú Hổ thợ máy", sprite: "tiger", sceneId: "garage", metFlag: "met:tiger", note: "Nói chiều nay sửa xe suốt. Sổ sửa xe xác nhận." },
  { id: "nobody", virtual: true, name: "Không ai cả (chỉ là hiểu lầm)", sprite: "guide", sceneId: "bakery", metFlag: "met:nobody", note: "Có thể chiếc bánh không hề bị trộm. Chọn khi bạn tin là vậy." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-cat", sceneId: "bakery", text: "Nói chuyện với Cô Mèo ở Tiệm bánh để nhận vụ án.", done: { all: ["met:cat"] } },
  { id: "gym", sceneId: "gym", text: "Đến Phòng gym: hỏi Chú Chó và xem sổ ký tên.", when: { all: ["met:cat"] }, done: { all: ["met:dog", "clue:gym_signout"] } },
  { id: "school", sceneId: "school", text: "Đến Trường học: hỏi Cô Chim, xem thời khóa biểu và ghi chú tiệc lớp.", when: { all: ["met:dog", "clue:gym_signout"] }, done: { all: ["met:bird", "clue:class_roster", "clue:party_note"] } },
  { id: "garage", sceneId: "garage", text: "Đến Tiệm sửa xe: hỏi Chú Hổ và xem sổ sửa xe.", when: { all: ["met:bird", "clue:class_roster", "clue:party_note"] }, done: { all: ["met:tiger", "clue:tiger_log"] } },
  { id: "park", sceneId: "park", text: "Ra Công viên: hỏi Ông Rùa xem ông có thấy ai.", when: { all: ["met:tiger", "clue:tiger_log"] }, done: { all: ["clue:witness_turtle"] } },
  { id: "confront", sceneId: "gym", text: "Hỏi lại Chú Chó và đưa ra đúng bằng chứng.", when: { all: ["clue:witness_turtle", "clue:order_book"] }, done: { all: ["clue:dog_slip"] } },
  { id: "accuse", sceneId: "bakery", text: "Về Tiệm bánh, nói với Cô Mèo kết luận của bạn.", when: { all: ["clue:dog_slip"] }, done: { all: ["case:solved"] } },
];
