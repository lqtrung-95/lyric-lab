/**
 * Hoạt ảnh dùng chung của các game giải trí (CSS thuần, không thư viện). Tất cả nằm trong `prefers-reduced-motion: no-preference`:
 * người chọn giảm chuyển động thấy cảnh tĩnh nhưng vẫn chơi được. Gắn một lần trong mỗi game.
 */
const CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes bz-drift { from { background-position: 0 0 } to { background-position: 0 var(--tile, 180px) } }
  @keyframes bz-twinkle { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
  @keyframes bz-flame { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.45) } }
  @keyframes bz-pop { 0% { transform: scale(.55); opacity: 0 } 70% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1) } }
  @keyframes bz-sway { from { transform: rotate(-2.2deg) } to { transform: rotate(2.2deg) } }
  @keyframes bz-particle { 0% { transform: translate(0,0) scale(1); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(.2); opacity: 0 } }
  @keyframes bz-ring { 0% { transform: translate(-50%,-50%) scale(.2); opacity: .9 } 100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0 } }
  @keyframes bz-float { 0% { opacity: 0; transform: translate(-50%,0) scale(.6) } 15% { opacity: 1 } 100% { opacity: 0; transform: translate(-50%,-52px) scale(1.15) } }
  @keyframes bz-shake { 0%,100% { transform: translate(0,0) } 20% { transform: translate(-7px,3px) } 40% { transform: translate(6px,-4px) } 60% { transform: translate(-4px,-2px) } 80% { transform: translate(3px,3px) } }
  @keyframes bz-banner { 0% { transform: translate(-50%,-50%) scale(.4); opacity: 0 } 20% { transform: translate(-50%,-50%) scale(1.15); opacity: 1 } 80% { opacity: 1 } 100% { transform: translate(-50%,-50%) scale(1); opacity: 0 } }
  @keyframes bz-danger { 0%,100% { box-shadow: 0 0 6px rgba(248,113,113,.4) } 50% { box-shadow: 0 0 22px rgba(248,113,113,.95) } }
  @keyframes bz-mole-up { 0% { transform: translateY(112%) } 65% { transform: translateY(-7%) } 100% { transform: translateY(0) } }
  @keyframes bz-hammer { 0% { transform: translate(-50%,-50%) rotate(-65deg); opacity: 0 } 25% { opacity: 1 } 60%,100% { transform: translate(-50%,-50%) rotate(18deg) } 100% { opacity: 0 } }
  @keyframes bz-shrink { from { transform: scaleX(1) } to { transform: scaleX(0) } }
  .bz-drift { animation: bz-drift var(--dur, 16s) linear infinite }
  .bz-twinkle { animation: bz-twinkle 3s ease-in-out infinite }
  .bz-flame { transform-origin: top center; animation: bz-flame .18s ease-in-out infinite }
  .bz-pop { animation: bz-pop .28s ease-out both }
  .bz-sway { animation: bz-sway 2.4s ease-in-out infinite alternate }
  .bz-particle { animation: bz-particle .6s ease-out forwards }
  .bz-ring { animation: bz-ring .5s ease-out forwards }
  .bz-float { animation: bz-float .8s ease-out forwards }
  .bz-shake { animation: bz-shake .4s linear }
  .bz-banner { animation: bz-banner 1.6s ease-out forwards }
  .bz-danger { animation: bz-danger .7s ease-in-out infinite }
  .bz-mole { animation: bz-mole-up .24s cubic-bezier(.2,.9,.3,1.2) both }
  .bz-hammer { animation: bz-hammer .35s ease-out forwards }
  .bz-shrink { transform-origin: left; animation: bz-shrink var(--win, 2s) linear forwards }
}
`;

export function GameKeyframes() {
  return <style>{CSS}</style>;
}
