// Lệnh tiếng Trung của Cú Thầy cho nhiệm vụ "nghe lệnh" (phản ứng bằng hành động): nói một câu ngắn, người chơi phải hiểu và làm theo, không có phụ đề.
// Vật mang đi được thì "mang cho tôi", vật không mang được thì "đi tới".

/** Câu lệnh tiếng Trung. Dùng khuôn cố định nên đúng ngữ pháp với mọi danh từ trong cảnh. */
export const commandText = (term: string, portable: boolean): string => (portable ? `请把${term}拿给我。` : `请走到${term}那里。`);

/** Nghĩa tiếng Việt của lệnh (chỉ hiện sau khi trả lời để người học đối chiếu). */
export const commandMeaning = (gloss: string, portable: boolean): string => (portable ? `Hãy mang ${gloss} cho tôi.` : `Hãy đi tới chỗ ${gloss}.`);
