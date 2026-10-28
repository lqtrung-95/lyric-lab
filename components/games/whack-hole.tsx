import type { GameWord } from "@/lib/games/game-word";

const signSize = (han: string): string => (han.length <= 2 ? "text-2xl sm:text-3xl" : han.length <= 4 ? "text-lg sm:text-xl" : "text-sm sm:text-base");

interface Props { word: GameWord | null; index: number; fx: { points: number } | null; flash: boolean; disabled: boolean; onHit: () => void }

/**
 * Một hố chuột chũi: hố đất tối, chuột nâu nhô lên (CSS, trồi từ dưới mép hố) cầm biển ghi chữ Hán. Viền đất phía trước che chân chuột nên trông như đang chui từ trong hố ra.
 * Trúng thì có búa gõ và số điểm bay lên; bấm nhầm thì chuột rung và hố đỏ lên một nhịp.
 */
export function WhackHole({ word, index, fx, flash, disabled, onHit }: Props) {
  return (
    <button type="button" disabled={disabled || !word} onClick={onHit} aria-label={word ? `Chữ ${word.han}` : "Hố trống"} className="relative block aspect-[5/4] w-full touch-manipulation select-none outline-offset-4">
      <span aria-hidden="true" className="absolute inset-x-[6%] bottom-[10%] h-[36%] rounded-[50%] bg-[#24150a] shadow-[inset_0_6px_10px_rgba(0,0,0,.7)]" />
      {word && (
        <span aria-hidden="true" className="absolute inset-x-[17%] bottom-[28%] top-0 overflow-hidden">
          <span className="bz-mole absolute inset-x-0 bottom-0 top-[6%] flex flex-col items-center rounded-t-[48%] border-2 border-[#4a2c12] bg-gradient-to-b from-[#a87040] to-[#7b4a22] px-1 pb-3 pt-1.5 sm:pb-4" style={{ animationDelay: `${index * 28}ms` }}>
            <span className="flex gap-2">{[0, 1].map((e) => <span key={e} className="size-2 rounded-full bg-[#1c120a] ring-1 ring-white/30 sm:size-2.5" />)}</span>
            <span className="-mb-0.5 mt-0.5 h-1.5 w-2.5 rounded-full bg-[#f4a6a6]" />
            <span className={`mt-1 flex w-full flex-1 items-center justify-center rounded-md border-2 border-[#5c3a1c] bg-[#fff3cf] px-0.5 font-extrabold leading-none text-slate-900 shadow ${signSize(word.han)}`}><span lang="zh-Hans">{word.han}</span></span>
          </span>
        </span>
      )}
      <span aria-hidden="true" className={`absolute inset-x-[2%] bottom-[7%] h-[24%] rounded-[50%] border-t-4 shadow-[0_5px_0_rgba(0,0,0,.35)] ${flash ? "border-red-300 bg-red-700" : "border-[#8d6238] bg-[#6a4322]"}`} />
      {fx && (
        <>
          <span aria-hidden="true" className="bz-hammer pointer-events-none absolute left-1/2 top-[30%] z-10 text-4xl">🔨</span>
          <span aria-hidden="true" className="bz-float pointer-events-none absolute left-1/2 top-[8%] z-10 text-lg font-extrabold text-yellow-200 [text-shadow:0_2px_0_#000]">+{fx.points}</span>
        </>
      )}
    </button>
  );
}
