import React, { useState } from "react"
import AuthLayout from "../../components/AuthLayout"
import { FaEyeSlash } from "react-icons/fa6"
import { FaEye } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { validateEmail } from "../../utils/helper"
import axiosInstance from "../../utils/axioInstance"
import { useDispatch, useSelector } from "react-redux"
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/slice/userSlice"

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)

  const { loading } = useSelector((state) => state.user)

  const handleSubmit = async (e) => {
    e.preventDefault()

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
      dispatch(signInStart())

      const response = await axiosInstance.post(
        "/auth/sign-in",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )

      if (response.data.role === "admin") {
        dispatch(signInSuccess(response.data))
        navigate("/admin/dashboard")
      } else {
        dispatch(signInSuccess(response.data))
        navigate("/user/dashboard")
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message)
        dispatch(signInFailure(error.response.data.message))
      } else {
        setError("Something went wrong. Please try again!")
        dispatch(signInFailure("Something went wrong. Please try again!"))
      }
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-[15px] text-slate-500">Sign in to pick up where your team left off.</p>

        <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Enter your password"
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

          {error && <div className="app-error">{error}</div>}

          {loading ? (
            <div className="app-button w-full animate-pulse opacity-80">
              Loading...
            </div>
          ) : (
            <button type="submit" className="app-button w-full">
              Login
            </button>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link to={"/signup"} className="font-semibold text-blue-600 hover:text-blue-800">
            Create one now
          </Link>
        </p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Login
