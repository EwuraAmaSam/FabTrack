"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Box, Calendar } from "lucide-react"
import Link from "next/link"

export default function EquipmentCard({ equipment }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{equipment.name}</h3>
          <p className="text-sm text-gray-600">{equipment.category}</p>
          <div className="mt-2">
            <Badge variant={equipment.available ? "success" : "destructive"}>
              {equipment.available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Box className="h-4 w-4" />
            <span>Qty: {equipment.quantity}</span>
          </div>
        </div>
        <Link href={`/admin/equipment/${equipment.id}`}>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </Link>
      </div>
    </div>
  )
}