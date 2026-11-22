import React, { useEffect, useState } from "react"
import axiosInstance from "../utils/axioInstance"
import { useDispatch, useSelector } from "react-redux"
import { signOutSuccess } from "../redux/slice/userSlice"
import { useNavigate } from "react-router-dom"
import { SIDE_MENU_DATA, USER_SIDE_MENU_DATA } from "../utils/data"
import { LuWorkflow } from "react-icons/lu"

const SideMenu = ({ activeMenu }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [SideMenuData, setSideMenuData] = useState([])
  const { currentUser } = useSelector((state) => state.user)

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/auth/sign-out")

      if (response.data) {
        dispatch(signOutSuccess())
        navigate("/login")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClick = (route) => {
    if (route === "logout") return handleLogout()
    navigate(route)
  }

  useEffect(() => {
    if (currentUser) {
      setSideMenuData(currentUser?.role === "admin" ? SIDE_MENU_DATA : USER_SIDE_MENU_DATA)
    }
  }, [currentUser])

  const main = SideMenuData.filter((i) => i.path !== "logout")
  const logout = SideMenuData.find((i) => i.path === "logout")

  return (
    <div className="rail relative flex h-full w-full flex-col overflow-hidden px-4 py-5">
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-600/30 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl"></div>

      <div className="relative flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 text-xl text-white shadow-lg shadow-blue-600/40">
          <LuWorkflow />
        </div>
        <div>
          <p className="font-brand text-[17px] font-bold leading-none text-white">CollabFlow</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {currentUser?.role === "admin" ? "Admin workspace" : "Member workspace"}
          </p>
        </div>
      </div>

      <nav className="soft-scrollbar relative mt-9 flex-1 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-500">Menu</p>
        {main.map((item) => (
          <button
            key={item.id}
            className={`rail-link ${activeMenu === item.label ? "is-active" : ""}`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-[21px]" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="relative mt-4 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-700 ring-2 ring-white/10">
            {currentUser?.profileImageUrl ? (
              <img src={currentUser.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {(currentUser?.name || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{currentUser?.name || ""}</p>
            <p className="truncate text-xs text-slate-400">{currentUser?.email || ""}</p>
          </div>
        </div>

        {logout && (
          <button className="rail-link" onClick={() => handleClick("logout")}>
            <logout.icon className="text-[21px]" />
            <span>Log out</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default SideMenu
