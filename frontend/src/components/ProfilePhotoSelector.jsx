import React, { useRef, useState } from "react"
import { FaCamera } from "react-icons/fa"
import { MdDelete } from "react-icons/md"

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleImageChange = (event) => {
    const file = event.target.files[0]

    if (file) {
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setPreviewUrl(null)
  }

  const onChooseFile = () => {
    inputRef.current.click()
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <button
          type="button"
          className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50"
          onClick={onChooseFile}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="profile pic"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600">
              <FaCamera className="text-3xl" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Upload
              </span>
            </div>
          )}
        </button>

        {!image ? (
          <button
            type="button"
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg"
            onClick={onChooseFile}
          >
            <FaCamera className="text-sm" />
          </button>
        ) : (
          <button
            type="button"
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg"
            onClick={handleRemoveImage}
          >
            <MdDelete className="text-sm" />
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Add a profile image to personalize your workspace.
      </p>

      <input
        type="file"
        ref={inputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}

export default ProfilePhotoSelector
