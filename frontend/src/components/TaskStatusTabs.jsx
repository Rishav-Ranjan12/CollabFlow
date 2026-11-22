import React from "react"

const TaskStatusTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="soft-scrollbar -mx-1 flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => {
        const on = activeTab === tab.label
        return (
          <button
            key={tab.label}
            type="button"
            className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold ${
              on ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab(tab.label)}
          >
            <span>{tab.label}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${on ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default TaskStatusTabs
