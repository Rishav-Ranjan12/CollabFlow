import React from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight, FiBarChart2, FiClock, FiFlag } from "react-icons/fi"
import TaskRiskBadge from "./TaskRiskBadge"

const getPriorityTagColor = (priority) => {
  switch (priority) {
    case "High":
      return "border border-indigo-200 bg-indigo-50 text-indigo-800"
    case "Medium":
      return "border border-blue-100 bg-blue-50 text-blue-700"
    default:
      return "border border-slate-200 bg-slate-100 text-slate-600"
  }
}

const FocusNow = ({ recommendation, isLoading, hasError }) => {
  const navigate = useNavigate()
  const task = recommendation?.task
  const risk = task?.risk
  const progress = Number.isFinite(Number(task?.progress))
    ? Math.max(0, Math.min(100, Math.round(Number(task.progress))))
    : 0

  return (
    <div className="section-panel p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Today&apos;s priority
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            <span aria-hidden="true">🎯 </span>
            Focus Now
          </h3>
        </div>

        {task && <TaskRiskBadge risk={risk} />}
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-xl border border-slate-200/70 bg-slate-50/70 px-5 py-8 text-sm text-slate-500">
          Finding the best task to focus on…
        </div>
      ) : hasError ? (
        <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-5 py-5 text-sm text-amber-800">
          We couldn&apos;t load a recommendation right now. Your task list is still available.
        </div>
      ) : task ? (
        <>
          <div className="mt-6 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-teal-50/70 p-5">
            <h4 className="text-xl font-semibold text-slate-900">
              {task.title || "Untitled task"}
            </h4>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/80 bg-white/75 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <FiFlag aria-hidden="true" />
                  Priority
                </div>
                <span
                  className={`priority-pill mt-2 ${getPriorityTagColor(
                    task.priority
                  )}`}
                >
                  {task.priority || "No"} Priority
                </span>
              </div>

              <div className="rounded-lg border border-white/80 bg-white/75 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <FiClock aria-hidden="true" />
                  Deadline
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {risk?.dueLabel || "No due date"}
                </p>
              </div>

              <div className="rounded-lg border border-white/80 bg-white/75 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <FiBarChart2 aria-hidden="true" />
                  Progress
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {progress}% complete
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-slate-200/70 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Why this task?
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {recommendation.reason}
              </p>
            </div>

            <button
              className="app-button-secondary shrink-0"
              onClick={() => navigate(`/user/task-details/${task._id}`)}
              type="button"
            >
              Open task
              <FiArrowRight aria-hidden="true" className="text-base" />
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-10 text-center">
          <p className="text-3xl" aria-hidden="true">
            🎉
          </p>
          <h4 className="mt-3 text-xl font-semibold text-slate-900">
            You&apos;re all caught up!
          </h4>
          <p className="mt-2 text-sm text-slate-500">
            There are no active tasks assigned to you right now.
          </p>
        </div>
      )}
    </div>
  )
}

export default FocusNow
