const FILLER_ONLY = /^[嗯呃额唔哦喔啊呀诶欸呐哎哼哈]+$/u;

/**
 * Làm mượt chữ nhận diện của MỘT lượt nói: Azure chấm câu theo từng chỗ ngừng, nên người học ậm ừ giữa chừng thì lời bị cắt thành những mẩu "…。…。".
 * Một lượt nói là một ý: bỏ mẩu chỉ có tiếng đệm (嗯, 呃, 啊…), đổi dấu chấm giữa chừng thành dấu phẩy, giữ dấu kết thúc của mẩu cuối (và ？！ nếu người học thật sự hỏi/cảm thán), bỏ khoảng trắng giữa chữ Hán.
 */
export function smoothTranscript(raw: string): string {
  const text = raw.replace(/(?<=\p{Script=Han}|[，。！？、])\s+(?=\p{Script=Han})/gu, "").trim();
  const parts = [...text.matchAll(/([^。！？!?.]+)([。！？!?.]?)/gu)].map((m) => ({ body: m[1].replace(/^[，、\s]+|[，、\s]+$/g, ""), end: m[2] }));
  const kept = parts.filter((p) => p.body && !FILLER_ONLY.test(p.body.replace(/[，、\s]/g, "")));
  if (kept.length === 0) return text.replace(/[。.]$/, "") === "" ? "" : parts.map((p) => p.body).join("");
  return kept.map((p, i) => {
    const last = i === kept.length - 1;
    if (last) return p.body + (p.end === "." ? "。" : p.end);
    return p.body + (/[？！?!]/.test(p.end) ? p.end.replace("?", "？").replace("!", "！") : "，");
  }).join("");
}
