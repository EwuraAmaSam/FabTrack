"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"

export default function AddEquipmentPage() {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)

    // Get the token from localStorage
    const token = localStorage.getItem('authToken'); 

    // If token doesn't exist, show error and stop loading
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No authentication token found. Please log in.",
      })
      setIsLoading(false) // Stop loading state
      return;
    }

    try {
      // Make the POST request with the Authorization header
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/equipment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Add token here
          },
          body: JSON.stringify({ name: name.trim() }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to add equipment")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: `${name} has been added to inventory`,
      })

      // Redirect back to the equipment admin page after success
      router.push("/admin")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add equipment",
      })
    } finally {
      setIsLoading(false) // Stop loading state
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        onClick={() => router.push("/admin")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Equipment
      </Button>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter equipment name"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => router.push("/admin")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : "Add Equipment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
