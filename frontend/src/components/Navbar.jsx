import React, { useState } from "react"
import { MdClose, MdMenu } from "react-icons/md"
import { useSelector } from "react-redux"
import SideMenu from "./SideMenu"

const Navbar = ({ activeMenu }) => {
  const [open, setOpen] = useState(false)
  const { currentUser } = useSelector((state) => state.user)
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 xl:hidden"
              onClick={() => setOpen(true)}
            >
              <MdMenu className="text-2xl" />
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">CollabFlow</p>
              <h2 className="truncate text-lg font-bold leading-tight text-slate-900">{activeMenu}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:block">
              {today}
            </p>

            <div className="flex items-center gap-2.5">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-900">{currentUser?.name || "CollabFlow"}</p>
                <p className="text-[11px] font-medium capitalize text-slate-400">{currentUser?.role || "member"}</p>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 ring-2 ring-white shadow">
                {currentUser?.profileImageUrl ? (
                  <img src={currentUser.profileImageUrl} alt={currentUser?.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-bold text-white">
                    {(currentUser?.name || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex xl:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
          <div className="relative z-50 h-full w-[280px] max-w-[85vw]">
            <button
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white"
              onClick={() => setOpen(false)}
            >
              <MdClose className="text-xl" />
            </button>
            <SideMenu activeMenu={activeMenu} />
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
