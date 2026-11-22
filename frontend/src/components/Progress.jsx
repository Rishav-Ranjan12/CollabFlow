import React from "react"

const Progress = ({ progress, status }) => {
  const p = Number.isFinite(Number(progress)) ? Math.max(0, Math.min(100, Math.round(Number(progress)))) : 0
  const color =
    status === "Completed" ? "from-emerald-400 to-emerald-500" : status === "In Progress" ? "from-yellow-300 to-yellow-500" : status === "Pending Verification" ? "from-orange-300 to-orange-500" : "from-rose-400 to-rose-500"

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Progress</span>
        <span className="tabular-nums text-slate-700">{p}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
        <div className={`bar-shimmer relative h-full overflow-hidden rounded-full bg-gradient-to-r ${color} transition-[width] duration-700`} style={{ width: `${p}%` }}></div>
      </div>
    </div>
  )
}

export default Progress
