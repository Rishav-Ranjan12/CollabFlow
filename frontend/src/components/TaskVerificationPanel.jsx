import React, { useState } from "react"
import moment from "moment"
import toast from "react-hot-toast"
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiLink,
  FiSend,
} from "react-icons/fi"
import axiosInstance from "../utils/axioInstance"
import AddAttachmentsInput from "./AddAttachmentsInput"

const EMPTY_SUBMISSION = {
  workUrl: "",
  attachments: [],
  comment: "",
}

const SubmissionLink = ({ href, label }) => {
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

const getEventStyle = (event) => {
  switch (event) {
    case "Approved":
      return "border-emerald-100 bg-emerald-50 text-emerald-700"
    case "Rejected":
      return "border-rose-100 bg-rose-50 text-rose-700"
    default:
      return "border-orange-100 bg-orange-50 text-orange-700"
  }
}

const TaskVerificationPanel = ({ task, onTaskUpdated }) => {
  const [submission, setSubmission] = useState(EMPTY_SUBMISSION)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const verification = task?.verification || {}
  const lastReview = verification?.lastReview
  const isPendingVerification = task?.status === "Pending Verification"
  const canSubmit = task?.status === "In Progress"
  const history = Array.isArray(task?.verificationHistory)
    ? [...task.verificationHistory].reverse()
    : []

  const submitForVerification = async (event) => {
    event.preventDefault()

    if (!submission.workUrl.trim() && submission.attachments.length === 0) {
      toast.error("Add a work URL or an attachment link before submitting")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await axiosInstance.post(
        `/tasks/${task._id}/submit-verification`,
        submission
      )

      if (response.data?.task) {
        onTaskUpdated(response.data.task)
        setSubmission(EMPTY_SUBMISSION)
      }

      toast.success("Task submitted for verification")
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to submit the task for verification"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="section-panel p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <FiCheckCircle className="text-lg text-orange-600" />
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Completion Verification
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Share your completed work for an admin to review before the task is closed.
            </p>
          </div>
        </div>

        {isPendingVerification && (
          <span className="status-pill border border-orange-100 bg-orange-50 text-orange-700">
            <FiClock aria-hidden="true" />
            Awaiting review
          </span>
        )}
      </div>

      {lastReview?.decision === "Rejected" && canSubmit && (
        <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50/80 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
            <FiAlertCircle aria-hidden="true" />
            Changes requested
          </div>
          <p className="mt-2 text-sm leading-6 text-rose-700">
            {lastReview.feedback || "Please address the review feedback and submit again."}
          </p>
        </div>
      )}

      {canSubmit ? (
        <form className="mt-6 space-y-5" onSubmit={submitForVerification}>
          <div>
            <label className="app-label" htmlFor="verification-work-url">
              Work URL <span className="text-slate-400">(optional with attachment)</span>
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200/70 bg-white/85 px-4 py-3">
              <FiLink aria-hidden="true" className="text-slate-400" />
              <input
                id="verification-work-url"
                type="url"
                value={submission.workUrl}
                onChange={(event) =>
                  setSubmission((current) => ({
                    ...current,
                    workUrl: event.target.value,
                  }))
                }
                placeholder="https://your-work-link.com"
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="app-label">
              Attachment links <span className="text-slate-400">(optional with work URL)</span>
            </label>
            <AddAttachmentsInput
              attachments={submission.attachments}
              setAttachments={(attachments) =>
                setSubmission((current) => ({ ...current, attachments }))
              }
            />
          </div>

          <div>
            <label className="app-label" htmlFor="verification-comment">
              Completion note <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="verification-comment"
              rows={4}
              maxLength={2000}
              value={submission.comment}
              onChange={(event) =>
                setSubmission((current) => ({
                  ...current,
                  comment: event.target.value,
                }))
              }
              placeholder="Briefly explain what was completed or anything the reviewer should know."
              className="app-textarea"
            />
          </div>

          <button
            className="app-button w-full sm:w-auto"
            type="submit"
            disabled={isSubmitting}
          >
            <FiSend aria-hidden="true" className="text-base" />
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      ) : isPendingVerification ? (
        <SubmissionSummary verification={verification} />
      ) : task?.status === "Completed" ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/75 p-5 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-semibold">
            <FiCheckCircle aria-hidden="true" />
            Task completed
          </div>
          <p className="mt-2 leading-6">
            {lastReview?.decision === "Approved"
              ? "This submission was approved by an administrator."
              : "This task was completed before verification records were added."}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50/75 p-5 text-sm leading-6 text-amber-800">
          Start work from the checklist to submit this task for verification.
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-7 border-t border-slate-200/70 pt-6">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Verification history
          </h4>

          <div className="mt-4 space-y-3">
            {history.map((entry) => (
              <div
                key={entry._id || `${entry.event}-${entry.occurredAt}`}
                className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`status-pill ${getEventStyle(entry.event)}`}>
                    {entry.event}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {moment(entry.occurredAt).isValid()
                      ? moment(entry.occurredAt).format("Do MMM YYYY, h:mm A")
                      : "Date unavailable"}
                  </span>
                </div>

                {entry.comment && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {entry.comment}
                  </p>
                )}

                {entry.feedback && (
                  <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700">
                    {entry.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const SubmissionSummary = ({ verification }) => {
  const attachments = Array.isArray(verification?.attachments)
    ? verification.attachments
    : []

  return (
    <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50/70 p-5">
      <p className="text-sm font-semibold text-orange-800">
        Your work has been sent for review.
      </p>
      <p className="mt-2 text-sm leading-6 text-orange-700">
        You&apos;ll be able to resubmit if the reviewer requests changes.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <SubmissionLink href={verification?.workUrl} label="Open work URL" />
        {attachments.map((attachment, index) => (
          <SubmissionLink
            key={`${attachment}-${index}`}
            href={attachment}
            label={`Attachment ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default TaskVerificationPanel
