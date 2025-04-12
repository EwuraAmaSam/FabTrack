// app/admin/equipment/new/page.jsx
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
    try {
      const response = await fetch('/api/equipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          category: "General",
          available: true,
          quantity: 1
        })
      })

      if (!response.ok) {
        throw new Error("Failed to add equipment")
      }

      toast({
        title: "Success",
        description: `${name} has been added to inventory`,
      })
      router.push("/admin")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add equipment",
      })
    } finally {
      setIsLoading(false)
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
