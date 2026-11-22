import moment from "moment"
import React from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowRight } from "react-icons/fi"

const RecentTasks = ({ tasks }) => {
  const navigate = useNavigate()

  return (
    <div className="section-panel rise overflow-hidden" style={{ "--i": 7 }}>
      <div className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Recent tasks</h3>
          <p className="mt-1 text-sm text-slate-500">
            Latest activity across the workspace.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/tasks")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700"
        >
          <span>View all</span>
          <FiArrowRight className="text-base" />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        {tasks?.length > 0 ? (
          <div className="table-shell overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Task Name
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Priority
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Created On
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {task.title}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`status-pill ${
                          task.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : task.status === "Pending Verification"
                            ? "bg-orange-50 text-orange-700 border border-orange-100"
                            : task.status === "Pending"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`priority-pill ${
                          task.priority === "High"
                            ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                            : task.priority === "Medium"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-sm font-medium text-slate-500">
                      {moment(task.createdAt).format("MMM Do, YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
            No recent tasks found
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentTasks
