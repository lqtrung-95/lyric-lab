/**
 * Mục tiêu nhỏ của từng tình huống đóng vai: mỗi tình huống có 3 việc cần làm được bằng tiếng Trung (gọi đồ, hỏi giá, hẹn giờ…). Chấm HOÀN TOÀN bằng mẫu chữ trên lời người học đã nói
 * (không gọi AI, không tốn lượt): khớp một mẫu là đạt mục tiêu đó và giữ nguyên tới hết buổi. Mẫu viết rộng vừa đủ để nhận các cách nói thường gặp; nói đúng ý nhưng bằng cách hiếm có thể không được tính.
 */
export interface Objective { id: string; label: string; /** Câu gợi ý mẫu (chữ Hán) khi người học bí. */ hint: string; test: RegExp }

export const OBJECTIVES: Record<string, Objective[]> = {
  cafe: [
    { id: "order", label: "Gọi một đồ uống", hint: "我要一杯拿铁。", test: /(我要|我想要|我想喝|来[一两]?[杯个份]|给我|[一两]杯)/ },
    { id: "size", label: "Chọn cỡ ly", hint: "要大杯的。", test: /(大杯|中杯|小杯|超大杯|大的|中的|小的)/ },
    { id: "price", label: "Hỏi giá", hint: "多少钱？", test: /(多少钱|几块|多少块|怎么卖)/ },
  ],
  intro: [
    { id: "name", label: "Giới thiệu tên", hint: "我叫小明。", test: /(我叫|我的名字|名字是|我姓|我是[^，。？！]{1,4}[。！，]?$)/ },
    { id: "job", label: "Nói nghề nghiệp hoặc việc đang làm", hint: "我是老师。", test: /(我是[^，。？！]{0,4}(老师|学生|医生|工程师|律师|经理|职员|设计师|程序员)|我在[^，。？！]{0,8}(工作|上班|上学|学习)|我的工作|我做)/ },
    { id: "askback", label: "Hỏi lại bạn", hint: "你呢？", test: /(你呢|你叫什么|你是做什么|你的工作|你喜欢|你住|你在哪|你是哪)/ },
  ],
  directions: [
    { id: "ask", label: "Hỏi đường", hint: "请问，地铁站怎么走？", test: /(怎么走|在哪|在哪儿|在哪里|请问)/ },
    { id: "place", label: "Nói nơi muốn đến (ga, tiệm thuốc…)", hint: "我想去药店。", test: /(地铁站|车站|药店|药房|火车站|公交站)/ },
    { id: "thanks", label: "Xác nhận đã hiểu hoặc cảm ơn", hint: "我明白了，谢谢！", test: /(明白|知道了|懂了|谢谢|多谢|好的)/ },
  ],
  shopping: [
    { id: "price", label: "Hỏi giá", hint: "这件多少钱？", test: /(多少钱|几块|怎么卖|什么价)/ },
    { id: "bargain", label: "Trả giá", hint: "能便宜一点吗？", test: /(便宜|打折|太贵|能不能|少一点|优惠|算便宜)/ },
    { id: "decide", label: "Quyết định mua", hint: "我买这个。", test: /(我(要|想)?买|就这个|要这个|买了|我要这)/ },
  ],
  restaurant: [
    { id: "order", label: "Gọi món", hint: "我要一个宫保鸡丁。", test: /(我要|我想点|来[一两]?[个份碗盘]|点[一两]|给我[^，。]{0,4}(菜|饭|面|汤))/ },
    { id: "recommend", label: "Hỏi món nào ngon", hint: "有什么好吃的？", test: /(推荐|什么好吃|有什么好吃|招牌|特色)/ },
    { id: "bill", label: "Xin tính tiền", hint: "买单。", test: /(买单|结账|算账|埋单|多少钱)/ },
  ],
  hotel: [
    { id: "checkin", label: "Nhận phòng đã đặt", hint: "我订了一个房间。", test: /(预订|预定|订了|入住|登记|我订|办理)/ },
    { id: "breakfast", label: "Hỏi giờ ăn sáng", hint: "早餐几点开始？", test: /(早餐|早饭|几点[^，。？！]{0,4}(吃|开始|供应))/ },
    { id: "help", label: "Xin hỗ trợ", hint: "麻烦你帮我拿一下行李。", test: /(请帮|帮我|能不能帮|麻烦|可以帮)/ },
  ],
  doctor: [
    { id: "where", label: "Nói đau hoặc khó chịu ở đâu", hint: "我肚子疼。", test: /(疼|痛|不舒服|难受|头|肚子|喉咙|胃|嗓子)/ },
    { id: "howlong", label: "Nói đã bị bao lâu", hint: "已经三天了。", test: /(天了|几天|一周|一个星期|从[^，。]{0,4}开始|昨天|前天|一直|已经)/ },
    { id: "symptom", label: "Nói thêm một triệu chứng", hint: "我还有点咳嗽。", test: /(发烧|咳嗽|头晕|恶心|拉肚子|流鼻涕|没力气|没有力气|睡不着|没胃口)/ },
  ],
  taxi: [
    { id: "dest", label: "Nói điểm đến", hint: "我要去机场。", test: /(我要去|麻烦去|请去|去[^，。？！]{0,8}(机场|火车站|酒店|地铁站|大学|公司|医院|商场|公园|广场|路|街))/ },
    { id: "duration", label: "Hỏi mất bao lâu", hint: "要多久？", test: /(多久|多长时间|要多久|几分钟|需要多长)/ },
    { id: "pay", label: "Hỏi giá hoặc trả tiền", hint: "可以扫码付款吗？", test: /(多少钱|扫码|微信|支付宝|付|现金|刷卡|零钱)/ },
  ],
  weekend: [
    { id: "accept", label: "Nhận lời hoặc rủ bạn", hint: "好啊，我们一起去吧。", test: /(一起|去不去|好啊|好的|可以|没问题|太好了|行啊)/ },
    { id: "activity", label: "Chọn việc làm", hint: "我们去看电影吧。", test: /(看电影|逛街|爬山|吃饭|唱歌|公园|购物|打球|旅游|喝咖啡)/ },
    { id: "time", label: "Hẹn giờ", hint: "下午三点见。", test: /([一二三四五六七八九十两\d]+点|几点|下午|上午|晚上|星期[一二三四五六日天]|周[末一二三四五六日])/ },
  ],
  work: [
    { id: "tellwork", label: "Kể về công việc hôm nay", hint: "今天我很忙，开了一个会。", test: /(工作|开会|开了[^，。]{0,4}会|项目|报告|忙|加班|客户|邮件)/ },
    { id: "ask", label: "Hỏi thăm đồng nghiệp", hint: "你今天忙吗？", test: /(你呢|你怎么样|你今天|你忙吗|你累吗|你最近)/ },
    { id: "lunch", label: "Rủ đi ăn trưa", hint: "中午一起吃饭吧？", test: /(午饭|一起吃|中午|食堂|吃什么)/ },
  ],
};

export const objectivesOf = (scenarioId: string): Objective[] => OBJECTIVES[scenarioId] ?? [];

/** Mục tiêu đã đạt sau các câu người học đã nói (mỗi câu một chuỗi). Một câu có thể đạt nhiều mục tiêu. */
export function completedObjectives(scenarioId: string, userLines: readonly string[]): Set<string> {
  const done = new Set<string>();
  for (const o of objectivesOf(scenarioId)) if (userLines.some((l) => o.test.test(l))) done.add(o.id);
  return done;
}
