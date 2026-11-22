// Offline fallbacks used when no LLM key is configured.

const HIGH_WORDS = /\b(urgent|asap|critical|blocker|outage|production|prod|security|bug|hotfix|deadline|launch|client|fix)\b/i
const LOW_WORDS = /\b(cleanup|refactor|docs?|documentation|nice to have|explore|research|minor|typo|someday)\b/i

const CHECKLIST_TEMPLATES = [
  {
    match: /\b(bug|fix|issue|error|crash)\b/i,
    steps: ["Reproduce the issue", "Identify the root cause", "Implement the fix", "Add or update tests", "Verify on staging and close"],
  },
  {
    match: /\b(design|ui|ux|mockup|wireframe|landing)\b/i,
    steps: ["Gather requirements and references", "Sketch wireframes", "Build high-fidelity design", "Collect feedback and iterate", "Hand off final assets"],
  },
  {
    match: /\b(api|backend|endpoint|database|server)\b/i,
    steps: ["Define the contract and data model", "Implement the endpoint or logic", "Handle validation and errors", "Write tests", "Document and deploy"],
  },
  {
    match: /\b(report|analysis|analy[sz]e|research|survey)\b/i,
    steps: ["Define the question and scope", "Collect the data", "Analyse findings", "Draft the summary", "Review and share"],
  },
  {
    match: /\b(launch|release|deploy|rollout)\b/i,
    steps: ["Confirm launch checklist", "Run final QA", "Prepare rollback plan", "Deploy / release", "Monitor and announce"],
  },
]

const DEFAULT_STEPS = ["Clarify the goal and scope", "Plan the approach", "Do the main work", "Review the result", "Share and close out"]

export const heuristicDraft = ({ title = "", description = "" }) => {
  const text = `${title} ${description}`
  const priority = HIGH_WORDS.test(text) ? "High" : LOW_WORDS.test(text) ? "Low" : "Medium"
  const template = CHECKLIST_TEMPLATES.find((t) => t.match.test(text))
  const checklist = template?.steps || DEFAULT_STEPS
  const suggestedDays = priority === "High" ? 2 : priority === "Medium" ? 5 : 10

  return {
    description:
      description.trim() ||
      `${title.trim()}. Break the work into the checklist steps below, keep the assignee updated on progress, and submit it for verification once every step is complete.`,
    priority,
    suggestedDays,
    checklist,
    reasoning:
      priority === "High"
        ? "Wording suggests urgency or impact, so a short deadline is suggested."
        : priority === "Low"
        ? "Looks like maintenance or exploratory work, so a relaxed deadline is suggested."
        : "Balanced scope; a standard one-week-ish timeline is suggested.",
  }
}

export const heuristicInsights = ({ members, atRisk, overdue, total, active }) => {
  const sorted = [...members].sort((a, b) => b.load - a.load)
  const busiest = sorted[0]
  const lightest = sorted[sorted.length - 1]
  const highlights = []

  if (overdue.length) highlights.push(`${overdue.length} task${overdue.length > 1 ? "s are" : " is"} overdue — review "${overdue[0].title}" first.`)
  if (atRisk.length) highlights.push(`${atRisk.length} active task${atRisk.length > 1 ? "s are" : " is"} at risk of missing the deadline.`)
  if (busiest && lightest && busiest.id !== lightest.id && busiest.load - lightest.load >= 15)
    highlights.push(`${busiest.name} carries the heaviest load (${busiest.active} active). Consider moving work to ${lightest.name} (${lightest.active} active).`)
  if (!highlights.length) highlights.push("Workload looks balanced and no deadlines are under threat.")

  return {
    summary: `${active} of ${total} tasks are active. ${overdue.length} overdue, ${atRisk.length} at risk.`,
    highlights,
  }
}
