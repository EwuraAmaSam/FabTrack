"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { loginUser, logoutUser, getCurrentUser } from "@/lib/api"

// Create a context with default values
const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
  isUsingMockData: false,
})

// Check if we're running on the client side
const isClient = typeof window !== "undefined"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  useEffect(() => {
    // Skip authentication check during server-side rendering
    if (!isClient) {
      setIsLoading(false)
      return
    }

    const initAuth = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem("fabtrack_token")

        if (!token) {
          setUser(null)
          setIsLoading(false)
          return
        }

        // Try to get stored user first to avoid unnecessary API calls
        const storedUser = localStorage.getItem("fabtrack_current_user")
        const usingMock = localStorage.getItem("fabtrack_using_mock") === "true"

        if (storedUser) {
          setUser(JSON.parse(storedUser))
          setIsUsingMockData(usingMock)
          setIsLoading(false)
        }

        // Try to validate the token with the backend
        try {
          console.log("Attempting to authenticate with backend...")
          const userData = await getCurrentUser()
          if (userData) {
            console.log("Successfully authenticated with backend")
            setUser(userData)
            setIsUsingMockData(false)
            // Store user in localStorage for future use
            localStorage.setItem("fabtrack_current_user", JSON.stringify(userData))
            localStorage.setItem("fabtrack_using_mock", "false")
          }
        } catch (error) {
          console.error("Authentication error:", error)
          // If we already set the user from localStorage, keep it
          if (!storedUser) {
            setUser(null)
          }
          setIsUsingMockData(true)
          localStorage.setItem("fabtrack_using_mock", "true")
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    if (!isClient) {
      console.error("Cannot login during server-side rendering")
      return null
    }

    try {
      console.log("Attempting to login with backend...")
      const response = await loginUser(email, password)

      // The API returns a token and possibly user data
      if (response.token) {
        console.log("Login successful with backend")

        // If the response includes user data, use it
        // Otherwise, fetch the user data
        let userData = response.user

        if (!userData) {
          try {
            userData = await getCurrentUser()
          } catch (error) {
            console.error("Error fetching user data after login:", error)
            // Create a basic user object based on the email
            userData = {
              id: Date.now(),
              name: email.split("@")[0].replace(/[.]/g, " "),
              email: email,
              role: email.includes("admin") ? "admin" : "student",
            }
          }
        }

        setUser(userData)
        setIsUsingMockData(false)

        // Store user in localStorage
        localStorage.setItem("fabtrack_current_user", JSON.stringify(userData))
        localStorage.setItem("fabtrack_using_mock", "false")

        return userData
      } else {
        throw new Error("Login response did not include a token")
      }
    } catch (error) {
      console.error("Login error:", error)
      console.log("Falling back to mock authentication")

      // Create a demo user based on the email
      const demoUser = {
        id: `user_${Date.now()}`,
        name: email.split("@")[0].replace(/[.]/g, " "),
        email: email,
        role: email.includes("admin") ? "admin" : "student",
        major: "Computer Science",
        yearGroup: 2025,
      }

      setUser(demoUser)
      setIsUsingMockData(true)

      // Store the demo user
      localStorage.setItem("fabtrack_current_user", JSON.stringify(demoUser))
      localStorage.setItem("fabtrack_using_mock", "true")

      return demoUser
    }
  }

  const logout = async () => {
    if (!isClient) {
      console.error("Cannot logout during server-side rendering")
      return
    }

    try {
      if (!isUsingMockData) {
        console.log("Attempting to logout from backend...")
        await logoutUser()
        console.log("Logout successful from backend")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }

    // Always clear user state and localStorage
    setUser(null)
    setIsUsingMockData(false)
    localStorage.removeItem("fabtrack_current_user")
    localStorage.removeItem("fabtrack_using_mock")
    localStorage.removeItem("fabtrack_token")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isUsingMockData }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

