import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axioInstance"
import PageBanner from "../../components/PageBanner"
import DashboardLayout from "../../components/DashboardLayout"
import { FaFileAlt } from "react-icons/fa"
import UserCard from "../../components/UserCard"
import toast from "react-hot-toast"

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([])

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get("/users/get-users")

      if (response.data?.length > 0) {
        setAllUsers(response.data)
      }
    } catch (error) {
      console.log("Error fetching users: ", error)
    }
  }

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get("/reports/export/users", {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")

      link.href = url
      link.setAttribute("download", "user_details.xlsx")
      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.log("Error downloading user-details report: ", error)
      toast.error("Error downloading user-details report. Please try again!")
    }
  }

  useEffect(() => {
    getAllUsers()

    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu={"Team Members"}>
      <div className="app-page-shell space-y-6">
        <PageBanner eyebrow="Team directory" title="Team members" subtitle="See your people and how work is distributed across them.">
          <button type="button" className="app-button-secondary relative z-10" onClick={handleDownloadReport}>
            <FaFileAlt className="text-base" />
            Download report
          </button>
        </PageBanner>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {allUsers?.map((user, idx) => (
            <UserCard key={user._id} userInfo={user} index={idx} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers
