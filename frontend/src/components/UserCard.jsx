import React from "react"

const Stat = ({ label, count, cls }) => (
  <div className={`rounded-xl p-3 ${cls}`}>
    <p className="font-brand text-2xl font-bold tabular-nums">{count}</p>
    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
  </div>
)

const UserCard = ({ userInfo, index = 0 }) => {
  return (
    <div className="section-panel rise p-5 transition hover:-translate-y-1 hover:shadow-md" style={{ "--i": Math.min(index, 8) }}>
      <div className="flex items-center gap-3.5">
        {userInfo?.profileImageUrl ? (
          <img src={userInfo.profileImageUrl} alt={userInfo?.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">{(userInfo?.name || "U")[0]}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900">{userInfo?.name}</p>
          <p className="truncate text-sm text-slate-500">{userInfo?.email}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">Active</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Stat label="Pending" count={userInfo?.pendingTasks || 0} cls="bg-rose-50 text-rose-700" />
        <Stat label="Active" count={userInfo?.inProgressTasks || 0} cls="bg-yellow-50 text-yellow-700" />
        <Stat label="Done" count={userInfo?.completedTasks || 0} cls="bg-emerald-50 text-emerald-700" />
      </div>
    </div>
  )
}

export default UserCard
