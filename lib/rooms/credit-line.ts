// Dòng giới thiệu/ghi công đầu bài ("作词: …", "混音母带 : …", "OP : …") không phải lời hát: không dùng làm câu hỏi hay đáp án nhiễu.

// Vai trò xuất hiện trong dòng ghi công (tiếng Trung và tiếng Anh). Liệt kê theo các dòng thật gặp ở thư viện bài hiện có.
const ROLE_KEYWORDS = [
  "作词", "作曲", "词曲", "填词", "编曲", "编写", "配唱", "演唱", "原唱", "翻唱", "和声", "吉他", "贝斯", "鼓手", "钢琴",
  "音频编辑", "编辑", "混音", "母带", "录音", "音乐制作", "制作", "监制", "统筹", "总监", "导演", "出品", "发行", "版权", "商用授权",
  "企划", "策划", "营销", "推广", "宣传", "艺人", "经纪", "执行", "封面", "设计", "敬告", "声明", "代理",
  "arrangement", "arranger", "guitar", "bass", "drums", "backing vocal", "supervisor", "coordinator", "produced", "producer",
  "lyrics", "lyricist", "composer", "composed", "written", "mix", "master", "mastering", "recording", "engineer", "cover", "design",
];
// Từ khóa đủ đặc trưng để nhận ra dòng ghi công dù không có dấu hai chấm (vd. "作词 周杰伦", "OP/SP …").
const STRONG_START = /^(?:作词|作曲|词曲|填词|编曲|混音|母带|监制|制作人|出品|发行|演唱|原唱)(?:[\s/／]|$)/u;
const LABEL_BEFORE_COLON = /^([^:：]{1,40})[:：]/u;
// "OP" / "SP" (bản quyền xuất bản) đứng một mình trước dấu hai chấm hoặc kèm gạch chéo.
const PUBLISHING_LABEL = /^(?:op|sp)(?:\s*[/／]\s*(?:op|sp))?$/i;

/**
 * Dòng ghi công (người làm nhạc, mix/master, phát hành, bản quyền…) chứ không phải lời bài hát. Nhận ra khi phần trước dấu hai chấm là
 * một vai trò đã biết; nhãn người hát ("汪：", "合：", "Yumi:") thì KHÔNG phải ghi công vì đó vẫn là lời hát.
 */
export function isCreditLine(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const label = LABEL_BEFORE_COLON.exec(t)?.[1]?.trim().toLowerCase();
  if (label !== undefined) {
    if (PUBLISHING_LABEL.test(label)) return true;
    if (ROLE_KEYWORDS.some((k) => label.includes(k))) return true;
  }
  return STRONG_START.test(t);
}
