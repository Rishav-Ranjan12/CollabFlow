import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import Navbar from "./Navbar"
import SideMenu from "./SideMenu"

const DashboardLayout = ({ children, activeMenu }) => {
  const { currentUser } = useSelector((state) => state.user)

  // cursor spotlight on cards
  useEffect(() => {
    if (!window.matchMedia("(hover:hover)").matches) return
    const onMove = (e) => {
      const t = e.target.closest && e.target.closest(".metric-card, .section-panel")
      if (!t) return
      const r = t.getBoundingClientRect()
      t.style.setProperty("--mx", `${e.clientX - r.left}px`)
      t.style.setProperty("--my", `${e.clientY - r.top}px`)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  return (
    <div className="min-h-screen">
      <div className="app-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
      {currentUser && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] xl:block">
          <SideMenu activeMenu={activeMenu} />
        </aside>
      )}

      <div className="xl:pl-[264px]">
        <Navbar activeMenu={activeMenu} />

        {currentUser && (
          <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">{children}</main>
        )}
      </div>
    </div>
  )
}

export default DashboardLayout
