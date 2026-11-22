import React from "react"
import useCountUp from "../hooks/useCountUp"

// Animated SVG ring used in dashboard heroes.
const CompletionRing = ({ percent = 0, label = "Completed", size = 132 }) => {
  const p = Math.max(0, Math.min(100, percent))
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const n = useCountUp(p, 1100)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringg)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - p / 100)} className="ring-anim" style={{ "--circ": circ }}
        />
        <defs>
          <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8f8cff" />
            <stop offset="100%" stopColor="#2ccbe3" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-brand text-3xl font-bold text-white tabular-nums">{n}%</span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/60">{label}</span>
      </div>
    </div>
  )
}

export default CompletionRing
