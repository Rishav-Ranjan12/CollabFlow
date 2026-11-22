import express from "express"
import { adminOnly, verifyToken } from "../utils/verifyUser.js"
import {
  generateTaskDraft,
  getWorkloadInsights,
  suggestAssignees,
} from "../controller/ai.controller.js"

const router = express.Router()

router.post("/task-draft", verifyToken, adminOnly, generateTaskDraft)
router.post("/suggest-assignees", verifyToken, adminOnly, suggestAssignees)
router.get("/workload-insights", verifyToken, adminOnly, getWorkloadInsights)

export default router
