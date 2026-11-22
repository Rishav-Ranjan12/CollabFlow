import React, { useState } from "react"
import AuthLayout from "../../components/AuthLayout"
import { FaEyeSlash } from "react-icons/fa6"
import { FaEye } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { validateEmail } from "../../utils/helper"
import ProfilePhotoSelector from "../../components/ProfilePhotoSelector"
import axiosInstance from "../../utils/axioInstance"
import uploadImage from "../../utils/uploadImage"

const SignUp = () => {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [profilePic, setProfilePic] = useState(null)
  const [adminInviteToken, setAdminInviteToken] = useState("")
  const [showAdminInviteToken, setShowAdminInviteToken] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    let profileImageUrl = ""

    if (!fullName) {
      setError("Please enter the name")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!password) {
      setError("Please enter the password")
      return
    }

    setError(null)

    try {
      if (profilePic) {
        const imageUploadRes = await uploadImage(profilePic)
        profileImageUrl = imageUploadRes.imageUrl || ""
      }

      const response = await axiosInstance.post("/auth/sign-up", {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminJoinCode: adminInviteToken.trim(),
      })

      if (response.data) {
        navigate("/login")
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message)
      } else {
        setError("Something went wrong. Please try again!")
      }
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-slate-900">Create your account</h1>
        <p className="mt-2 text-[15px] text-slate-500">Set up your profile and start managing work with your team.</p>

        <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div>
            <label htmlFor="fullName" className="app-label">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="app-input"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="app-label">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-input"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="app-label">
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input pr-12"
                placeholder="Choose a secure password"
                required
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="adminInviteTokem" className="app-label">
              Admin Invite Token
            </label>

            <div className="relative">
              <input
                id="adminInviteTokem"
                type={showAdminInviteToken ? "text" : "password"}
                value={adminInviteToken}
                onChange={(e) => setAdminInviteToken(e.target.value)}
                className="app-input pr-12"
                placeholder="Leave blank for a member account"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700"
                onClick={() =>
                  setShowAdminInviteToken(!showAdminInviteToken)
                }
              >
                {showAdminInviteToken ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <p className="app-helper">
              Leave this empty to create a member account. Add the invite token
              only when you need admin access.
            </p>
          </div>

          {error && <div className="app-error">{error}</div>}

          <button type="submit" className="app-button w-full">
            Sign Up
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to={"/login"} className="font-semibold text-blue-600 hover:text-blue-800">
            Sign in instead
          </Link>
        </p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default SignUp
