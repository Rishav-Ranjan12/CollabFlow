import React from "react"

const AvatarGroup = ({ avatars = [], maxVisible = 3 }) => {
  return (
    <div className="flex items-center">
      {avatars.slice(0, maxVisible).map((avatar, index) => (
        <img
          key={index}
          src={avatar}
          alt={`Avatar-${index + 1}`}
          className="-ml-2 h-8 w-8 rounded-full border-2 border-white bg-slate-100 object-cover first:ml-0"
        />
      ))}
      {avatars.length > maxVisible && (
        <div className="-ml-2 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600">
          +{avatars.length - maxVisible}
        </div>
      )}
    </div>
  )
}

export default AvatarGroup
