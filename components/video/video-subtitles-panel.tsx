"use client";

import { LyricList } from "@/components/listen/lyric-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { WordPopover } from "@/components/listen/word-popover";
import { itemKey } from "@/lib/user-state/learner-state";
import type { LessonDetail } from "@/lib/video/video-repo";
import type { useVideoWatch } from "./use-video-watch";

/**
 * Tab Phụ đề: bản chép chạy theo thời gian (cùng thành phần với màn Nghe bài hát) + bấm một từ để tra (từ điển và nghĩa theo ngữ cảnh) rồi lưu vào bộ thẻ
 * ôn. Video không có từ vựng/ngữ pháp được chọn trước, nên không có tô sáng hay panel "Đang hát"; mọi từ chữ Hán đều bấm tra được.
 */
export function VideoSubtitlesPanel({ lesson, watch }: { lesson: LessonDetail; watch: ReturnType<typeof useVideoWatch> }) {
  const { lines, prefs, update, currentIndex, seekToLine, pause, selectWord, word, setWord, lookup, savedKeys, savedTerm, saveWord, confirmReport, setConfirmReport, reportTranslation } = watch;
  return (
    <>
      {lines.every((l) => !l.translation) && (
        <p role="note" className="mb-space-md rounded-xl bg-surface-container-low p-3 text-label-md text-on-surface-variant">
          Video này chưa có bản dịch tiếng Việt, sẽ được bổ sung sau. Bạn vẫn luyện chép chính tả và nói theo như bình thường.
        </p>
      )}
      <LyricList
        videoId={lesson.videoId} promptVersion="video" variant="speech"
        lines={lines} currentIndex={currentIndex} vocab={[]} grammar={[]}
        showPinyin={prefs.showPinyin} showTranslation={prefs.showTranslation} autoScroll={prefs.autoScroll}
        shareContext={{ title: lesson.title, artist: lesson.channelTitle }}
        onTogglePinyin={() => update({ showPinyin: !prefs.showPinyin })} onToggleTranslation={() => update({ showTranslation: !prefs.showTranslation })}
        onSeek={seekToLine} onWord={selectWord} onPauseSong={pause} onReportTranslation={setConfirmReport}
      />
      {watch.pinToast && <Toast message={watch.pinToast} onDismiss={() => watch.setPinToast(null)} />}
      {watch.reportToast && <Toast message={watch.reportToast} onDismiss={() => watch.setReportToast(null)} />}
      <ConfirmDialog
        open={confirmReport !== null} title="Báo bản dịch này sai?"
        body="AI sẽ dịch lại đúng câu này và bản mới hiện cho mọi người. Chỉ báo khi bản dịch hiện tại sai hoặc khó hiểu."
        confirmLabel="Báo và dịch lại" cancelLabel="Hủy"
        onCancel={() => setConfirmReport(null)}
        onConfirm={() => { const index = confirmReport; setConfirmReport(null); if (index !== null) void reportTranslation(index); }}
      />
      {word && (
        <WordPopover
          word={word} item={null} lookup={lookup} saved={savedKeys.has(itemKey({ type: "vocab", term: savedTerm }))}
          onClose={() => setWord(null)} onPlayLine={() => seekToLine(word.lineIndex)} onToggleSave={saveWord}
        />
      )}
    </>
  );
}
