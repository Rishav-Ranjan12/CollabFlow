const DAY_IN_MS = 24 * 60 * 60 * 1000

const RISK_LABELS = {
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  CRITICAL: "Critical",
  OVERDUE: "Overdue",
}

const PRIORITY_SCORES = {
  High: 40,
  Medium: 25,
  Low: 10,
}

const PRIORITY_RISK_SCORES = {
  High: 15,
  Medium: 8,
  Low: 4,
}

const EXCLUDED_STATUSES = new Set([
  "completed",
  "pending verification",
  "pending_verification",
  "cancelled",
  "canceled",
  "archived",
])

const toValidDate = (value) => {
  if (!value) return null

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

const getDayNumber = (date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_IN_MS

const getDueDateInfo = (dueDate, now) => {
  const due = toValidDate(dueDate)
  const currentTime = toValidDate(now) || new Date()

  if (!due) return null

  // A task selected for a calendar date remains due until the end of that day.
  const dueEnd = new Date(due)
  dueEnd.setHours(23, 59, 59, 999)

  return {
    daysRemaining: getDayNumber(due) - getDayNumber(currentTime),
    isOverdue: currentTime.getTime() > dueEnd.getTime(),
  }
}

const getDueLabel = (dueInfo) => {
  if (!dueInfo) return "No due date"

  if (dueInfo.isOverdue) {
    const overdueDays = Math.max(1, Math.abs(dueInfo.daysRemaining))
    return `Due ${overdueDays} day${overdueDays === 1 ? "" : "s"} ago`
  }

  if (dueInfo.daysRemaining === 0) return "Due today"
  if (dueInfo.daysRemaining === 1) return "Due tomorrow"

  return `Due in ${dueInfo.daysRemaining} days`
}

const getUrgencyScore = (dueInfo) => {
  if (!dueInfo) return 0
  if (dueInfo.isOverdue) return 50
  if (dueInfo.daysRemaining <= 1) return 40
  if (dueInfo.daysRemaining <= 3) return 30
  if (dueInfo.daysRemaining <= 7) return 15
  return 5
}

export const getTaskProgress = (task = {}) => {
  const explicitProgress = Number(task?.progress)

  if (Number.isFinite(explicitProgress)) {
    return Math.max(0, Math.min(100, Math.round(explicitProgress)))
  }

  const checklist = Array.isArray(task?.todoChecklist)
    ? task.todoChecklist
    : []

  if (!checklist.length) return 0

  const completedCount = checklist.filter((item) => item?.completed).length
  return Math.round((completedCount / checklist.length) * 100)
}

export const isTaskActive = (task = {}) => {
  const status = String(task?.status || "").trim().toLowerCase()
  return !EXCLUDED_STATUSES.has(status)
}

export const calculateDeadlineRisk = (task = {}, now = new Date()) => {
  if (!isTaskActive(task)) return null

  const progress = getTaskProgress(task)
  const dueInfo = getDueDateInfo(task?.dueDate, now)

  if (!dueInfo) {
    return {
      level: "ON_TRACK",
      label: RISK_LABELS.ON_TRACK,
      score: 0,
      dueLabel: "No due date",
      daysRemaining: null,
    }
  }

  if (dueInfo.isOverdue) {
    return {
      level: "OVERDUE",
      label: RISK_LABELS.OVERDUE,
      score: 100,
      dueLabel: getDueLabel(dueInfo),
      daysRemaining: dueInfo.daysRemaining,
    }
  }

  const priorityRiskScore = PRIORITY_RISK_SCORES[task?.priority] || 0
  const progressRiskScore = Math.round((100 - progress) * 0.35)
  const score = Math.min(
    100,
    getUrgencyScore(dueInfo) + priorityRiskScore + progressRiskScore
  )

  let level = "ON_TRACK"

  if (
    (dueInfo.daysRemaining === 0 && progress < 100) ||
    (dueInfo.daysRemaining <= 1 && score >= 60) ||
    (dueInfo.daysRemaining <= 3 && score >= 75)
  ) {
    level = "CRITICAL"
  } else if (dueInfo.daysRemaining <= 7 && score >= 45) {
    level = "AT_RISK"
  }

  return {
    level,
    label: RISK_LABELS[level],
    score,
    dueLabel: getDueLabel(dueInfo),
    daysRemaining: dueInfo.daysRemaining,
  }
}

const getRecommendationReason = ({ priority, urgencyScore, progress, risk }) => {
  const reasons = []

  if (risk?.level === "OVERDUE") {
    reasons.push("Overdue")
  }

  if (priority === "High") {
    reasons.push("High priority")
  }

  if (urgencyScore >= 30 && risk?.level !== "OVERDUE") {
    reasons.push("Deadline approaching")
  }

  if (reasons.length < 2 && progress > 0 && progress < 100) {
    reasons.push("Currently in progress")
  }

  if (reasons.length < 2 && progress <= 25) {
    reasons.push("Task is still incomplete")
  }

  return reasons.slice(0, 2).join(" + ") || "Best active task to keep moving"
}

export const calculateTaskScore = (task = {}, now = new Date()) => {
  if (!isTaskActive(task)) return null

  const progress = getTaskProgress(task)
  const risk = calculateDeadlineRisk(task, now)
  const dueInfo = getDueDateInfo(task?.dueDate, now)
  const urgencyScore = getUrgencyScore(dueInfo)
  const priorityScore = PRIORITY_SCORES[task?.priority] || 0

  let score = priorityScore + urgencyScore

  if (progress <= 25) {
    score += 8
  } else if (progress < 100) {
    score += 5
  }

  if (risk?.level === "CRITICAL") score += 20
  if (risk?.level === "AT_RISK") score += 10

  return {
    score,
    reason: getRecommendationReason({
      priority: task?.priority,
      urgencyScore,
      progress,
      risk,
    }),
    risk,
  }
}

const getDueTimestamp = (task) => {
  const dueDate = toValidDate(task?.dueDate)
  return dueDate ? dueDate.getTime() : Number.MAX_SAFE_INTEGER
}

export const getNextBestTask = (tasks = [], now = new Date()) => {
  if (!Array.isArray(tasks)) return null

  const candidates = tasks
    .map((task) => {
      const recommendation = calculateTaskScore(task, now)

      if (!recommendation) return null

      return {
        task: { ...task, risk: recommendation.risk },
        score: recommendation.score,
        reason: recommendation.reason,
      }
    })
    .filter(Boolean)

  candidates.sort((first, second) => {
    if (second.score !== first.score) return second.score - first.score

    const dueDateDifference =
      getDueTimestamp(first.task) - getDueTimestamp(second.task)

    if (dueDateDifference !== 0) return dueDateDifference

    return String(first.task?._id || "").localeCompare(
      String(second.task?._id || "")
    )
  })

  return candidates[0] || null
}
