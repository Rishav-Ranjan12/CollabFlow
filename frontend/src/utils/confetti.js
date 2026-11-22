// tiny dependency-free confetti burst (red/yellow/green to match task status)
export default function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const cv = document.createElement("canvas")
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999"
  cv.width = window.innerWidth; cv.height = window.innerHeight
  document.body.appendChild(cv)
  const ctx = cv.getContext("2d")
  const cols = ["#22c55e", "#4ade80", "#eab308", "#facc15", "#ef4444", "#6a67fb", "#ffffff"]
  const ps = Array.from({ length: 120 }, () => {
    const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[(Math.random() * cols.length) | 0] }
  })
  let t = 0
  const tick = () => {
    t++
    ctx.clearRect(0, 0, cv.width, cv.height)
    ps.forEach((p) => {
      p.vy += 0.22; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - t / 110)
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore()
    })
    if (t < 110) requestAnimationFrame(tick); else cv.remove()
  }
  tick()
}
