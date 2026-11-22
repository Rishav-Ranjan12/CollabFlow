import confetti from "../utils/confetti"
import React, { useState } from "react"
import moment from "moment"
import toast from "react-hot-toast"
import {
  FiCheckCircle,
  FiExternalLink,
  FiFileText,
  FiMessageSquare,
  FiXCircle,
} from "react-icons/fi"
import axiosInstance from "../utils/axioInstance"
import Modal from "./Modal"

const getPriorityTagColor = (priority) => {
  switch (priority) {
    case "High":
      return "border border-indigo-200 bg-indigo-50 text-indigo-800"
    case "Medium":
      return "border border-blue-100 bg-blue-50 text-blue-700"
    default:
      return "border border-slate-200 bg-slate-100 text-slate-600"
  }
}

const EvidenceLink = ({ href, label }) => {
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:border-blue-200 hover:bg-blue-100"
    >
      <FiExternalLink aria-hidden="true" />
      <span className="truncate">{label}</span>
    </a>
  )
}

const VerificationRequests = ({ requests, onReviewComplete }) => {
  const [review, setReview] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)
  const safeRequests = Array.isArray(requests) ? requests : []

  const openReview = (task, decision) => {
    setReview({ task, decision })
    setFeedback("")
  }

  const closeReview = (force = false) => {
    if (isReviewing && !force) return
    setReview(null)
    setFeedback("")
  }

  const submitReview = async () => {
    if (!review?.task?._id) return

    if (review.decision === "reject" && !feedback.trim()) {
      toast.error("Feedback is required when rejecting a submission")
      return
    }

    try {
      setIsReviewing(true)
      const response = await axiosInstance.put(
        `/tasks/${review.task._id}/verification/${review.decision}`,
        review.decision === "reject" ? { feedback } : {}
      )

      toast.success(
        review.decision === "approve"
          ? "Task approved and completed"
          : "Task returned for changes"
      )
      if (review.decision === "approve") confetti()
      closeReview(true)
      onReviewComplete?.(response.data?.task)
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to save the verification review"
      )
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className="section-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Review queue
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            Verification Requests
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Review submitted work and close tasks only after approval.
          </p>
        </div>

        <span className="status-pill border border-orange-100 bg-orange-50 text-orange-700">
          {safeRequests.length} awaiting review
        </span>
      </div>

      <div className="p-6">
        {safeRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {safeRequests.map((task) => {
              const verification = task?.verification || {}
              const attachments = Array.isArray(verification.attachments)
                ? verification.attachments
                : []

              return (
                <div
                  key={task._id}
                  className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {task.title || "Untitled task"}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Submitted by {verification?.submittedBy?.name || "an assigned member"}
                        {moment(verification?.submittedAt).isValid()
                          ? ` · ${moment(verification.submittedAt).fromNow()}`
                          : ""}
                      </p>
                    </div>

                    <span className={`priority-pill ${getPriorityTagColor(task.priority)}`}>
                      {task.priority || "Unspecified"} Priority
                    </span>
                  </div>

                  {verification.comment && (
                    <div className="mt-4 flex gap-3 rounded-lg border border-slate-200/70 bg-white/80 p-4">
                      <FiMessageSquare aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
                      <p className="text-sm leading-6 text-slate-600">
                        {verification.comment}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <EvidenceLink href={verification.workUrl} label="Open work URL" />
                    {attachments.map((attachment, index) => (
                      <EvidenceLink
                        key={`${attachment}-${index}`}
                        href={attachment}
                        label={`Attachment ${index + 1}`}
                      />
                    ))}
                    {!verification.workUrl && attachments.length === 0 && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                        <FiFileText aria-hidden="true" />
                        Submission evidence unavailable
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="app-button-danger"
                      onClick={() => openReview(task, "reject")}
                    >
                      <FiXCircle aria-hidden="true" className="text-base" />
                      Reject
                    </button>
                    <button
                      type="button"
                      className="app-button"
                      onClick={() => openReview(task, "approve")}
                    >
                      <FiCheckCircle aria-hidden="true" className="text-base" />
                      Approve
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
            <FiCheckCircle aria-hidden="true" className="mx-auto text-3xl text-emerald-600" />
            <h4 className="mt-3 text-xl font-semibold text-slate-900">
              No verification requests
            </h4>
            <p className="mt-2 text-sm text-slate-500">
              Submitted work will appear here when it is ready for review.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(review)}
        onClose={closeReview}
        title={review?.decision === "approve" ? "Approve task" : "Reject task"}
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-600">
            {review?.decision === "approve"
              ? "Approving this submission completes the task and marks its checklist as complete."
              : "Explain what needs to change. The assigned member will receive this feedback and can submit again."}
          </p>

          {review?.decision === "reject" && (
            <div>
              <label className="app-label" htmlFor="verification-feedback">
                Required feedback
              </label>
              <textarea
                id="verification-feedback"
                rows={5}
                maxLength={2000}
                className="app-textarea"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Describe the changes needed before this task can be approved."
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="app-button-ghost"
              onClick={closeReview}
              disabled={isReviewing}
            >
              Cancel
            </button>
            <button
              type="button"
              className={
                review?.decision === "approve" ? "app-button" : "app-button-danger"
              }
              onClick={submitReview}
              disabled={isReviewing}
            >
              {isReviewing
                ? "Saving..."
                : review?.decision === "approve"
                ? "Approve task"
                : "Reject with feedback"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default VerificationRequests
