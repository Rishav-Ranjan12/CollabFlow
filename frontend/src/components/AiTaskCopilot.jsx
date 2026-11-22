import React, { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { FiCheck, FiClock, FiFlag, FiRefreshCw, FiUser, FiZap } from "react-icons/fi"
import axiosInstance from "../utils/axioInstance"

const STEPS = [
  "Reading your task title",
  "Writing a clear description",
  "Estimating priority & deadline",
  "Building the checklist",
  "Finding the best teammate",
]

const PRIORITY_STYLE = {
  High: "border-rose-100 bg-rose-50 text-rose-700",
  Medium: "border-orange-100 bg-orange-50 text-orange-700",
  Low: "border-emerald-100 bg-emerald-50 text-emerald-700",
}

// Animated 3D orb: three orbiting rings around a glowing core (pure CSS).
const AiOrb = ({ busy }) => (
  <div className={`ai-orb ${busy ? "ai-orb--busy" : ""}`} aria-hidden="true">
    <span className="ai-orb__ring ai-orb__ring--a" />
    <span className="ai-orb__ring ai-orb__ring--b" />
    <span className="ai-orb__ring ai-orb__ring--c" />
    <span className="ai-orb__core">
      <FiZap />
    </span>
  </div>
)

const AiTaskCopilot = ({ title, notes, onApply }) => {
  const cardRef = useRef(null)
  const [phase, setPhase] = useState("idle") // idle | loading | ready
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState(null)
  const [assignee, setAssignee] = useState(null)
  const [applied, setApplied] = useState(false)

  // Cycle through the progress labels while the request is in flight.
  useEffect(() => {
    if (phase !== "loading") return
    setStep(0)
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      900
    )
    return () => clearInterval(timer)
  }, [phase])

  // 3D tilt following the pointer.
  const handleMove = (e) => {
    const el = cardRef.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty("--ry", `${x * 5}deg`)
    el.style.setProperty("--rx", `${-y * 4}deg`)
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`)
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`)
  }

  const handleLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty("--ry", "0deg")
    el.style.setProperty("--rx", "0deg")
  }

  const generate = async () => {
    if (!title.trim()) {
      toast.error("Type a task title first, then let AI draft the rest")
      return
    }

    setPhase("loading")
    setApplied(false)

    try {
      const draftRes = await axiosInstance.post("/ai/task-draft", {
        title: title.trim(),
        description: notes || "",
      })

      // Pick the least-busy teammate, weighted by the drafted priority.
      const assigneeRes = await axiosInstance
        .post("/ai/suggest-assignees", { priority: draftRes.data?.priority })
        .catch(() => null)
      const finalAssignee = assigneeRes?.data?.suggestions?.[0] || null

      // Keep the progress animation visible for at least a moment.
      await new Promise((r) => setTimeout(r, 1200))

      setDraft(draftRes.data)
      setAssignee(finalAssignee)
      setPhase("ready")
    } catch (error) {
      console.log("AI draft error:", error)
      toast.error(error?.response?.data?.message || "AI couldn't draft this task")
      setPhase("idle")
    }
  }

  const apply = () => {
    if (!draft) return
    const due = new Date()
    due.setDate(due.getDate() + (draft.suggestedDays || 5))

    onApply({
      description: draft.description,
      priority: draft.priority,
      dueDate: due,
      todoChecklist: draft.checklist,
      ...(assignee ? { assignedTo: [assignee.id] } : {}),
    })

    setApplied(true)
    toast.success("AI draft applied — review and tweak anything you like")
  }

  const dueLabel = draft
    ? `In ${draft.suggestedDays} day${draft.suggestedDays === 1 ? "" : "s"}`
    : ""

  return (
    <div className="ai-stage">
      <div
        ref={cardRef}
        className="ai-card"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="ai-card__glow" aria-hidden="true" />

        <div className="ai-card__body">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <AiOrb busy={phase === "loading"} />

            <div className="min-w-0 flex-1">
              <span className="ai-chip">
                <FiZap aria-hidden="true" /> AI Task Copilot
              </span>
              <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                {phase === "loading"
                  ? STEPS[step]
                  : phase === "ready"
                  ? "Your draft is ready"
                  : "Describe it in a few words — AI does the rest"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-indigo-100/80">
                {phase === "loading"
                  ? "Hang tight, this only takes a moment."
                  : "Enter a task title, then get a description, priority, deadline, checklist and the least-busy teammate in one click."}
              </p>

              {phase === "loading" && (
                <div className="mt-4 flex gap-1.5" aria-hidden="true">
                  {STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`ai-progress-dot ${i <= step ? "is-on" : ""}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {phase !== "loading" && (
              <button
                type="button"
                onClick={generate}
                className="ai-cta"
                disabled={phase === "loading"}
              >
                {phase === "ready" ? (
                  <>
                    <FiRefreshCw aria-hidden="true" /> Regenerate
                  </>
                ) : (
                  <>
                    <FiZap aria-hidden="true" /> Draft with AI
                  </>
                )}
              </button>
            )}
          </div>

          {phase === "ready" && draft && (
            <div className="ai-result mt-6">
              <div className="ai-reveal" style={{ "--i": 0 }}>
                <p className="ai-result__label">Description</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">
                  {draft.description}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="ai-tile ai-reveal" style={{ "--i": 1 }}>
                  <p className="ai-result__label">
                    <FiFlag aria-hidden="true" /> Priority
                  </p>
                  <span
                    className={`priority-pill mt-2 border ${
                      PRIORITY_STYLE[draft.priority] || PRIORITY_STYLE.Medium
                    }`}
                  >
                    {draft.priority}
                  </span>
                </div>

                <div className="ai-tile ai-reveal" style={{ "--i": 2 }}>
                  <p className="ai-result__label">
                    <FiClock aria-hidden="true" /> Deadline
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {dueLabel}
                  </p>
                </div>

                <div className="ai-tile ai-reveal" style={{ "--i": 3 }}>
                  <p className="ai-result__label">
                    <FiUser aria-hidden="true" /> Best assignee
                  </p>
                  {assignee ? (
                    <div className="mt-2 flex items-center gap-2">
                      {assignee.profileImageUrl ? (
                        <img
                          src={assignee.profileImageUrl}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                          {assignee.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {assignee.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {assignee.reason}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No teammates yet</p>
                  )}
                </div>
              </div>

              <div className="ai-reveal mt-4" style={{ "--i": 4 }}>
                <p className="ai-result__label">Checklist</p>
                <ul className="mt-2 space-y-1.5">
                  {draft.checklist.map((item, index) => (
                    <li
                      key={`${item}_${index}`}
                      className="ai-reveal flex items-start gap-2 text-sm text-slate-700"
                      style={{ "--i": 5 + index }}
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-600">
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="ai-reveal mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ "--i": 5 + draft.checklist.length }}
              >
                <p className="text-xs leading-5 text-slate-500">
                  <span className="font-semibold text-slate-700">Why: </span>
                  {draft.reasoning}
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {draft.source === "ai" ? "AI" : "Smart rules"}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={apply}
                  className="app-button shrink-0"
                  disabled={applied}
                >
                  {applied ? (
                    <>
                      <FiCheck aria-hidden="true" /> Applied
                    </>
                  ) : (
                    "Apply to task"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AiTaskCopilot
