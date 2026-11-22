import React from "react"
import HeroScene from "./HeroScene"

const PageBanner = ({ eyebrow, title, subtitle, children }) => (
  <div className="hero-panel rise p-7 sm:p-8">
    <HeroScene compact className="hero-scene hero-scene-sm" />
    <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div>
        <span className="eyebrow-badge">{eyebrow}</span>
        <h2 className="mt-4 text-3xl font-bold sm:text-[34px] sm:leading-[1.1]">{title}</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-7 text-white/65">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
)

export default PageBanner
