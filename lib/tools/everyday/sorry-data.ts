import type { PhraseGroup, QuizQuestion } from "./everyday-types";

/** Ba cách xin lỗi chính và khi nào dùng cái nào. */
export const SORRY_COMPARE: { zh: string; pinyin: string; vi: string; when: string; example: { zh: string; pinyin: string; vi: string } }[] = [
  { zh: "对不起", pinyin: "duìbuqǐ", vi: "Xin lỗi (có lỗi thật)", when: "Khi bạn thực sự làm sai và muốn nhận lỗi: làm vỡ đồ, đến trễ, làm người khác buồn. Nặng hơn 不好意思.",
    example: { zh: "对不起,我来晚了。", pinyin: "Duìbuqǐ, wǒ lái wǎn le.", vi: "Xin lỗi, tôi đến muộn." } },
  { zh: "不好意思", pinyin: "bù hǎoyìsi", vi: "Ngại quá, xin lỗi (nhẹ)", when: "Lỗi nhỏ, làm phiền nhẹ hoặc ngại ngùng: hỏi đường, chen ngang, nhờ vả. Cũng dùng để mở lời lịch sự.",
    example: { zh: "不好意思,请问洗手间在哪儿?", pinyin: "Bù hǎoyìsi, qǐngwèn xǐshǒujiān zài nǎr?", vi: "Xin lỗi, nhà vệ sinh ở đâu ạ?" } },
  { zh: "抱歉", pinyin: "bàoqiàn", vi: "Xin lỗi (trang trọng)", when: "Văn viết, email, thông báo, hoặc khi nói với khách hàng, cấp trên. Mang cảm giác tiếc nuối.",
    example: { zh: "抱歉,让您久等了。", pinyin: "Bàoqiàn, ràng nín jiǔ děng le.", vi: "Xin lỗi, để ngài đợi lâu." } },
];

export const SORRY_GROUPS: PhraseGroup[] = [
  {
    id: "say-sorry",
    title: "Thêm cách xin lỗi",
    phrases: [
      { zh: "真对不起", pinyin: "zhēn duìbuqǐ", vi: "Thật sự xin lỗi", note: "Thêm 真 để nhấn mạnh." },
      { zh: "非常抱歉", pinyin: "fēicháng bàoqiàn", vi: "Vô cùng xin lỗi" },
      { zh: "我错了", pinyin: "wǒ cuò le", vi: "Tôi sai rồi", note: "Nhận lỗi thẳng, hay dùng với người thân." },
      { zh: "是我不好", pinyin: "shì wǒ bù hǎo", vi: "Là lỗi của tôi" },
      { zh: "请原谅我", pinyin: "qǐng yuánliàng wǒ", vi: "Xin hãy tha lỗi cho tôi", note: "Nghiêm túc, khi lỗi khá nặng." },
      { zh: "打扰了", pinyin: "dǎrǎo le", vi: "Xin lỗi đã làm phiền", note: "Nói khi bước vào chỗ người khác hoặc ngắt lời." },
      { zh: "让你久等了", pinyin: "ràng nǐ jiǔ děng le", vi: "Để bạn đợi lâu rồi" },
      { zh: "失礼了", pinyin: "shīlǐ le", vi: "Thất lễ rồi", note: "Trang trọng, khi lỡ cư xử chưa phải phép." },
    ],
  },
  {
    id: "reply-sorry",
    title: "Đáp lại lời xin lỗi",
    phrases: [
      { zh: "没关系", pinyin: "méi guānxi", vi: "Không sao đâu", note: "Câu đáp thông dụng nhất." },
      { zh: "没事", pinyin: "méishì", vi: "Không có gì" },
      { zh: "不要紧", pinyin: "bú yàojǐn", vi: "Không đáng ngại" },
      { zh: "没问题", pinyin: "méi wèntí", vi: "Không vấn đề gì" },
      { zh: "别放在心上", pinyin: "bié fàng zài xīn shang", vi: "Đừng để bụng", note: "Trấn an người đang áy náy nhiều." },
    ],
  },
];

export const SORRY_QUIZ: QuizQuestion[] = [
  { prompt: "Bạn giẫm phải chân người khác trên tàu. Nói gì?", options: ["对不起", "不用谢", "再见"], answer: 0, explain: "Bạn làm sai thật nên dùng 对不起." },
  { prompt: "Hỏi đường người lạ một cách lịch sự, mở lời bằng?", options: ["不好意思", "抱歉", "我错了"], answer: 0, explain: "不好意思 nhẹ nhàng, hợp để mở lời hoặc làm phiền chút ít." },
  { prompt: "Viết email xin lỗi khách hàng, từ nào trang trọng hợp nhất?", options: ["抱歉", "我错了", "不好意思啦"], answer: 0, explain: "抱歉 trang trọng, hợp văn viết và khi nói với khách." },
  { prompt: "Ai xin lỗi bạn, bạn đáp?", options: ["没关系", "不客气", "谢谢"], answer: 0, explain: "没关系 = không sao đâu. 不客气 là đáp lời cảm ơn." },
  { prompt: "Bước vào phòng sếp, muốn nói \"xin lỗi đã làm phiền\":", options: ["打扰了", "辛苦了", "失败了"], answer: 0, explain: "打扰了 (dǎrǎo le) = xin lỗi vì làm phiền." },
  { prompt: "Lỗi nặng, muốn xin người ta tha thứ nghiêm túc:", options: ["请原谅我", "没事", "好吧"], answer: 0, explain: "请原谅我 = xin hãy tha lỗi cho tôi, nghiêm túc hơn các câu thông thường." },
  { prompt: "对不起 và 不好意思 khác nhau thế nào?", zh: "对不起", options: ["对不起 nặng hơn, nhận lỗi thật; 不好意思 nhẹ hơn", "Hoàn toàn giống nhau", "不好意思 nặng hơn"], answer: 0, explain: "对不起 là nhận lỗi, 不好意思 là ngại ngùng nhẹ nhàng hoặc làm phiền chút ít." },
];
