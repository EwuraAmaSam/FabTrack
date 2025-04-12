"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const BASE_URL_API = process.env.NEXT_PUBLIC_BASE_URL_API;

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDemoAlert, setShowDemoAlert] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // const handleMockAdminLogin = () => {
  //   // Set mock admin data in localStorage
  //   localStorage.setItem("authToken", "mock-admin-token")
  //   localStorage.setItem("userRole", "admin")
  //   localStorage.setItem("fabtrack_using_mock", "true")
    
  //   // Set mock user in auth context if needed
  //   if (login) {
  //     login({
  //       email: "mockadmin@ashesi.edu.gh",
  //       role: "admin",
  //       name: "Mock Admin",
  //       isUsingMockData: true
  //     })
  //   }
    
  //   setShowDemoAlert(true)
  //   toast({
  //     title: "Mock Admin Login",
  //     description: "Using demo admin dashboard with mock data",
  //   })
    
  //   setTimeout(() => {
  //     router.push("/admin")
  //   }, 1500)
  // }

  // const handleSubmit = async (e) => {
  //   e.preventDefault()
  //   setIsLoading(true)
  //   setShowDemoAlert(false)

  //      // Mock admin credentials check
  //      if (email === "mockadmin@ashesi.edu.gh" && password === "mockpass123") {
  //       handleMockAdminLogin()
  //       setIsLoading(false)
  //       return
  //     }

  //   try {
  //     const response = await fetch(`${BASE_URL_API}/api/auth/login`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email, password }),
  //     })

  //     const data = await response.json()

  //     if (!response.ok) {
  //       throw new Error(data.message || "Login failed")
  //     }

  //     // ✅ Store token and role
  //     localStorage.setItem("authToken", data.token)
  //     if (data.role) {
  //       localStorage.setItem("userRole", data.role)
  //     }

  //     // ✅ Call auth context login if available
  //     if (login) {
  //       await login(email, password)
  //     }

  //     toast({
  //       title: "Login successful",
  //       description: "Redirecting to dashboard...",
  //     })

  //     // ✅ Handle mock/demo mode
  //     if (localStorage.getItem("fabtrack_using_mock") === "true") {
  //       setShowDemoAlert(true)
  //       setTimeout(() => {
  //         router.push("/dashboard")
  //       }, 2000)
  //     } else {
  //       // ✅ Role-based redirect
  //       if (data.role === "Admin") {
  //         router.push("/admin")
  //       } else {
  //         router.push("/dashboard")
  //       }
  //     }

  //   } catch (error) {
  //     console.error("Login error:", error)
  //     toast({
  //       variant: "destructive",
  //       title: "Login failed",
  //       description: error.message || "Invalid credentials. Please try again.",
  //     })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setShowDemoAlert(false)
  
    // Mock admin credentials check
    if (email === "mockadmin@ashesi.edu.gh" && password === "mockpass123") {
      handleMockAdminLogin()
      setIsLoading(false)
      return
    }
  
    try {
      const response = await fetch(`${BASE_URL_API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }
  
      // ✅ Store token and role
      localStorage.setItem("authToken", data.token)
      if (data.role) {
        localStorage.setItem("userRole", data.role)
      }
  
      // ✅ Call auth context login if available
      if (login) {
        await login(email, password)
      }
  
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      })
  
      // **Force redirection to the admin dashboard**
      router.push("/dashboard") // This will direct everyone to the admin dashboard regardless of their role.
  
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login to FabTrack</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {showDemoAlert && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Backend connection failed. Using demo mode with mock data.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@ashesi.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern=".+@ashesi\.edu\.gh"
                title="Please use your Ashesi email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}