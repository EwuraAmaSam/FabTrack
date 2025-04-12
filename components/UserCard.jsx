"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Mail, Phone } from "lucide-react"

export default function UserCard({ user }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role}
            </Badge>
            <Badge variant={user.status === "active" ? "success" : "destructive"}>
              {user.status}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Phone className="h-4 w-4" />
          <span>{user.phone || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
      </div>
    </div>
  )
}