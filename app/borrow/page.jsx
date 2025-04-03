"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, X } from "lucide-react"
import { getEquipment, requestBorrow } from "@/lib/api"
import Link from "next/link"

export default function BorrowPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [equipment, setEquipment] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState([])
  const [purpose, setPurpose] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (authLoading) {
      return // Don't proceed if the auth state is still loading
    }

    if (!user) {
      router.push("/login") // Redirect to login if no user
    } else if (user && user.role !== "student") {
      router.push("/dashboard") // Redirect to dashboard if the user is not a student
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setIsLoading(true)
        const data = await getEquipment()
        setEquipment(data)
      } catch (error) {
        console.error("Error fetching equipment:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load equipment. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchEquipment()
    }
  }, [user, toast])

  const filteredEquipment = equipment.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectItem = (item) => {
    if (selectedItems.some((selected) => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter((selected) => selected.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No items selected",
        description: "Please select at least one item to borrow.",
      })
      return
    }

    if (!purpose.trim()) {
      toast({
        variant: "destructive",
        title: "Purpose required",
        description: "Please provide a purpose for borrowing these items.",
      })
      return
    }

    if (!returnDate) {
      toast({
        variant: "destructive",
        title: "Return date required",
        description: "Please specify when you plan to return the items.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await requestBorrow({
        items: selectedItems.map((item) => item.id),
        purpose,
        returnDate,
      })

      toast({
        title: "Request submitted",
        description: "Your equipment request has been submitted successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: error.message || "There was an error submitting your request.",
      })
    } finally {
      setIsSubmitting(false)
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
      <div className="mb-6">
        <Link href="/dashboard" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Request Equipment</h1>
        <p className="text-gray-600">Select the items you need for your project</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Equipment</CardTitle>
              <CardDescription>Browse and select items to borrow</CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search equipment..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredEquipment.length > 0 ? (
                <div className="space-y-4">
                  {filteredEquipment.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-md hover:bg-gray-50">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={selectedItems.some((selected) => selected.id === item.id)}
                        onCheckedChange={() => handleSelectItem(item)}
                      />
                      <div className="flex-1">
                        <label htmlFor={`item-${item.id}`} className="font-medium cursor-pointer">
                          {item.name}
                        </label>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                      <Badge variant={item.available ? "success" : "destructive"}>
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No equipment found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Request</CardTitle>
              <CardDescription>Selected items and request details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Selected Items ({selectedItems.length})</Label>
                  {selectedItems.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <span className="text-sm">{item.name}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No items selected</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Explain why you need these items..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnDate">Expected Return Date</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} className="w-full" disabled={selectedItems.length === 0 || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
