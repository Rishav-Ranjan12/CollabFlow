import React from "react"
import useCountUp from "../hooks/useCountUp"

const StatCard = ({ label, value, icon: Icon, tone = "indigo", index = 0, hint }) => {
  const n = useCountUp(value)
  const tones = {
    indigo: "bg-blue-50 text-blue-600 ring-blue-100",
    amber: "bg-rose-50 text-rose-600 ring-rose-100",
    sky: "bg-yellow-50 text-yellow-600 ring-yellow-200",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  }
  const fills = {
    indigo: ["#ffffff", "#e2e5f1"],
    amber: ["#fee2e2", "#fca5a5"],
    sky: ["#fef9c3", "#fde047"],
    emerald: ["#dcfce7", "#86efac"],
  }[tone] || ["#ffffff", "#e2e5f1"]

  return (
    <div className="metric-card rise p-5" style={{ "--i": index + 1, background: fills[0], borderColor: fills[1] }}>
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-semibold text-slate-500">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 bg-white/70 ${tones[tone]}`}>
          <Icon className="text-xl" />
        </span>
      </div>
      <p className="font-brand mt-4 text-[40px] font-bold leading-none text-slate-900 tabular-nums">{n}</p>
      {hint && <p className="mt-2 text-xs font-medium text-slate-400">{hint}</p>}
    </div>
  )
}

export default StatCard
