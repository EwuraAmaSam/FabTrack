"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { approveRequest, returnRequest } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function RequestCard({ request, isAdmin }) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(request.status)
  const { toast } = useToast()

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await approveRequest(request.id)
      setStatus("approved")
      toast({
        title: "Request approved",
        description: "The borrow request has been approved successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: error.message || "There was an error approving the request.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturn = async () => {
    setIsLoading(true)
    try {
      await returnRequest(request.id)
      setStatus("returned")
      toast({
        title: "Items returned",
        description: "The borrowed items have been marked as returned.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: error.message || "There was an error processing the return.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "approved":
        return <Badge variant="success">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "returned":
        return <Badge variant="default">Returned</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">Request #{request.id}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Requested by: {request.userName} ({request.userEmail})
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Requested on: {format(new Date(request.requestDate), "PPP")} • Return by:{" "}
              {format(new Date(request.returnDate), "PPP")}
            </p>
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Purpose:</h4>
              <p className="text-sm">{request.purpose}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Items:</h4>
              <div className="flex flex-wrap gap-2">
                {request.items.map((item) => (
                  <Badge key={item.id} variant="outline" className="text-xs">
                    {item.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:items-end justify-center">
            <Link href={`/requests/${request.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>

            {isAdmin && status === "pending" && (
              <Button size="sm" onClick={handleApprove} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Processing
                  </>
                ) : (
                  "Approve Request"
                )}
              </Button>
            )}

            {isAdmin && status === "approved" && (
              <Button size="sm" variant="outline" onClick={handleReturn} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Processing
                  </>
                ) : (
                  "Mark as Returned"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

