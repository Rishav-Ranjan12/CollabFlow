import React from "react"
import { IoMdClose } from "react-icons/io"

const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl rise">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Action
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          >
            <IoMdClose className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 text-slate-700">{children}</div>
      </div>
    </div>
  )
}

export default Modal
