import React, { useRef, useState } from "react"
import HeroScene from "./HeroScene"
import { LuWorkflow, LuCheck } from "react-icons/lu"

const CARDS = [
  { t: "Design review", s: "In Progress", p: 72, c: "#facc15", z: 0 },
  { t: "Ship onboarding v2", s: "Pending Verification", p: 100, c: "#fb923c", z: 70 },
  { t: "Write release notes", s: "Pending", p: 25, c: "#f87171", z: 140 },
  { t: "Sprint retro", s: "Completed", p: 100, c: "#4ade80", z: 210 },
]

const AuthLayout = ({ children }) => {
  const sceneRef = useRef(null)
  const [gl, setGl] = useState(true)

  const onMove = (e) => {
    const el = sceneRef.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty("--rx", `${58 - y * 14}deg`)
    el.style.setProperty("--rz", `${-32 + x * 18}deg`)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-h-screen flex-col bg-white px-6 py-7 sm:px-12 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-xl text-white shadow-lg shadow-blue-600/30">
            <LuWorkflow />
          </div>
          <span className="font-brand text-xl font-bold text-slate-900">CollabFlow</span>
        </div>

        <div className="flex flex-1 items-center">
          <div className="rise mx-auto w-full max-w-[440px] py-10">{children}</div>
        </div>

        <p className="text-xs text-slate-400">© {new Date().getFullYear()} CollabFlow — plan, assign, verify, ship.</p>
      </div>

      <div
        className="hero-panel relative hidden overflow-hidden rounded-none lg:flex"
        onMouseMove={onMove}
        onMouseLeave={() => {
          sceneRef.current?.style.setProperty("--rx", "58deg")
          sceneRef.current?.style.setProperty("--rz", "-32deg")
        }}
      >
        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <div>
            <span className="eyebrow-badge">Team workspace</span>
            <h2 className="mt-6 max-w-md text-4xl font-bold leading-[1.1] xl:text-5xl">
              Work that moves,
              <span className="bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent"> verified.</span>
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-7 text-white/65">
              Assign tasks, track progress and sign off completed work — all in one calm, focused place.
            </p>
          </div>

          <div className="flex-1 pt-6">
            {gl ? (
              <HeroScene className="auth-scene" onFail={() => setGl(false)} />
            ) : (
              <div className="stack-stage flex h-full items-center justify-center pt-24">
                <div className="stack-scene" ref={sceneRef} style={{ "--rx": "58deg", "--rz": "-32deg" }}>
                  {CARDS.map((c, i) => (
                    <div key={c.t} className="stack-card" style={{ "--z": `${c.z}px`, "--i": i, top: `${(3 - i) * 12 + 20}px` }}>
                      <p className="text-[15px] font-semibold">{c.t}</p>
                      <p className="mt-1 text-xs text-white/55">{c.s}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full" style={{ width: `${c.p}%`, background: c.c }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            {[["Clear", "Dashboards"], ["Fluid", "Teamwork"], ["Focused", "Delivery"]].map(([a, b]) => (
              <div key={b} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-wider text-white/50">{b}</p>
                <p className="font-brand mt-1 text-lg font-semibold">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
