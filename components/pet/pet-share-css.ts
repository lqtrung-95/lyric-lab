/**
 * Kiểu của thẻ khoe pet. Phần tĩnh (nền, viền, tia, vầng sáng, ánh hologram) luôn hiện; chuyển động (viền quay, tia xoay, lấp lánh nhấp nháy,
 * confetti rơi, chữ vàng ánh, sao bật ra, thẻ lật vào) chỉ chạy trong `prefers-reduced-motion: no-preference`.
 * Thẻ có nền sáng cố định (không đổi theo giao diện tối) nên chữ tối trên nền sáng luôn đủ tương phản.
 */
export const SHARE_CSS = `
.share-stage { perspective: 900px }
.share-card { --rx: 0deg; --ry: 0deg; --mx: 50%; --my: 35%; position: relative; width: min(82vw, 20rem); border-radius: 28px; padding: 5px; overflow: hidden; transform: rotateX(var(--rx)) rotateY(var(--ry)); transition: transform .15s ease-out; box-shadow: 0 18px 40px -14px rgba(60,30,10,.55); touch-action: none }
.share-spin { position: absolute; inset: -60%; background: conic-gradient(from 0deg, #ff6b9d, #ffb347, #ffe66d, #6bdc9a, #5bc8ff, #a78bfa, #ff6b9d) }
.share-body { position: relative; overflow: hidden; border-radius: 23px; background: linear-gradient(180deg, var(--tint) 0%, #ffffff 52%, var(--tint) 100%) }
.share-rays { position: absolute; inset: -40%; background: repeating-conic-gradient(from 0deg at 50% 36%, rgba(255,255,255,.6) 0 8deg, transparent 8deg 20deg) }
.share-halo { position: absolute; left: 50%; top: 6.5rem; width: 15rem; aspect-ratio: 1; transform: translate(-50%,-50%); background: radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 68%) }
.share-sparkle { position: absolute; width: calc(var(--s) * 1.1rem); aspect-ratio: 1; transform: translate(-50%,-50%); background: linear-gradient(135deg, #ffe27a, #ffb21e); clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%); filter: drop-shadow(0 0 4px rgba(255,190,40,.9)); pointer-events: none }
.share-confetti { position: absolute; top: -12%; opacity: 0; border-radius: 2px; pointer-events: none }
.share-foil { color: #c2410c; -webkit-text-stroke: 1px rgba(255,255,255,.8); paint-order: stroke fill }
.share-star { display: inline-block }
.share-shine { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light; background: radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,.85), rgba(255,255,255,0) 46%), linear-gradient(115deg, rgba(255,255,255,0) 22%, rgba(255,90,210,.38) 40%, rgba(70,255,255,.38) 56%, rgba(255,255,255,0) 74%) }
@media (prefers-reduced-motion: no-preference) {
  @keyframes share-spin { to { transform: rotate(360deg) } }
  @keyframes share-rays { to { transform: rotate(360deg) } }
  @keyframes share-twinkle { 0%,100% { opacity: .25; transform: translate(-50%,-50%) scale(.6) rotate(0deg) } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.15) rotate(45deg) } }
  @keyframes share-fall { 0% { opacity: 1; transform: translateY(0) rotate(0deg) } 100% { opacity: 0; transform: translateY(26rem) rotate(var(--r)) } }
  @keyframes share-foil { to { background-position: -200% 0 } }
  @keyframes share-pop { 0% { opacity: 0; transform: scale(0) rotate(-40deg) } 70% { transform: scale(1.5) rotate(8deg) } 100% { opacity: 1; transform: scale(1) rotate(0) } }
  @keyframes share-in { 0% { opacity: 0; transform: perspective(900px) rotateY(100deg) scale(.7) } 70% { transform: perspective(900px) rotateY(-8deg) scale(1.03) } 100% { opacity: 1; transform: perspective(900px) rotateY(0) scale(1) } }
  @keyframes share-halo { 0%,100% { opacity: .8; transform: translate(-50%,-50%) scale(1) } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.12) } }
  @keyframes share-sheen { 0%,100% { background-position: 0 0, 0 0 } 50% { background-position: 0 0, 40% 0 } }
  .share-stage { animation: share-in .9s cubic-bezier(.2,.9,.3,1.1) both }
  .share-spin { animation: share-spin 6s linear infinite }
  .share-rays { transform-origin: 50% 36%; animation: share-rays 40s linear infinite }
  .share-halo { animation: share-halo 3s ease-in-out infinite }
  .share-sparkle { animation: share-twinkle 2.2s ease-in-out infinite; animation-delay: var(--d) }
  .share-confetti { animation: share-fall var(--t) ease-in forwards; animation-delay: calc(var(--d) + .5s) }
  .share-foil { background: linear-gradient(90deg, #c2410c, #f59e0b, #fff3b0, #f59e0b, #c2410c); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: share-foil 3s linear infinite }
  .share-star { animation: share-pop .5s cubic-bezier(.2,.9,.3,1.3) both; animation-delay: var(--d) }
  .share-shine { animation: share-sheen 5s ease-in-out infinite }
}`;
