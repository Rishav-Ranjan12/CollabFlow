import { useEffect, useState } from "react"

// Animates a number from 0 to `value` (respects reduced-motion).
const useCountUp = (value = 0, duration = 900) => {
  const [n, setN] = useState(0)

  useEffect(() => {
    const target = Number(value) || 0
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return n
}

export default useCountUp
