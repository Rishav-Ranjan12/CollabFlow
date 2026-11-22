import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import DashboardLayout from "../../components/DashboardLayout"
import axiosInstance from "../../utils/axioInstance"
import moment from "moment"
import StatCard from "../../components/StatCard"
import HeroScene from "../../components/HeroScene"
import CompletionRing from "../../components/CompletionRing"
import RecentTasks from "../../components/RecentTasks"
import CustomPieChart from "../../components/CustomPieChart"
import CustomBarChart from "../../components/CustomBarChart"
import FocusNow from "../../components/FocusNow"
import {
  MdOutlinePendingActions,
  MdOutlineTaskAlt,
  MdTrendingUp,
  MdVerified,
} from "react-icons/md"

const COLORS = ["#ef4444", "#eab308", "#f97316", "#22c55e"]

const UserDashboard = () => {
  const { currentUser } = useSelector((state) => state.user)

  const [dashboardData, setDashboardData] = useState([])
  const [pieChartData, setPieChartData] = useState([])
  const [barChartData, setBarChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState(false)

  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || {}
    const taskPriorityLevels = data?.taskPriorityLevel || {}

    setPieChartData([
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      {
        status: "Pending Verification",
        count: taskDistribution?.PendingVerification || 0,
      },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ])

    setBarChartData([
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ])
  }

  const getDashboardData = async () => {
    try {
      setDashboardError(false)
      const response = await axiosInstance.get("/tasks/user-dashboard-data")

      if (response.data) {
        setDashboardData(response.data)
        prepareChartData(response.data?.charts || null)
      }
    } catch (error) {
      console.log("Error fetching user dashboard data: ", error)
      setDashboardError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getDashboardData()

    return () => {}
  }, [])

  const dist = dashboardData?.charts?.taskDistribution || {}
  const total = dist.All || 0
  const donePct = total ? Math.round(((dist.Completed || 0) / total) * 100) : 0

  const stats = [
    { label: "Total tasks", value: total, icon: MdOutlineTaskAlt, tone: "indigo" },
    { label: "Pending", value: dist.Pending || 0, icon: MdOutlinePendingActions, tone: "amber" },
    { label: "In progress", value: dist.InProgress || 0, icon: MdTrendingUp, tone: "sky" },
    { label: "Completed", value: dist.Completed || 0, icon: MdVerified, tone: "emerald" },
  ]

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <div className="app-page-shell space-y-6">
        <div className="hero-panel rise p-7 sm:p-9">
          <HeroScene className="hero-scene" />
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="eyebrow-badge">My workspace</span>
              <h2 className="mt-5 text-3xl font-bold sm:text-[40px] sm:leading-[1.1]">
                Welcome back, {currentUser?.name?.split(" ")[0]}
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/65">
                {"Keep an eye on your assignments and progress for"}{" "}
                {moment().format("dddd, Do MMMM")}.
              </p>
            </div>
            <CompletionRing percent={donePct} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, i) => (
            <StatCard key={item.label} index={i} {...item} />
          ))}
        </div>

        <FocusNow
          recommendation={dashboardData?.nextBestTask}
          isLoading={isLoading}
          hasError={dashboardError}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="section-panel rise p-6" style={{ "--i": 5 }}>
            <h3 className="text-lg font-bold text-slate-900">Task distribution</h3>
            <p className="mb-4 mt-1 text-sm text-slate-500">What still needs attention and what is done.</p>
            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>

          <div className="section-panel rise p-6" style={{ "--i": 6 }}>
            <h3 className="text-lg font-bold text-slate-900">Priority levels</h3>
            <p className="mb-4 mt-1 text-sm text-slate-500">Which items deserve the most focus right now.</p>
            <CustomBarChart data={barChartData} />
          </div>
        </div>

        <RecentTasks tasks={dashboardData?.recentTasks} />
      </div>
    </DashboardLayout>
  )
}

export default UserDashboard
