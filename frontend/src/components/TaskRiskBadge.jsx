import React from "react"
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiClock } from "react-icons/fi"

const RISK_STYLES = {
  ON_TRACK: { className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100", icon: FiCheckCircle },
  AT_RISK: { className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100", icon: FiAlertTriangle },
  CRITICAL: { className: "bg-rose-50 text-rose-700 ring-1 ring-rose-100", icon: FiAlertCircle },
  OVERDUE: { className: "bg-slate-800 text-white", icon: FiClock },
}

const TaskRiskBadge = ({ risk }) => {
  const s = RISK_STYLES[risk?.level]
  if (!s) return null
  const Icon = s.icon
  return (
    <span className={`status-pill ${s.className}`} title={`Deadline risk: ${risk.label}`} aria-label={`Deadline risk: ${risk.label}`}>
      <Icon aria-hidden="true" className="text-sm" />
      {risk.label}
    </span>
  )
}

export default TaskRiskBadge
