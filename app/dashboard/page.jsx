"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getAllRequests, getPendingRequests } from "@/lib/api"
import RequestCard from "@/components/request-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Dashboard() {
  const { user, isLoading: authLoading, isUsingMockData } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setIsLoading(true)
          const [allRequestsData, pendingRequestsData] = await Promise.all([getAllRequests(), getPendingRequests()])
          setRequests(allRequestsData)
          setPendingRequests(pendingRequestsData)
        } catch (error) {
          console.error("Error fetching requests:", error)
          // Set empty arrays as fallback
          setRequests([])
          setPendingRequests([])
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (authLoading || !user) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {isUsingMockData && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-600">Demo Mode Active</AlertTitle>
          <AlertDescription>
            You are currently using demo data. The backend service could not be reached.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>

        {user.role === "student" && (
          <Link href="/borrow">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Request Equipment
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Requests</CardTitle>
            <CardDescription>All equipment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Requests</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Status</CardTitle>
            <CardDescription>Account standing</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="success" className="text-sm">
              Good Standing
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          {user.role === "admin" && <TabsTrigger value="overdue">Overdue</TabsTrigger>}
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} isAdmin={user.role === "admin"} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No requests found</p>
              {user.role === "student" && (
                <Link href="/borrow">
                  <Button variant="outline" className="mt-4">
                    Request Equipment
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} isAdmin={user.role === "admin"} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending requests</p>
            </div>
          )}
        </TabsContent>

        {user.role === "admin" && (
          <TabsContent value="overdue">
            <div className="text-center py-8">
              <p className="text-gray-500">No overdue requests</p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

