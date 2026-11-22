import Task from "../models/task.model.js"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import { askJson, isAiConfigured } from "../utils/aiService.js"
import { heuristicDraft, heuristicInsights } from "../utils/aiHeuristics.js"
import {
  calculateDeadlineRisk,
  isTaskActive,
} from "../utils/taskIntelligence.js"

const PRIORITIES = ["Low", "Medium", "High"]
const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 }

const cleanText = (value, max) =>
  typeof value === "string" ? value.trim().slice(0, max) : ""

// Workload score per member: weighted by priority and risk of their active tasks.
const buildMemberLoads = async () => {
  const [users, tasks] = await Promise.all([
    User.find({ role: "user" }).select("name email profileImageUrl").lean(),
    Task.find({}).lean(),
  ])

  const activeTasks = tasks.filter(isTaskActive)

  const members = users.map((user) => {
    const mine = activeTasks.filter((task) =>
      (task.assignedTo || []).some((id) => String(id) === String(user._id))
    )
    const load = mine.reduce((sum, task) => {
      const risk = calculateDeadlineRisk(task)
      const riskBonus = ["CRITICAL", "OVERDUE"].includes(risk?.level) ? 2 : 0
      return sum + (PRIORITY_WEIGHT[task.priority] || 1) * 3 + riskBonus
    }, 0)

    return {
      id: String(user._id),
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      active: mine.length,
      highPriority: mine.filter((task) => task.priority === "High").length,
      load,
    }
  })

  return { members, tasks, activeTasks }
}

export const generateTaskDraft = async (req, res, next) => {
  try {
    const title = cleanText(req.body?.title, 200)
    const notes = cleanText(req.body?.description, 1500)

    if (!title) return next(errorHandler(400, "Enter a task title first"))

    const fallback = heuristicDraft({ title, description: notes })

    const ai = await askJson({
      system:
        "You are a project-management assistant. Turn a short task title into a clear, actionable task. " +
        'Return JSON: {"description": string (2-3 sentences), "priority": "Low"|"Medium"|"High", "suggestedDays": integer 1-30 (days until due), "checklist": string[] (4-7 short imperative steps), "reasoning": string (one sentence why this priority/timeline)}.',
      prompt: `Title: ${title}\nExisting notes: ${notes || "(none)"}`,
    })

    const valid =
      ai &&
      typeof ai.description === "string" &&
      PRIORITIES.includes(ai.priority) &&
      Array.isArray(ai.checklist) &&
      ai.checklist.length > 0

    const draft = valid
      ? {
          description: cleanText(ai.description, 1200),
          priority: ai.priority,
          suggestedDays: Math.min(30, Math.max(1, parseInt(ai.suggestedDays) || fallback.suggestedDays)),
          checklist: ai.checklist.map((s) => cleanText(String(s), 140)).filter(Boolean).slice(0, 8),
          reasoning: cleanText(ai.reasoning, 300) || fallback.reasoning,
        }
      : fallback

    res.status(200).json({ ...draft, source: valid ? "ai" : "smart-rules" })
  } catch (error) {
    next(error)
  }
}

export const suggestAssignees = async (req, res, next) => {
  try {
    const priority = PRIORITIES.includes(req.body?.priority) ? req.body.priority : "Medium"
    const { members } = await buildMemberLoads()

    const maxLoad = Math.max(1, ...members.map((m) => m.load))

    const ranked = members
      .map((m) => ({
        ...m,
        // 100 = completely free, 0 = busiest member
        availability: Math.round((1 - m.load / maxLoad) * 100),
      }))
      .sort((a, b) => a.load - b.load || a.active - b.active)
      .slice(0, 3)
      .map((m, index) => ({
        ...m,
        reason:
          m.active === 0
            ? "No active tasks right now"
            : priority === "High" && m.highPriority === 0
            ? `${m.active} active, none high priority`
            : `Lightest workload (${m.active} active)`,
        best: index === 0,
      }))

    res.status(200).json({ suggestions: ranked })
  } catch (error) {
    next(error)
  }
}

export const getWorkloadInsights = async (req, res, next) => {
  try {
    const { members, tasks, activeTasks } = await buildMemberLoads()

    const risky = activeTasks
      .map((task) => ({ task, risk: calculateDeadlineRisk(task) }))
      .filter(({ risk }) => risk && ["AT_RISK", "CRITICAL", "OVERDUE"].includes(risk.level))

    const overdue = risky
      .filter(({ risk }) => risk.level === "OVERDUE")
      .map(({ task }) => ({ title: task.title }))
    const atRisk = risky
      .filter(({ risk }) => risk.level !== "OVERDUE")
      .map(({ task }) => ({ title: task.title }))

    const stats = {
      members,
      overdue,
      atRisk,
      total: tasks.length,
      active: activeTasks.length,
    }

    const fallback = heuristicInsights(stats)

    const ai = await askJson({
      system:
        "You are a team-workload analyst for a task manager. Be concise and concrete; mention names and task titles. " +
        'Return JSON: {"summary": string (one sentence), "highlights": string[] (2-4 actionable bullets)}.',
      prompt: JSON.stringify({
        totalTasks: stats.total,
        activeTasks: stats.active,
        overdue: overdue.slice(0, 8),
        atRisk: atRisk.slice(0, 8),
        members: members.map(({ name, active, highPriority, load }) => ({ name, active, highPriority, load })),
      }),
      maxTokens: 600,
    })

    const valid = ai && typeof ai.summary === "string" && Array.isArray(ai.highlights) && ai.highlights.length

    const healthScore = Math.max(
      0,
      100 - overdue.length * 18 - atRisk.length * 8
    )

    res.status(200).json({
      summary: valid ? cleanText(ai.summary, 300) : fallback.summary,
      highlights: valid
        ? ai.highlights.map((h) => cleanText(String(h), 240)).filter(Boolean).slice(0, 4)
        : fallback.highlights,
      healthScore,
      members: [...members].sort((a, b) => b.load - a.load),
      source: valid ? "ai" : "smart-rules",
      aiConfigured: isAiConfigured(),
    })
  } catch (error) {
    next(error)
  }
}
