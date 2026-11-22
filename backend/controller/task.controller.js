import mongoose from "mongoose"
import Task from "../models/task.model.js"
import { errorHandler } from "../utils/error.js"
import {
  calculateDeadlineRisk,
  getNextBestTask,
} from "../utils/taskIntelligence.js"

const TASK_STATUSES = [
  "Pending",
  "In Progress",
  "Pending Verification",
  "Completed",
]

const getTaskDetails = (taskId) =>
  Task.findById(taskId).populate([
    { path: "assignedTo", select: "name email profileImageUrl" },
    { path: "verification.submittedBy", select: "name email profileImageUrl" },
    { path: "verification.lastReview.reviewer", select: "name email profileImageUrl" },
    {
      path: "verificationHistory.submittedBy",
      select: "name email profileImageUrl",
    },
    {
      path: "verificationHistory.reviewer",
      select: "name email profileImageUrl",
    },
  ])

const isTaskAssignedToUser = (task, userId) =>
  Array.isArray(task?.assignedTo) &&
  task.assignedTo.some(
    (assignedUser) => String(assignedUser?._id || assignedUser) === String(userId)
  )

const markTaskChecklistComplete = (task) => {
  const checklist = Array.isArray(task?.todoChecklist)
    ? task.todoChecklist
    : []

  checklist.forEach((item) => {
    item.completed = true
  })
}

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

const getSubmissionInput = (body = {}) => {
  const workUrl = typeof body.workUrl === "string" ? body.workUrl.trim() : ""
  const comment = typeof body.comment === "string" ? body.comment.trim() : ""
  const attachments = Array.isArray(body.attachments)
    ? [...new Set(body.attachments.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean))]
    : []

  if (!workUrl && attachments.length === 0) {
    return { error: "Add a work URL or at least one attachment link" }
  }

  if ((workUrl && !isValidHttpUrl(workUrl)) || attachments.some((link) => !isValidHttpUrl(link))) {
    return { error: "Work and attachment links must be valid HTTP(S) URLs" }
  }

  if (comment.length > 2000) {
    return { error: "Verification comment must be 2000 characters or fewer" }
  }

  return { workUrl, attachments, comment }
}

const getUserNextBestTask = async (userId) => {
  const activeTasks = await Task.find({
    assignedTo: userId,
    status: {
      $nin: [
        "Completed",
        "Pending Verification",
        "Cancelled",
        "Canceled",
        "Archived",
      ],
    },
  })
    .select("title priority status dueDate progress todoChecklist createdAt")
    .lean()

  return getNextBestTask(activeTasks)
}

const findVerificationRequests = () =>
  Task.find({ status: "Pending Verification" })
    .sort({ "verification.submittedAt": 1 })
    .select("title priority status dueDate assignedTo verification")
    .populate([
      { path: "assignedTo", select: "name email profileImageUrl" },
      { path: "verification.submittedBy", select: "name email profileImageUrl" },
    ])
    .lean()

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
    } = req.body

    if (!Array.isArray(assignedTo)) {
      return next(errorHandler(400, "assignedTo must be an array of user IDs"))
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      createdBy: req.user.id,
    })

    res.status(201).json({ message: "Task created successfully", task })
  } catch (error) {
    next(error)
  }
}

export const getTasks = async (req, res, next) => {
  try {
    const { status } = req.query

    let filter = {}

    if (status) {
      filter.status = status
    }

    let tasks

    if (req.user.role === "admin") {
      tasks = await Task.find(filter)
        .select("-verificationHistory")
        .populate("assignedTo", "name email profileImageUrl")
    } else {
      tasks = await Task.find({
        ...filter,
        assignedTo: req.user.id,
      })
        .select("-verificationHistory")
        .populate("assignedTo", "name email profileImageUrl")
    }

    tasks = tasks.map((task) => {
      const checklist = Array.isArray(task.todoChecklist)
        ? task.todoChecklist
        : []
      const completedCount = checklist.filter((item) => item?.completed).length

      return {
        ...task._doc,
        completedCount,
        risk: calculateDeadlineRisk(task),
      }
    })

    // status summary count

    const allTasks = await Task.countDocuments(
      req.user.role === "admin" ? {} : { assignedTo: req.user.id }
    )

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
      //   if logged in user is not admin then add assignedTo filter
      //  if logged in user is an admin then nothing to do, just count
      ...(req.user.role !== "admin" && { assignedTo: req.user.id }),
    })

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In Progress",
      ...(req.user.role !== "admin" && { assignedTo: req.user.id }),
    })

    const pendingVerificationTasks = await Task.countDocuments({
      ...filter,
      status: "Pending Verification",
      ...(req.user.role !== "admin" && { assignedTo: req.user.id }),
    })

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
      ...(req.user.role !== "admin" && { assignedTo: req.user.id }),
    })

    res.status(200).json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        pendingVerificationTasks,
        completedTasks,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getTaskById = async (req, res, next) => {
  try {
    const task = await getTaskDetails(req.params.id)

    if (!task) {
      return next(errorHandler(404, "Task not found!"))
    }

    if (req.user.role !== "admin" && !isTaskAssignedToUser(task, req.user.id)) {
      return next(errorHandler(403, "Unauthorized"))
    }

    res.status(200).json({
      ...task._doc,
      risk: calculateDeadlineRisk(task),
    })
  } catch (error) {
    next(error)
  }
}

export const getNextBestTaskForCurrentUser = async (req, res, next) => {
  try {
    const nextBestTask = await getUserNextBestTask(req.user.id)

    res.status(200).json({ nextBestTask })
  } catch (error) {
    next(error)
  }
}

export const submitTaskForVerification = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return next(errorHandler(404, "Task not found!"))
    }

    if (req.user.role === "admin" || !isTaskAssignedToUser(task, req.user.id)) {
      return next(errorHandler(403, "Only assigned members can submit work"))
    }

    if (task.status === "Pending Verification") {
      return next(errorHandler(409, "This task is already awaiting verification"))
    }

    if (task.status === "Completed") {
      return next(errorHandler(409, "Completed tasks cannot be resubmitted"))
    }

    if (task.status !== "In Progress") {
      return next(
        errorHandler(409, "Start the task before submitting it for verification")
      )
    }

    const submission = getSubmissionInput(req.body)

    if (submission.error) {
      return next(errorHandler(400, submission.error))
    }

    const submittedAt = new Date()

    task.verification = {
      ...submission,
      submittedBy: req.user.id,
      submittedAt,
      lastReview: undefined,
    }
    task.verificationHistory = Array.isArray(task.verificationHistory)
      ? task.verificationHistory
      : []
    task.verificationHistory.push({
      event: "Submitted",
      ...submission,
      submittedBy: req.user.id,
      occurredAt: submittedAt,
    })
    task.status = "Pending Verification"

    await task.save()

    const updatedTask = await getTaskDetails(task._id)

    res.status(200).json({
      message: "Task submitted for verification",
      task: { ...updatedTask._doc, risk: calculateDeadlineRisk(updatedTask) },
    })
  } catch (error) {
    next(error)
  }
}

const reviewTaskVerification = async (req, res, next, decision) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return next(errorHandler(404, "Task not found!"))
    }

    if (task.status !== "Pending Verification") {
      return next(errorHandler(409, "This task is not awaiting verification"))
    }

    const verification = task.verification
    const attachments = Array.isArray(verification?.attachments)
      ? verification.attachments
      : []

    if (!verification?.submittedAt || (!verification?.workUrl && attachments.length === 0)) {
      return next(errorHandler(409, "This verification request has no submission data"))
    }

    const feedback =
      typeof req.body?.feedback === "string" ? req.body.feedback.trim() : ""

    if (decision === "Rejected" && !feedback) {
      return next(errorHandler(400, "Rejection feedback is required"))
    }

    if (feedback.length > 2000) {
      return next(errorHandler(400, "Feedback must be 2000 characters or fewer"))
    }

    const reviewedAt = new Date()
    task.verification.lastReview = {
      decision,
      feedback,
      reviewer: req.user.id,
      reviewedAt,
    }
    task.verificationHistory = Array.isArray(task.verificationHistory)
      ? task.verificationHistory
      : []
    task.verificationHistory.push({
      event: decision,
      workUrl: verification.workUrl,
      attachments,
      comment: verification.comment,
      feedback,
      submittedBy: verification.submittedBy,
      reviewer: req.user.id,
      occurredAt: reviewedAt,
    })

    if (decision === "Approved") {
      task.status = "Completed"
      task.progress = 100
      markTaskChecklistComplete(task)
    } else {
      task.status = "In Progress"
    }

    await task.save()

    const updatedTask = await getTaskDetails(task._id)

    res.status(200).json({
      message:
        decision === "Approved"
          ? "Task verification approved"
          : "Task verification rejected",
      task: { ...updatedTask._doc, risk: calculateDeadlineRisk(updatedTask) },
    })
  } catch (error) {
    next(error)
  }
}

export const approveTaskVerification = (req, res, next) =>
  reviewTaskVerification(req, res, next, "Approved")

export const rejectTaskVerification = (req, res, next) =>
  reviewTaskVerification(req, res, next, "Rejected")

export const getVerificationRequests = async (req, res, next) => {
  try {
    const verificationRequests = await findVerificationRequests()
    res.status(200).json({ verificationRequests })
  } catch (error) {
    next(error)
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return next(errorHandler(404, "Task not found!"))
    }

    task.title = req.body.title || task.title
    task.description = req.body.description || task.description
    task.priority = req.body.priority || task.priority
    task.dueDate = req.body.dueDate || task.dueDate
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist
    task.attachments = req.body.attachments || task.attachments

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return next(
          errorHandler(400, "assignedTo must be an array of user IDs")
        )
      }

      task.assignedTo = req.body.assignedTo
    }

    const updatedTask = await task.save()

    return res
      .status(200)
      .json({
        updatedTask: {
          ...updatedTask._doc,
          risk: calculateDeadlineRisk(updatedTask),
        },
        message: "Task updated successfully!",
      })
  } catch (error) {
    next(error)
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return next(errorHandler(404, "Task not found!"))
    }

    await task.deleteOne()

    res.status(200).json({ message: "Task deleted successfully!" })
  } catch (error) {
    next(error)
  }
}

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return next(errorHandler(404, "Task not found!"))
    }

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user.id.toString()
    )

    if (!isAssigned && req.user.role !== "admin") {
      return next(errorHandler(403, "Unauthorized"))
    }

    const requestedStatus = req.body?.status
    const normalizedRequestedStatus = String(requestedStatus || "")
      .trim()
      .toLowerCase()

    if (
      req.user.role !== "admin" &&
      ["completed", "pending verification"].includes(normalizedRequestedStatus)
    ) {
      return next(
        errorHandler(
          403,
          "Tasks must be submitted for verification before they can be completed"
        )
      )
    }

    if (!TASK_STATUSES.includes(requestedStatus)) {
      return next(errorHandler(400, "Invalid task status"))
    }

    if (["Completed", "Pending Verification"].includes(requestedStatus)) {
      return next(
        errorHandler(
          409,
          "Use the verification workflow to submit or complete a task"
        )
      )
    }

    if (task.status === "Pending Verification" && req.user.role !== "admin") {
      return next(
        errorHandler(409, "This task is already awaiting verification")
      )
    }

    task.status = requestedStatus

    await task.save()

    res.status(200).json({
      message: "Task status updated",
      task: { ...task._doc, risk: calculateDeadlineRisk(task) },
    })
  } catch (error) {
    next(error)
  }
}

export const updateTaskChecklist = async (req, res, next) => {
  try {
    const { todoChecklist } = req.body

    if (!Array.isArray(todoChecklist)) {
      return next(errorHandler(400, "todoChecklist must be an array"))
    }

    const task = await Task.findById(req.params.id)

    if (!task) {
      return next(errorHandler(404, "Task not found!"))
    }

    if (!isTaskAssignedToUser(task, req.user.id) && req.user.role !== "admin") {
      return next(errorHandler(403, "Not authorized to update checklist"))
    }

    if (["Pending Verification", "Completed"].includes(task.status)) {
      return next(
        errorHandler(
          409,
          "Checklist changes are unavailable while a task is awaiting review or completed"
        )
      )
    }

    task.todoChecklist = todoChecklist

    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length

    const totalItems = task.todoChecklist.length

    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

    //   4 task, 1 complete  completedCount / totalItems = (1/4 ) * 100= 25

    if (task.progress > 0) {
      task.status = "In Progress"
    } else {
      task.status = "Pending"
    }

    await task.save()

    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    )

    res
      .status(200)
      .json({
        message: "Task checklist updated",
        task: {
          ...updatedTask._doc,
          risk: calculateDeadlineRisk(updatedTask),
        },
      })
  } catch (error) {
    next(error)
  }
}

export const getDashboardData = async (req, res, next) => {
  try {
    // Fetch statistics
    const totalTasks = await Task.countDocuments()
    const pendingTasks = await Task.countDocuments({ status: "Pending" })
    const completedTasks = await Task.countDocuments({ status: "Completed" })
    const overdueTasks = await Task.countDocuments({
      status: { $nin: ["Completed", "Pending Verification"] },
      dueDate: { $lt: new Date() },
    })

    const taskStatuses = [
      "Pending",
      "In Progress",
      "Pending Verification",
      "Completed",
    ]

    const taskDistributionRaw = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "") //remove spaces for response keys

      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0

      return acc
    }, {})

    taskDistribution["All"] = totalTasks

    const taskPriorities = ["Low", "Medium", "High"]

    const taskPriorityLevelRaw = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ])

    const taskPriorityLevel = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0

      return acc
    }, {})

    // Fetch recent 10 tasks
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt")

    const verificationRequests = await findVerificationRequests()

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevel,
      },

      recentTasks,
      verificationRequests,
    })
  } catch (error) {
    next(error)
  }
}

export const userDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id

    // console.log(userId)

    // Convert userId to ObjectId for proper matching
    const userObjectId = new mongoose.Types.ObjectId(userId)

    // console.log(userObjectId)

    // fetch statistics for user-specific tasks
    const totalTasks = await Task.countDocuments({ assignedTo: userId })
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    })
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    })
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $nin: ["Completed", "Pending Verification"] },
      dueDate: { $lt: new Date() },
    })

    // Task distribution by status
    const taskStatuses = [
      "Pending",
      "In Progress",
      "Pending Verification",
      "Completed",
    ]

    const taskDistributionRaw = await Task.aggregate([
      {
        $match: { assignedTo: userObjectId },
      },
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ])

    // console.log(taskDistributionRaw)

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "")

      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0

      return acc
    }, {})

    taskDistribution["All"] = totalTasks

    // Task distribution by priority
    const taskPriorities = ["Low", "Medium", "High"]

    const taskPriorityLevelRaw = await Task.aggregate([
      { $match: { assignedTo: userObjectId } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ])

    const taskPriorityLevel = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0

      return acc
    }, {})

    const recentTasks = await Task.find({ assignedTo: userObjectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt")

    const nextBestTask = await getUserNextBestTask(userObjectId)

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevel,
      },
      recentTasks,
      nextBestTask,
    })
  } catch (error) {
    next(error)
  }
}
