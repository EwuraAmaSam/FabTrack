"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, AlertTriangle, Users, Laptop, Clock, Check, X } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import RequestCard from "@/components/request-card"
import UserCard from "@/components/UserCard"
import EquipmentCard from "@/components/EquipmentCard"
import { useToast } from "@/components/ui/use-toast"

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isUsingMockData } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("requests")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEquipment: 0,
    pendingRequests: 0,
    overdueItems: 0
  })
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [equipment, setEquipment] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['requests', 'users', 'equipment'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

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
          const [usersRes, equipmentRes, requestsRes] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/equipments'),
            fetch('/api/requests')
          ])

          const usersData = await usersRes.json()
          const equipmentData = await equipmentRes.json()
          const requestsData = await requestsRes.json()

          setUsers(usersData)
          setEquipment(equipmentData)
          setRequests(requestsData)

          setStats({
            totalUsers: usersData.length,
            totalEquipment: equipmentData.length,
            pendingRequests: requestsData.filter(r => r.status === 'pending').length,
            overdueItems: requestsData.filter(r => new Date(r.dueDate) < new Date() && r.status === 'approved').length
          })

          if (searchParams.get('added')) {
            toast({
              title: "Equipment Added",
              description: "New equipment was successfully added",
            })
          }
        } catch (error) {
          console.error("Error fetching admin data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, searchParams, toast])

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action })
      })

      if (response.ok) {
        setRequests(requests.map(req =>
          req.id === requestId ? { ...req, status: action } : req
        ))
        setStats(prev => ({
          ...prev,
          pendingRequests: action === 'pending' ? prev.pendingRequests + 1 :
            prev.pendingRequests - 1
        }))
      }
    } catch (error) {
      console.error("Error updating request:", error)
    }
  }

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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-[#AC3333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> Users
            </CardTitle>
            <CardDescription>Total registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#373839]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Laptop className="h-5 w-5" /> Equipment
            </CardTitle>
            <CardDescription>Total inventory items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEquipment}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#AC3333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" /> Pending
            </CardTitle>
            <CardDescription>Requests awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#373839]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Overdue
            </CardTitle>
            <CardDescription>Items past due date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overdueItems}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isAdmin={true}
                  onApprove={() => handleRequestAction(request.id, 'approved')}
                  onReject={() => handleRequestAction(request.id, 'rejected')}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No requests found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment">
          <div className="flex justify-end mb-4">
            <Link href="/addequipment">
              <Button className="flex items-center gap-2 bg-[#AC3333] hover:bg-[#8a2a2a]">
                <Plus className="h-4 w-4" /> Add Equipment
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : equipment.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map((item) => (
                <EquipmentCard key={item.id} equipment={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No equipment found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
