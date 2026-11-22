import express from "express"
import { adminOnly, verifyToken } from "../utils/verifyUser.js"
import {
  createTask,
  deleteTask,
  getDashboardData,
  getNextBestTaskForCurrentUser,
  getTaskById,
  getTasks,
  getVerificationRequests,
  approveTaskVerification,
  rejectTaskVerification,
  submitTaskForVerification,
  updateTask,
  updateTaskChecklist,
  updateTaskStatus,
  userDashboardData,
} from "../controller/task.controller.js"

const router = express.Router()

router.post("/create", verifyToken, adminOnly, createTask)

router.get("/", verifyToken, getTasks)

router.get("/dashboard-data", verifyToken, adminOnly, getDashboardData)

router.get("/user-dashboard-data", verifyToken, userDashboardData)

router.get("/next-best", verifyToken, getNextBestTaskForCurrentUser)

router.get(
  "/verification-requests",
  verifyToken,
  adminOnly,
  getVerificationRequests
)

router.post("/:id/submit-verification", verifyToken, submitTaskForVerification)

router.put(
  "/:id/verification/approve",
  verifyToken,
  adminOnly,
  approveTaskVerification
)

router.put(
  "/:id/verification/reject",
  verifyToken,
  adminOnly,
  rejectTaskVerification
)

router.get("/:id", verifyToken, getTaskById)

router.put("/:id", verifyToken, adminOnly, updateTask)

router.delete("/:id", verifyToken, adminOnly, deleteTask)

router.put("/:id/status", verifyToken, adminOnly, updateTaskStatus)

router.put("/:id/todo", verifyToken, updateTaskChecklist)

export default router
