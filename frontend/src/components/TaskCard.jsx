import React, { useRef } from "react"
import moment from "moment"
import AvatarGroup from "./AvatarGroup"
import { FiCalendar, FiCheckCircle, FiPaperclip } from "react-icons/fi"
import TaskRiskBadge from "./TaskRiskBadge"
import Progress from "./Progress"

const STATUS = {
  Pending: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  "In Progress": "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  "Pending Verification": "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
}
const TINT = {
  Pending: { bg: "#fee2e2", border: "#fca5a5", bar: "bg-red-500" },
  "In Progress": { bg: "#fef9c3", border: "#fde047", bar: "bg-yellow-400" },
  "Pending Verification": { bg: "#ffedd5", border: "#fdba74", bar: "bg-orange-400" },
  Completed: { bg: "#dcfce7", border: "#86efac", bar: "bg-green-500" },
}
const PRIORITY = {
  High: ["bg-indigo-700", "text-indigo-800"],
  Medium: ["bg-blue-500", "text-blue-700"],
  Low: ["bg-slate-400", "text-slate-600"],
}

const TaskCard = ({
  title, description, priority, status, progress, createdAt, dueDate, assignedTo,
  attachmentCount, completedTodoCount, todoChecklist, risk, onClick, index = 0,
}) => {
  const ref = useRef(null)
  const list = Array.isArray(todoChecklist) ? todoChecklist : []
  const st = status || "Pending"
  const pr = PRIORITY[priority] || PRIORITY.Low
  const tint = TINT[status || "Pending"] || TINT.Pending
  const pct = Number.isFinite(Number(progress)) ? Math.max(0, Math.min(100, Math.round(Number(progress)))) : 0
  const due = moment(dueDate).isValid() ? moment(dueDate).format("D MMM YYYY") : "No due date"
  const start = moment(createdAt).isValid() ? moment(createdAt).format("D MMM YYYY") : "N/A"

  const move = (e) => {
    const el = ref.current
    if (!el || !window.matchMedia("(hover:hover)").matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-3px)`
  }
  const leave = () => ref.current && (ref.current.style.transform = "")

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      onClick={onClick}
      className="section-panel flip-in group relative cursor-pointer overflow-hidden p-5 transition-[transform,box-shadow] duration-200 hover:shadow-[0_24px_50px_-22px_rgba(40,40,120,0.35)]"
      style={{ "--i": Math.min(index, 8), background: tint.bg, borderColor: tint.border }}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${tint.bar}`}></span>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`status-pill ${STATUS[st] || STATUS.Pending}`}>{st}</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${pr[1]}`}>
          <span className={`h-2 w-2 rounded-full ${pr[0]}`}></span>
          {priority || "Low"} priority
        </span>
        <span className="ml-auto"><TaskRiskBadge risk={risk} /></span>
      </div>

      <h3 className="mt-4 text-[17px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
        {title || "Untitled task"}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-500">{description || "No description provided."}</p>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <FiCheckCircle className="text-emerald-500" />
          {completedTodoCount || 0} of {list.length} subtasks
        </div>
        <Progress progress={pct} status={st} />
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-black/10 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><FiCalendar /> {start}</span>
        <span className="text-slate-300">→</span>
        <span className="font-semibold text-slate-700">{risk?.dueLabel || due}</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <AvatarGroup avatars={assignedTo || []} />
        {attachmentCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
            <FiPaperclip /> {attachmentCount}
          </span>
        )}
      </div>
    </div>
  )
}

export default TaskCard
